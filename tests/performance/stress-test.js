import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    // Normal load
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    
    // Spike to stress level
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    
    // Extreme stress
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    
    // Break point testing
    { duration: '2m', target: 400 },
    { duration: '5m', target: 400 },
    
    // Recovery testing
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    
    // Ramp down
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // More relaxed thresholds for stress testing
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    errors: ['rate<0.05'], // Error rate under 5%
    http_reqs: ['rate>5'], // At least 5 requests per second
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Simulate realistic user behavior under stress
  
  // Heavy dashboard load
  const dashboardResponse = http.get(`${BASE_URL}/api/dashboard/stats`);
  check(dashboardResponse, {
    'dashboard responds': (r) => r.status < 500,
    'dashboard under 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(0.5);

  // Multiple rapid requests (simulating impatient user)
  for (let i = 0; i < 3; i++) {
    const rapidResponse = http.get(`${BASE_URL}/api/participants`);
    check(rapidResponse, {
      'rapid request succeeds': (r) => r.status < 500,
    }) || errorRate.add(1);
    sleep(0.1);
  }

  // Large bulk operation
  const largeBulkData = {
    participants: Array.from({ length: 50 }, (_, i) => ({
      name: `Stress Test Participant ${i}`,
      ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
      email: `stress${i}@test.com`
    }))
  };
  
  const bulkResponse = http.post(
    `${BASE_URL}/api/participants/bulk`,
    JSON.stringify(largeBulkData),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s'
    }
  );
  
  check(bulkResponse, {
    'bulk operation handles stress': (r) => r.status < 500,
    'bulk completes within timeout': (r) => r.timings.duration < 30000,
  }) || errorRate.add(1);

  sleep(1);

  // Concurrent complex queries
  const promises = [
    http.asyncRequest('GET', `${BASE_URL}/api/dashboard/kpis/staff`),
    http.asyncRequest('GET', `${BASE_URL}/api/search?q=test&type=all`),
    http.asyncRequest('GET', `${BASE_URL}/api/analytics/performance`),
  ];

  sleep(2);

  // Memory-intensive operations
  const reportResponse = http.get(`${BASE_URL}/api/reports/generate?type=monthly&format=json`);
  check(reportResponse, {
    'report generation handles stress': (r) => r.status < 500,
  }) || errorRate.add(1);

  sleep(1);
}