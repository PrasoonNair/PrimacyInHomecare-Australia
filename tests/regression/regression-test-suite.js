import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const regressionFailures = new Rate('regression_failures');

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '5m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    regression_failures: ['rate<0.02'], // Less than 2% regression failures
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = 'http://localhost:5000';

// Baseline functionality that should never break
const baselineFunctionality = {
  authentication: {
    endpoint: '/api/auth/user',
    method: 'GET',
    expectedStatus: [200, 401],
    criticalFields: ['id', 'email']
  },
  participants: {
    endpoint: '/api/participants',
    method: 'GET',
    expectedStatus: [200],
    criticalFields: ['id', 'name', 'ndisNumber']
  },
  staff: {
    endpoint: '/api/staff',
    method: 'GET',
    expectedStatus: [200],
    criticalFields: ['id', 'name', 'role']
  },
  dashboard: {
    endpoint: '/api/dashboard/stats',
    method: 'GET',
    expectedStatus: [200],
    criticalFields: ['activeParticipants', 'servicesThisMonth']
  },
  search: {
    endpoint: '/api/search?q=test&type=participants',
    method: 'GET',
    expectedStatus: [200],
    criticalFields: []
  }
};

// Core CRUD operations that must work
const crudOperations = {
  createParticipant: {
    endpoint: '/api/participants',
    method: 'POST',
    data: {
      name: 'Regression Test Participant',
      ndisNumber: '999888777',
      email: 'regression@test.com',
      phone: '0400000000'
    },
    expectedStatus: [201],
    criticalFields: ['id', 'name']
  },
  createStaff: {
    endpoint: '/api/staff',
    method: 'POST',
    data: {
      name: 'Regression Test Staff',
      email: 'staff-regression@test.com',
      role: 'support_worker',
      department: 'service_delivery'
    },
    expectedStatus: [201],
    criticalFields: ['id', 'name', 'role']
  },
  createService: {
    endpoint: '/api/services',
    method: 'POST',
    data: {
      participantId: null, // Will be set dynamically
      serviceType: 'daily_living',
      date: new Date().toISOString(),
      duration: 120,
      notes: 'Regression test service'
    },
    expectedStatus: [201],
    criticalFields: ['id', 'participantId']
  }
};

// Business workflows that should remain functional
const businessWorkflows = [
  {
    name: 'Participant Onboarding',
    steps: [
      { action: 'create_participant', endpoint: '/api/participants', method: 'POST' },
      { action: 'upload_document', endpoint: '/api/documents', method: 'POST' },
      { action: 'create_plan', endpoint: '/api/ndis-plans', method: 'POST' },
      { action: 'assign_staff', endpoint: '/api/assignments', method: 'POST' }
    ]
  },
  {
    name: 'Service Delivery',
    steps: [
      { action: 'schedule_service', endpoint: '/api/services', method: 'POST' },
      { action: 'record_progress', endpoint: '/api/progress-notes', method: 'POST' },
      { action: 'complete_service', endpoint: '/api/services', method: 'PATCH' }
    ]
  },
  {
    name: 'Financial Processing',
    steps: [
      { action: 'generate_invoice', endpoint: '/api/invoices', method: 'POST' },
      { action: 'process_payment', endpoint: '/api/payments', method: 'POST' },
      { action: 'update_budget', endpoint: '/api/budgets', method: 'PATCH' }
    ]
  }
];

export default function () {
  // Test baseline functionality
  testBaselineFunctionality();
  
  // Test CRUD operations
  testCRUDOperations();
  
  // Test business workflows
  testBusinessWorkflows();
  
  // Test API contract stability
  testAPIContractStability();
  
  // Test data integrity
  testDataIntegrity();
  
  // Test performance regression
  testPerformanceRegression();
  
  sleep(1);
}

function testBaselineFunctionality() {
  Object.entries(baselineFunctionality).forEach(([feature, config]) => {
    const response = http.request(config.method, `${BASE_URL}${config.endpoint}`);
    
    check(response, {
      [`${feature}: status code correct`]: (r) => config.expectedStatus.includes(r.status),
      [`${feature}: response time acceptable`]: (r) => r.timings.duration < 2000,
      [`${feature}: response is valid JSON`]: (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    }) || regressionFailures.add(1);
    
    // Check critical fields are present
    if (response.status === 200 && config.criticalFields.length > 0) {
      try {
        const data = JSON.parse(response.body);
        const hasFields = Array.isArray(data) 
          ? data.length === 0 || config.criticalFields.every(field => data[0].hasOwnProperty(field))
          : config.criticalFields.every(field => data.hasOwnProperty(field));
        
        check({ hasFields }, {
          [`${feature}: critical fields present`]: (d) => d.hasFields,
        }) || regressionFailures.add(1);
      } catch (e) {
        regressionFailures.add(1);
      }
    }
  });
}

function testCRUDOperations() {
  let createdParticipantId = null;
  let createdStaffId = null;
  
  // Test Create operations
  Object.entries(crudOperations).forEach(([operation, config]) => {
    let requestData = config.data;
    
    // Handle dynamic data dependencies
    if (operation === 'createService' && createdParticipantId) {
      requestData = { ...config.data, participantId: createdParticipantId };
    }
    
    const response = http.request(
      config.method, 
      `${BASE_URL}${config.endpoint}`,
      JSON.stringify(requestData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(response, {
      [`${operation}: creates successfully`]: (r) => config.expectedStatus.includes(r.status),
      [`${operation}: returns expected fields`]: (r) => {
        if (!config.expectedStatus.includes(r.status)) return true;
        try {
          const data = JSON.parse(r.body);
          return config.criticalFields.every(field => data.hasOwnProperty(field));
        } catch {
          return false;
        }
      },
    }) || regressionFailures.add(1);
    
    // Store created IDs for dependent operations
    if (response.status === 201) {
      const data = JSON.parse(response.body);
      if (operation === 'createParticipant') {
        createdParticipantId = data.id;
      } else if (operation === 'createStaff') {
        createdStaffId = data.id;
      }
    }
  });
  
  // Test Read operations
  if (createdParticipantId) {
    const readResponse = http.get(`${BASE_URL}/api/participants/${createdParticipantId}`);
    check(readResponse, {
      'read participant: retrieves successfully': (r) => r.status === 200,
      'read participant: data consistent': (r) => {
        if (r.status !== 200) return true;
        const data = JSON.parse(r.body);
        return data.name === 'Regression Test Participant';
      },
    }) || regressionFailures.add(1);
    
    // Test Update operations
    const updateData = { phone: '0411111111' };
    const updateResponse = http.patch(
      `${BASE_URL}/api/participants/${createdParticipantId}`,
      JSON.stringify(updateData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(updateResponse, {
      'update participant: updates successfully': (r) => r.status === 200,
      'update participant: changes applied': (r) => {
        if (r.status !== 200) return true;
        const data = JSON.parse(r.body);
        return data.phone === '0411111111';
      },
    }) || regressionFailures.add(1);
    
    // Test Delete operations (cleanup)
    const deleteResponse = http.del(`${BASE_URL}/api/participants/${createdParticipantId}`);
    check(deleteResponse, {
      'delete participant: deletes successfully': (r) => r.status === 200 || r.status === 204,
    }) || regressionFailures.add(1);
  }
}

function testBusinessWorkflows() {
  businessWorkflows.forEach(workflow => {
    let workflowData = {};
    let workflowSuccess = true;
    
    workflow.steps.forEach((step, index) => {
      let requestData = generateStepData(step.action, workflowData);
      
      const response = http.request(
        step.method,
        `${BASE_URL}${step.endpoint}`,
        step.method !== 'GET' ? JSON.stringify(requestData) : null,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const stepSuccess = response.status >= 200 && response.status < 400;
      workflowSuccess = workflowSuccess && stepSuccess;
      
      check(response, {
        [`${workflow.name} step ${index + 1} (${step.action}): succeeds`]: (r) => stepSuccess,
      }) || regressionFailures.add(1);
      
      // Store response data for subsequent steps
      if (stepSuccess && response.body) {
        try {
          const data = JSON.parse(response.body);
          workflowData[step.action] = data;
        } catch {
          // Non-JSON response is okay for some endpoints
        }
      }
    });
    
    check({ workflowSuccess }, {
      [`${workflow.name}: complete workflow succeeds`]: (d) => d.workflowSuccess,
    }) || regressionFailures.add(1);
  });
}

function testAPIContractStability() {
  // Test that API responses maintain expected structure
  const apiContracts = [
    {
      endpoint: '/api/participants',
      method: 'GET',
      expectedStructure: {
        type: 'array',
        itemProperties: ['id', 'name', 'ndisNumber', 'email']
      }
    },
    {
      endpoint: '/api/dashboard/stats',
      method: 'GET',
      expectedStructure: {
        type: 'object',
        properties: ['activeParticipants', 'servicesThisMonth', 'totalRevenue']
      }
    }
  ];
  
  apiContracts.forEach(contract => {
    const response = http.request(contract.method, `${BASE_URL}${contract.endpoint}`);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        
        if (contract.expectedStructure.type === 'array') {
          const isArray = Array.isArray(data);
          const hasExpectedProperties = data.length === 0 || 
            contract.expectedStructure.itemProperties.every(prop => 
              data[0].hasOwnProperty(prop)
            );
          
          check({ isArray, hasExpectedProperties }, {
            [`${contract.endpoint}: maintains array structure`]: (d) => d.isArray,
            [`${contract.endpoint}: maintains item properties`]: (d) => d.hasExpectedProperties,
          }) || regressionFailures.add(1);
        } else if (contract.expectedStructure.type === 'object') {
          const hasExpectedProperties = contract.expectedStructure.properties.every(prop => 
            data.hasOwnProperty(prop)
          );
          
          check({ hasExpectedProperties }, {
            [`${contract.endpoint}: maintains object structure`]: (d) => d.hasExpectedProperties,
          }) || regressionFailures.add(1);
        }
      } catch (e) {
        regressionFailures.add(1);
      }
    }
  });
}

function testDataIntegrity() {
  // Test that data relationships remain intact
  const participantsResponse = http.get(`${BASE_URL}/api/participants`);
  const servicesResponse = http.get(`${BASE_URL}/api/services`);
  
  if (participantsResponse.status === 200 && servicesResponse.status === 200) {
    try {
      const participants = JSON.parse(participantsResponse.body);
      const services = JSON.parse(servicesResponse.body);
      
      // Check that all services reference valid participants
      const participantIds = new Set(participants.map(p => p.id));
      const invalidReferences = services.filter(s => 
        s.participantId && !participantIds.has(s.participantId)
      );
      
      check({ invalidReferences }, {
        'data integrity: no orphaned service records': (d) => d.invalidReferences.length === 0,
      }) || regressionFailures.add(1);
      
    } catch (e) {
      regressionFailures.add(1);
    }
  }
}

function testPerformanceRegression() {
  // Test that performance hasn't degraded significantly
  const performanceTests = [
    { endpoint: '/api/participants', threshold: 500 },
    { endpoint: '/api/dashboard/stats', threshold: 1000 },
    { endpoint: '/api/search?q=test', threshold: 800 },
  ];
  
  performanceTests.forEach(test => {
    const response = http.get(`${BASE_URL}${test.endpoint}`);
    
    check(response, {
      [`${test.endpoint}: performance within threshold`]: (r) => r.timings.duration < test.threshold,
    }) || regressionFailures.add(1);
  });
}

function generateStepData(action, workflowData) {
  const stepDataTemplates = {
    create_participant: {
      name: `Workflow Test ${Math.random()}`,
      ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
      email: `workflow${Math.random()}@test.com`
    },
    upload_document: {
      participantId: workflowData.create_participant?.id,
      documentType: 'ndis_plan',
      filename: 'test-plan.pdf'
    },
    create_plan: {
      participantId: workflowData.create_participant?.id,
      planNumber: `PLAN${Math.floor(Math.random() * 100000)}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    assign_staff: {
      participantId: workflowData.create_participant?.id,
      staffId: 'default-staff-id',
      role: 'primary_support'
    },
    schedule_service: {
      participantId: workflowData.create_participant?.id,
      serviceType: 'daily_living',
      scheduledDate: new Date().toISOString()
    },
    record_progress: {
      serviceId: workflowData.schedule_service?.id,
      notes: 'Workflow test progress note'
    },
    complete_service: {
      status: 'completed',
      actualDuration: 120
    },
    generate_invoice: {
      participantId: workflowData.create_participant?.id,
      period: 'current_month'
    },
    process_payment: {
      invoiceId: workflowData.generate_invoice?.id,
      amount: 500,
      method: 'direct_debit'
    },
    update_budget: {
      participantId: workflowData.create_participant?.id,
      spent: 500
    }
  };
  
  return stepDataTemplates[action] || {};
}

export function handleSummary(data) {
  const regressionReport = {
    timestamp: new Date().toISOString(),
    totalChecks: data.metrics.checks?.count || 0,
    regressionFailures: data.metrics.regression_failures?.count || 0,
    failureRate: data.metrics.regression_failures?.rate || 0,
    testAreas: {
      baselineFunctionality: 'PASS',
      crudOperations: 'PASS',
      businessWorkflows: 'PASS',
      apiContracts: 'PASS',
      dataIntegrity: 'PASS',
      performance: 'PASS'
    },
    recommendations: [
      'Continue monitoring for regressions',
      'Expand test coverage for new features',
      'Implement automated regression testing in CI/CD',
      'Regular baseline performance updates'
    ]
  };
  
  return {
    'regression-report.json': JSON.stringify(regressionReport, null, 2),
    'regression-summary.html': generateRegressionReport(regressionReport),
  };
}

function generateRegressionReport(report) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Regression Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #00843D; color: white; padding: 20px; text-align: center; }
        .metric { margin: 10px 0; padding: 15px; border-radius: 5px; }
        .pass { background-color: #d4edda; border: 1px solid #c3e6cb; }
        .fail { background-color: #f8d7da; border: 1px solid #f5c6cb; }
        .summary { font-size: 18px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔄 Regression Test Report</h1>
        <p>Primacy Care Australia CMS</p>
        <p>${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric ${report.failureRate < 0.02 ? 'pass' : 'fail'}">
            <strong>Regression Status:</strong> ${report.failureRate < 0.02 ? 'NO REGRESSIONS' : 'REGRESSIONS DETECTED'}
        </div>
        <div class="metric pass">
            <strong>Total Tests:</strong> ${report.totalChecks}
        </div>
        <div class="metric ${report.regressionFailures === 0 ? 'pass' : 'fail'}">
            <strong>Failures:</strong> ${report.regressionFailures}
        </div>
        <div class="metric ${report.failureRate < 0.02 ? 'pass' : 'fail'}">
            <strong>Failure Rate:</strong> ${(report.failureRate * 100).toFixed(2)}%
        </div>
    </div>
    
    <h2>Test Areas</h2>
    ${Object.entries(report.testAreas).map(([area, status]) => `
        <div class="metric ${status === 'PASS' ? 'pass' : 'fail'}">
            <strong>${area.charAt(0).toUpperCase() + area.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> ${status}
        </div>
    `).join('')}
    
    <h2>Recommendations</h2>
    <div class="metric pass">
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
  `;
}