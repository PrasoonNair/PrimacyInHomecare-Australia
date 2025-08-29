import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    // Ramp-up: Start with 1 user and scale to 50 users over 2 minutes
    { duration: '2m', target: 50 },
    // Stay at 50 users for 5 minutes
    { duration: '5m', target: 50 },
    // Ramp-up to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Stay at 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Ramp-down to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // API response time should be < 500ms for 95% of requests
    http_req_duration: ['p(95)<500'],
    // Error rate should be < 1%
    errors: ['rate<0.01'],
    // Request rate should be > 10 requests per second
    http_reqs: ['rate>10'],
  },
};

const BASE_URL = 'http://localhost:5000';

// Test data
const testParticipant = {
  name: `Load Test Participant ${Math.random()}`,
  ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
  email: `loadtest${Math.random()}@example.com`,
  phone: '0400000000',
  dateOfBirth: '1990-01-01',
  state: 'NSW'
};

const testStaff = {
  name: `Load Test Staff ${Math.random()}`,
  email: `staff${Math.random()}@example.com`,
  role: 'support_worker',
  department: 'service_delivery'
};

export default function () {
  // Test authentication endpoint
  const authResponse = http.get(`${BASE_URL}/api/auth/user`);
  check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test dashboard stats (heavy query)
  const statsResponse = http.get(`${BASE_URL}/api/dashboard/stats`);
  check(statsResponse, {
    'stats status is 200': (r) => r.status === 200,
    'stats response time < 1000ms': (r) => r.timings.duration < 1000,
    'stats has required fields': (r) => {
      const data = JSON.parse(r.body);
      return data.hasOwnProperty('activeParticipants') && 
             data.hasOwnProperty('servicesThisMonth');
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test participant list (database intensive)
  const participantsResponse = http.get(`${BASE_URL}/api/participants`);
  check(participantsResponse, {
    'participants status is 200': (r) => r.status === 200,
    'participants response time < 800ms': (r) => r.timings.duration < 800,
    'participants returns array': (r) => Array.isArray(JSON.parse(r.body)),
  }) || errorRate.add(1);

  sleep(1);

  // Test staff list
  const staffResponse = http.get(`${BASE_URL}/api/staff`);
  check(staffResponse, {
    'staff status is 200': (r) => r.status === 200,
    'staff response time < 600ms': (r) => r.timings.duration < 600,
  }) || errorRate.add(1);

  sleep(1);

  // Test create participant (write operation)
  const createParticipantResponse = http.post(
    `${BASE_URL}/api/participants`,
    JSON.stringify(testParticipant),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(createParticipantResponse, {
    'create participant status is 201': (r) => r.status === 201,
    'create participant response time < 1000ms': (r) => r.timings.duration < 1000,
    'participant has id': (r) => JSON.parse(r.body).hasOwnProperty('id'),
  }) || errorRate.add(1);

  let participantId = null;
  if (createParticipantResponse.status === 201) {
    participantId = JSON.parse(createParticipantResponse.body).id;
  }

  sleep(1);

  // Test create staff
  const createStaffResponse = http.post(
    `${BASE_URL}/api/staff`,
    JSON.stringify(testStaff),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(createStaffResponse, {
    'create staff status is 201': (r) => r.status === 201,
    'create staff response time < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);

  sleep(1);

  // Test search functionality (complex query)
  const searchResponse = http.get(`${BASE_URL}/api/search?q=test&type=participants`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(1);

  // Test KPI endpoint (aggregation heavy)
  const kpiResponse = http.get(`${BASE_URL}/api/dashboard/kpis/staff`);
  check(kpiResponse, {
    'kpi status is 200': (r) => r.status === 200,
    'kpi response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test bulk operations endpoint
  const bulkData = {
    participants: [
      { name: 'Bulk 1', ndisNumber: `${Math.random() * 1000000000}` },
      { name: 'Bulk 2', ndisNumber: `${Math.random() * 1000000000}` },
    ]
  };
  
  const bulkResponse = http.post(
    `${BASE_URL}/api/participants/bulk`,
    JSON.stringify(bulkData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(bulkResponse, {
    'bulk operation completes': (r) => r.status === 201 || r.status === 200,
    'bulk response time < 3000ms': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(2);

  // Cleanup: Delete created participant if successful
  if (participantId) {
    const deleteResponse = http.del(`${BASE_URL}/api/participants/${participantId}`);
    check(deleteResponse, {
      'delete participant status is 200': (r) => r.status === 200,
      'delete response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  }

  sleep(1);
}