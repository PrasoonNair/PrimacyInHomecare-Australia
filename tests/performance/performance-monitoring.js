import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';

// Custom metrics for monitoring
const databaseResponseTime = new Trend('database_response_time');
const memoryUsage = new Gauge('memory_usage');
const cpuUsage = new Gauge('cpu_usage');
const activeConnections = new Gauge('active_connections');
const cacheHitRate = new Rate('cache_hit_rate');
const errorsByType = new Counter('errors_by_type');

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    database_response_time: ['p(95)<500'],
    errors_by_type: ['count<50'],
    cache_hit_rate: ['rate>0.8'],
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Monitor system performance metrics
  monitorSystemMetrics();
  
  // Test API performance
  testAPIPerformance();
  
  // Test database performance
  testDatabasePerformance();
  
  // Test cache performance
  testCachePerformance();
  
  // Test memory usage patterns
  testMemoryUsage();
  
  sleep(1);
}

function monitorSystemMetrics() {
  // Get system metrics from monitoring endpoint
  const metricsResponse = http.get(`${BASE_URL}/api/system/metrics`);
  
  if (metricsResponse.status === 200) {
    try {
      const metrics = JSON.parse(metricsResponse.body);
      
      // Record system metrics
      if (metrics.memory) {
        memoryUsage.add(metrics.memory.used / metrics.memory.total * 100);
      }
      
      if (metrics.cpu) {
        cpuUsage.add(metrics.cpu.usage);
      }
      
      if (metrics.database) {
        activeConnections.add(metrics.database.activeConnections);
        databaseResponseTime.add(metrics.database.avgResponseTime);
      }
      
      if (metrics.cache) {
        cacheHitRate.add(metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses));
      }
      
    } catch (e) {
      errorsByType.add(1, { type: 'metrics_parsing' });
    }
  }
}

function testAPIPerformance() {
  // Test different API endpoints for performance patterns
  const endpoints = [
    { path: '/api/participants', weight: 40, type: 'read' },
    { path: '/api/staff', weight: 20, type: 'read' },
    { path: '/api/dashboard/stats', weight: 30, type: 'heavy_read' },
    { path: '/api/services', weight: 10, type: 'read' },
  ];
  
  endpoints.forEach(endpoint => {
    if (Math.random() * 100 < endpoint.weight) {
      const startTime = Date.now();
      const response = http.get(`${BASE_URL}${endpoint.path}`);
      const duration = Date.now() - startTime;
      
      check(response, {
        [`${endpoint.path} responds correctly`]: (r) => r.status === 200,
        [`${endpoint.path} responds quickly`]: (r) => r.timings.duration < getThresholdForType(endpoint.type),
      }) || errorsByType.add(1, { type: endpoint.type });
      
      // Record performance by endpoint type
      if (endpoint.type === 'heavy_read') {
        databaseResponseTime.add(duration);
      }
    }
  });
}

function testDatabasePerformance() {
  // Test database-heavy operations
  const dbOperations = [
    {
      name: 'participant_search',
      request: () => http.get(`${BASE_URL}/api/search?q=test&type=participants`),
      threshold: 800
    },
    {
      name: 'analytics_query',
      request: () => http.get(`${BASE_URL}/api/analytics/performance`),
      threshold: 2000
    },
    {
      name: 'bulk_insert',
      request: () => http.post(
        `${BASE_URL}/api/participants/bulk`,
        JSON.stringify({
          participants: Array.from({ length: 5 }, (_, i) => ({
            name: `Perf Test ${i}`,
            ndisNumber: `${Math.floor(Math.random() * 1000000000)}`,
            email: `perf${i}@test.com`
          }))
        }),
        { headers: { 'Content-Type': 'application/json' } }
      ),
      threshold: 3000
    }
  ];
  
  const operation = dbOperations[Math.floor(Math.random() * dbOperations.length)];
  const startTime = Date.now();
  const response = operation.request();
  const duration = Date.now() - startTime;
  
  check(response, {
    [`${operation.name} succeeds`]: (r) => r.status < 400,
    [`${operation.name} within threshold`]: (r) => r.timings.duration < operation.threshold,
  }) || errorsByType.add(1, { type: 'database_operation' });
  
  databaseResponseTime.add(duration);
}

function testCachePerformance() {
  // Test cache hit rates for frequently accessed data
  const cachedEndpoints = [
    '/api/participants',
    '/api/staff',
    '/api/dashboard/stats'
  ];
  
  cachedEndpoints.forEach(endpoint => {
    // First request (cache miss)
    const firstResponse = http.get(`${BASE_URL}${endpoint}`);
    const firstTime = firstResponse.timings.duration;
    
    sleep(0.1);
    
    // Second request (should be cache hit)
    const secondResponse = http.get(`${BASE_URL}${endpoint}`);
    const secondTime = secondResponse.timings.duration;
    
    // Cache hit if second request is significantly faster
    const isCacheHit = secondTime < firstTime * 0.5;
    cacheHitRate.add(isCacheHit ? 1 : 0);
    
    check(secondResponse, {
      [`${endpoint} cache improves performance`]: () => isCacheHit,
    });
  });
}

function testMemoryUsage() {
  // Test memory-intensive operations
  const memoryTestOperations = [
    {
      name: 'large_dataset_query',
      request: () => http.get(`${BASE_URL}/api/participants?limit=1000`),
    },
    {
      name: 'report_generation',
      request: () => http.get(`${BASE_URL}/api/reports/generate?type=monthly&format=json`),
    },
    {
      name: 'bulk_export',
      request: () => http.get(`${BASE_URL}/api/export/participants?format=csv`),
    }
  ];
  
  const operation = memoryTestOperations[Math.floor(Math.random() * memoryTestOperations.length)];
  
  // Get memory before operation
  const beforeMetrics = http.get(`${BASE_URL}/api/system/metrics`);
  let memoryBefore = 0;
  if (beforeMetrics.status === 200) {
    try {
      const data = JSON.parse(beforeMetrics.body);
      memoryBefore = data.memory ? data.memory.used : 0;
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Perform memory-intensive operation
  const response = operation.request();
  
  // Get memory after operation
  const afterMetrics = http.get(`${BASE_URL}/api/system/metrics`);
  let memoryAfter = 0;
  if (afterMetrics.status === 200) {
    try {
      const data = JSON.parse(afterMetrics.body);
      memoryAfter = data.memory ? data.memory.used : 0;
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  const memoryIncrease = memoryAfter - memoryBefore;
  
  check(response, {
    [`${operation.name} completes`]: (r) => r.status === 200,
    [`${operation.name} reasonable memory usage`]: () => memoryIncrease < 100 * 1024 * 1024, // Less than 100MB increase
  }) || errorsByType.add(1, { type: 'memory_issue' });
}

function getThresholdForType(type) {
  const thresholds = {
    'read': 300,
    'heavy_read': 1000,
    'write': 500,
    'complex': 2000
  };
  return thresholds[type] || 500;
}

export function handleSummary(data) {
  return {
    'performance-summary.json': JSON.stringify(data, null, 2),
    'performance-report.html': generateHTMLReport(data),
  };
}

function generateHTMLReport(data) {
  const metrics = data.metrics;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .passed { background-color: #d4edda; }
        .failed { background-color: #f8d7da; }
        .summary { font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="summary">
        <p>Test Duration: ${data.state.testRunDurationMs / 1000}s</p>
        <p>Virtual Users: ${data.root_group.checks.find(c => c.name.includes('virtual_users'))?.passes || 'N/A'}</p>
        <p>Total Requests: ${metrics.http_reqs?.count || 0}</p>
        <p>Error Rate: ${(metrics.http_req_failed?.rate * 100).toFixed(2)}%</p>
    </div>
    
    <h2>Response Time Metrics</h2>
    <div class="metric ${metrics.http_req_duration?.values?.['p(95)'] < 1000 ? 'passed' : 'failed'}">
        <strong>95th Percentile Response Time:</strong> ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2)}ms
    </div>
    
    <h2>Database Performance</h2>
    <div class="metric ${metrics.database_response_time?.values?.['p(95)'] < 500 ? 'passed' : 'failed'}">
        <strong>Database 95th Percentile:</strong> ${metrics.database_response_time?.values?.['p(95)']?.toFixed(2)}ms
    </div>
    
    <h2>Cache Performance</h2>
    <div class="metric ${metrics.cache_hit_rate?.rate > 0.8 ? 'passed' : 'failed'}">
        <strong>Cache Hit Rate:</strong> ${(metrics.cache_hit_rate?.rate * 100).toFixed(2)}%
    </div>
    
    <h2>System Resources</h2>
    <div class="metric">
        <strong>Average Memory Usage:</strong> ${metrics.memory_usage?.values?.avg?.toFixed(2)}%
    </div>
    <div class="metric">
        <strong>Average CPU Usage:</strong> ${metrics.cpu_usage?.values?.avg?.toFixed(2)}%
    </div>
    
    <h2>Error Analysis</h2>
    <div class="metric">
        <strong>Total Errors:</strong> ${metrics.errors_by_type?.count || 0}
    </div>
</body>
</html>
  `;
}