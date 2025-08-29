import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const dbOperations = new Counter('database_operations');
const responseTime = new Trend('response_time_trend');

export let options = {
  scenarios: {
    // Gradual scalability test
    gradual_scaling: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '5m', target: 50 },   // Scale to 50 users
        { duration: '5m', target: 100 },  // Scale to 100 users
        { duration: '5m', target: 200 },  // Scale to 200 users
        { duration: '5m', target: 500 },  // Scale to 500 users
        { duration: '5m', target: 1000 }, // Scale to 1000 users
        { duration: '5m', target: 500 },  // Scale back down
        { duration: '5m', target: 0 },    // Ramp down
      ],
    },
    
    // Constant load test
    constant_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m',
    },
    
    // Spike testing
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 1000 }, // Sudden spike
        { duration: '1m', target: 1000 },
        { duration: '10s', target: 100 },  // Quick recovery
      ],
    }
  },
  thresholds: {
    http_req_duration: [
      'p(50)<500',   // 50% of requests under 500ms
      'p(90)<1000',  // 90% of requests under 1s
      'p(95)<2000',  // 95% of requests under 2s
      'p(99)<5000',  // 99% of requests under 5s
    ],
    errors: ['rate<0.02'], // Error rate under 2%
    http_reqs: ['rate>20'], // Minimum 20 requests per second
  },
};

const BASE_URL = 'http://localhost:5000';

// Test scenarios with different data sizes
const scenarios = {
  small: { participants: 10, services: 50 },
  medium: { participants: 100, services: 500 },
  large: { participants: 1000, services: 5000 },
  xlarge: { participants: 10000, services: 50000 }
};

export function setup() {
  // Setup test data for scalability testing
  console.log('Setting up scalability test data...');
  
  // Create test datasets of different sizes
  const setupData = {};
  
  for (const [size, config] of Object.entries(scenarios)) {
    console.log(`Creating ${size} dataset: ${config.participants} participants`);
    
    // Create participants
    const participants = [];
    for (let i = 0; i < Math.min(config.participants, 100); i++) {
      const participantData = {
        name: `Scalability Test ${size} ${i}`,
        ndisNumber: `${size}${i.toString().padStart(6, '0')}`,
        email: `${size}${i}@scalability.test`
      };
      
      const response = http.post(
        `${BASE_URL}/api/participants`,
        JSON.stringify(participantData),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.status === 201) {
        participants.push(JSON.parse(response.body));
      }
    }
    
    setupData[size] = { participants };
  }
  
  return setupData;
}

export default function (data) {
  // Determine test scenario based on current VU count
  const vuCount = __VU;
  let scenario = 'small';
  
  if (vuCount > 500) scenario = 'xlarge';
  else if (vuCount > 200) scenario = 'large';
  else if (vuCount > 50) scenario = 'medium';
  
  // Test read operations scalability
  testReadOperations(scenario);
  
  // Test write operations scalability
  testWriteOperations(scenario);
  
  // Test complex operations scalability
  testComplexOperations(scenario);
  
  // Test concurrent operations
  testConcurrentOperations();
}

function testReadOperations(scenario) {
  const startTime = Date.now();
  
  // Test participant list with pagination
  const participantsResponse = http.get(`${BASE_URL}/api/participants?page=1&limit=50`);
  check(participantsResponse, {
    'participants list scales': (r) => r.status === 200,
    'participants response time acceptable': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(participantsResponse.timings.duration);
  
  sleep(0.1);
  
  // Test dashboard with different data volumes
  const dashboardResponse = http.get(`${BASE_URL}/api/dashboard/stats`);
  check(dashboardResponse, {
    'dashboard scales with data': (r) => r.status === 200,
    'dashboard aggregation performs': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(dashboardResponse.timings.duration);
  
  sleep(0.1);
  
  // Test search functionality scalability
  const searchResponse = http.get(`${BASE_URL}/api/search?q=${scenario}&type=participants&limit=20`);
  check(searchResponse, {
    'search scales with dataset': (r) => r.status === 200,
    'search performance maintained': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(searchResponse.timings.duration);
}

function testWriteOperations(scenario) {
  // Test single record creation scalability
  const participantData = {
    name: `Write Test ${scenario} ${Math.random()}`,
    ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
    email: `writetest${Math.random()}@scale.test`
  };
  
  const createResponse = http.post(
    `${BASE_URL}/api/participants`,
    JSON.stringify(participantData),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(createResponse, {
    'single create scales': (r) => r.status === 201,
    'create response time scales': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(createResponse.timings.duration);
  
  sleep(0.1);
  
  // Test batch operations scalability
  const batchSize = scenario === 'xlarge' ? 20 : scenario === 'large' ? 15 : 10;
  const batchData = {
    participants: Array.from({ length: batchSize }, (_, i) => ({
      name: `Batch ${scenario} ${i}`,
      ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
      email: `batch${i}@scale.test`
    }))
  };
  
  const batchResponse = http.post(
    `${BASE_URL}/api/participants/bulk`,
    JSON.stringify(batchData),
    { 
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );
  
  check(batchResponse, {
    'batch operations scale': (r) => r.status === 201,
    'batch processing time reasonable': (r) => r.timings.duration < 10000,
  }) || errorRate.add(1);
  
  dbOperations.add(batchSize);
  responseTime.add(batchResponse.timings.duration);
}

function testComplexOperations(scenario) {
  // Test complex queries and aggregations
  const analyticsResponse = http.get(`${BASE_URL}/api/analytics/performance?period=month`);
  check(analyticsResponse, {
    'analytics scale with data volume': (r) => r.status === 200,
    'complex queries perform under load': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(analyticsResponse.timings.duration);
  
  sleep(0.2);
  
  // Test report generation scalability
  const reportResponse = http.get(`${BASE_URL}/api/reports/generate?type=summary&format=json`);
  check(reportResponse, {
    'report generation scales': (r) => r.status === 200,
    'report processing time acceptable': (r) => r.timings.duration < 8000,
  }) || errorRate.add(1);
  
  dbOperations.add(1);
  responseTime.add(reportResponse.timings.duration);
}

function testConcurrentOperations() {
  // Test concurrent read/write operations
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/participants`],
    ['GET', `${BASE_URL}/api/staff`],
    ['GET', `${BASE_URL}/api/dashboard/stats`],
    ['POST', `${BASE_URL}/api/participants`, JSON.stringify({
      name: `Concurrent Test ${Math.random()}`,
      ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
      email: `concurrent${Math.random()}@test.com`
    }), { headers: { 'Content-Type': 'application/json' } }]
  ]);
  
  responses.forEach((response, index) => {
    check(response, {
      'concurrent operation succeeds': (r) => r.status < 400,
      'concurrent response time reasonable': (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);
    
    dbOperations.add(1);
    responseTime.add(response.timings.duration);
  });
}

export function teardown(data) {
  console.log('Cleaning up scalability test data...');
  
  // Cleanup test data
  for (const [size, testData] of Object.entries(data)) {
    if (testData.participants) {
      testData.participants.forEach(participant => {
        http.del(`${BASE_URL}/api/participants/${participant.id}`);
      });
    }
  }
  
  console.log('Scalability test cleanup completed');
}