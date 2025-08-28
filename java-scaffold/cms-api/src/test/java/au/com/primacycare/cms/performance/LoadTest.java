package au.com.primacycare.cms.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.datafaker.Faker;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.IntStream;

/**
 * Load testing for API endpoints
 * Tests system performance under concurrent load
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class LoadTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("primacy_cms_perf")
            .withUsername("test")
            .withPassword("test");
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private final Faker faker = new Faker();
    private final ExecutorService executor = Executors.newFixedThreadPool(50);
    private final List<String> createdParticipantIds = new CopyOnWriteArrayList<>();
    private final List<String> createdStaffIds = new CopyOnWriteArrayList<>();
    
    private String authToken;
    private HttpHeaders headers;
    
    @BeforeAll
    void setup() {
        // Get auth token
        authToken = getAuthToken();
        headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + authToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Pre-populate some data
        seedInitialData();
    }
    
    @AfterAll
    void cleanup() {
        executor.shutdown();
    }
    
    @Test
    @Order(1)
    @DisplayName("Load Test: Concurrent Participant Creation")
    void testConcurrentParticipantCreation() throws Exception {
        int numberOfRequests = 100;
        int concurrentThreads = 20;
        
        PerformanceMetrics metrics = new PerformanceMetrics("Participant Creation");
        CountDownLatch latch = new CountDownLatch(numberOfRequests);
        
        System.out.println("\n=== Starting Participant Creation Load Test ===");
        System.out.println("Requests: " + numberOfRequests);
        System.out.println("Concurrent Threads: " + concurrentThreads);
        
        Instant startTime = Instant.now();
        
        IntStream.range(0, numberOfRequests).forEach(i -> {
            executor.submit(() -> {
                try {
                    long requestStart = System.currentTimeMillis();
                    
                    Map<String, Object> participant = generateParticipant();
                    HttpEntity<Map<String, Object>> request = new HttpEntity<>(participant, headers);
                    
                    ResponseEntity<Map> response = restTemplate.exchange(
                        getUrl("/api/participants"),
                        HttpMethod.POST,
                        request,
                        Map.class
                    );
                    
                    long requestEnd = System.currentTimeMillis();
                    metrics.recordResponse(requestEnd - requestStart, response.getStatusCode());
                    
                    if (response.getStatusCode() == HttpStatus.CREATED) {
                        Map body = response.getBody();
                        if (body != null && body.containsKey("id")) {
                            createdParticipantIds.add(body.get("id").toString());
                        }
                    }
                } catch (Exception e) {
                    metrics.recordError();
                } finally {
                    latch.countDown();
                }
            });
        });
        
        latch.await(60, TimeUnit.SECONDS);
        Duration totalDuration = Duration.between(startTime, Instant.now());
        
        metrics.printSummary(totalDuration);
        
        // Assertions
        Assertions.assertTrue(metrics.getSuccessRate() > 0.95, 
            "Success rate should be > 95%, was: " + metrics.getSuccessRate());
        Assertions.assertTrue(metrics.getAverageResponseTime() < 500, 
            "Average response time should be < 500ms, was: " + metrics.getAverageResponseTime());
        Assertions.assertTrue(metrics.getP99ResponseTime() < 2000, 
            "P99 response time should be < 2000ms, was: " + metrics.getP99ResponseTime());
    }
    
    @Test
    @Order(2)
    @DisplayName("Load Test: Concurrent Read Operations")
    void testConcurrentReadOperations() throws Exception {
        int numberOfRequests = 500;
        int concurrentThreads = 50;
        
        PerformanceMetrics metrics = new PerformanceMetrics("Read Operations");
        CountDownLatch latch = new CountDownLatch(numberOfRequests);
        
        System.out.println("\n=== Starting Read Operations Load Test ===");
        System.out.println("Requests: " + numberOfRequests);
        System.out.println("Concurrent Threads: " + concurrentThreads);
        
        Instant startTime = Instant.now();
        
        IntStream.range(0, numberOfRequests).forEach(i -> {
            executor.submit(() -> {
                try {
                    long requestStart = System.currentTimeMillis();
                    
                    // Mix of different read operations
                    int operation = i % 4;
                    ResponseEntity<Map> response = switch (operation) {
                        case 0 -> // Get all participants
                            restTemplate.exchange(
                                getUrl("/api/participants?page=0&size=20"),
                                HttpMethod.GET,
                                new HttpEntity<>(headers),
                                Map.class
                            );
                        case 1 -> // Get specific participant
                            restTemplate.exchange(
                                getUrl("/api/participants/" + getRandomParticipantId()),
                                HttpMethod.GET,
                                new HttpEntity<>(headers),
                                Map.class
                            );
                        case 2 -> // Get all staff
                            restTemplate.exchange(
                                getUrl("/api/staff?page=0&size=20"),
                                HttpMethod.GET,
                                new HttpEntity<>(headers),
                                Map.class
                            );
                        default -> // Get dashboard stats
                            restTemplate.exchange(
                                getUrl("/api/dashboard/stats"),
                                HttpMethod.GET,
                                new HttpEntity<>(headers),
                                Map.class
                            );
                    };
                    
                    long requestEnd = System.currentTimeMillis();
                    metrics.recordResponse(requestEnd - requestStart, response.getStatusCode());
                    
                } catch (Exception e) {
                    metrics.recordError();
                } finally {
                    latch.countDown();
                }
            });
        });
        
        latch.await(60, TimeUnit.SECONDS);
        Duration totalDuration = Duration.between(startTime, Instant.now());
        
        metrics.printSummary(totalDuration);
        
        // Assertions for read operations
        Assertions.assertTrue(metrics.getSuccessRate() > 0.99, 
            "Read success rate should be > 99%, was: " + metrics.getSuccessRate());
        Assertions.assertTrue(metrics.getAverageResponseTime() < 100, 
            "Average read time should be < 100ms, was: " + metrics.getAverageResponseTime());
        Assertions.assertTrue(metrics.getP95ResponseTime() < 200, 
            "P95 read time should be < 200ms, was: " + metrics.getP95ResponseTime());
    }
    
    @Test
    @Order(3)
    @DisplayName("Load Test: Mixed Operations")
    void testMixedOperations() throws Exception {
        int numberOfRequests = 200;
        
        PerformanceMetrics metrics = new PerformanceMetrics("Mixed Operations");
        CountDownLatch latch = new CountDownLatch(numberOfRequests);
        
        System.out.println("\n=== Starting Mixed Operations Load Test ===");
        System.out.println("Total Requests: " + numberOfRequests);
        System.out.println("Operation Mix: 60% Read, 25% Create, 10% Update, 5% Delete");
        
        Instant startTime = Instant.now();
        
        IntStream.range(0, numberOfRequests).forEach(i -> {
            executor.submit(() -> {
                try {
                    long requestStart = System.currentTimeMillis();
                    
                    // Simulate realistic operation distribution
                    double random = Math.random();
                    ResponseEntity<Map> response;
                    
                    if (random < 0.60) {
                        // 60% Read operations
                        response = performReadOperation();
                    } else if (random < 0.85) {
                        // 25% Create operations
                        response = performCreateOperation();
                    } else if (random < 0.95) {
                        // 10% Update operations
                        response = performUpdateOperation();
                    } else {
                        // 5% Delete operations
                        response = performDeleteOperation();
                    }
                    
                    long requestEnd = System.currentTimeMillis();
                    metrics.recordResponse(requestEnd - requestStart, response.getStatusCode());
                    
                } catch (Exception e) {
                    metrics.recordError();
                } finally {
                    latch.countDown();
                }
            });
        });
        
        latch.await(120, TimeUnit.SECONDS);
        Duration totalDuration = Duration.between(startTime, Instant.now());
        
        metrics.printSummary(totalDuration);
        
        // Mixed operations should maintain good performance
        Assertions.assertTrue(metrics.getSuccessRate() > 0.90, 
            "Mixed ops success rate should be > 90%, was: " + metrics.getSuccessRate());
        Assertions.assertTrue(metrics.getAverageResponseTime() < 300, 
            "Mixed ops average time should be < 300ms, was: " + metrics.getAverageResponseTime());
    }
    
    @Test
    @Order(4)
    @DisplayName("Stress Test: System Limits")
    void testSystemLimits() throws Exception {
        System.out.println("\n=== Starting System Limits Stress Test ===");
        
        // Test rate limiting
        testRateLimiting();
        
        // Test connection pooling
        testConnectionPooling();
        
        // Test memory usage under load
        testMemoryUsage();
        
        // Test database connection limits
        testDatabaseConnectionLimits();
    }
    
    private void testRateLimiting() throws Exception {
        System.out.println("Testing rate limiting...");
        
        int burstRequests = 200;
        CountDownLatch latch = new CountDownLatch(burstRequests);
        AtomicInteger rateLimitedCount = new AtomicInteger();
        
        // Send burst of requests
        IntStream.range(0, burstRequests).forEach(i -> {
            executor.submit(() -> {
                try {
                    ResponseEntity<Map> response = restTemplate.exchange(
                        getUrl("/api/participants"),
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class
                    );
                    
                    if (response.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                        rateLimitedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // Expected for some requests
                } finally {
                    latch.countDown();
                }
            });
        });
        
        latch.await(30, TimeUnit.SECONDS);
        
        System.out.println("Rate limited requests: " + rateLimitedCount.get() + "/" + burstRequests);
        // Some requests should be rate limited
        Assertions.assertTrue(rateLimitedCount.get() > 0 || burstRequests < 100, 
            "Rate limiting should be active");
    }
    
    private void testConnectionPooling() throws Exception {
        System.out.println("Testing connection pooling...");
        
        // Create long-running connections
        int longConnections = 100;
        CountDownLatch latch = new CountDownLatch(longConnections);
        
        IntStream.range(0, longConnections).forEach(i -> {
            executor.submit(() -> {
                try {
                    // Simulate slow query
                    restTemplate.exchange(
                        getUrl("/api/participants?page=0&size=100"),
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Map.class
                    );
                } finally {
                    latch.countDown();
                }
            });
        });
        
        boolean completed = latch.await(60, TimeUnit.SECONDS);
        Assertions.assertTrue(completed, "Connection pool should handle concurrent connections");
    }
    
    private void testMemoryUsage() {
        System.out.println("Testing memory usage...");
        
        Runtime runtime = Runtime.getRuntime();
        long initialMemory = runtime.totalMemory() - runtime.freeMemory();
        
        // Generate large dataset
        List<Map<String, Object>> largeDataset = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            largeDataset.add(generateParticipant());
        }
        
        long peakMemory = runtime.totalMemory() - runtime.freeMemory();
        long memoryIncrease = peakMemory - initialMemory;
        
        System.out.println("Memory increase: " + (memoryIncrease / 1024 / 1024) + " MB");
        
        // Force garbage collection
        System.gc();
        Thread.yield();
        
        long afterGC = runtime.totalMemory() - runtime.freeMemory();
        System.out.println("Memory after GC: " + (afterGC / 1024 / 1024) + " MB");
    }
    
    private void testDatabaseConnectionLimits() throws Exception {
        System.out.println("Testing database connection limits...");
        
        // Test with connection pool size
        int dbRequests = 50;
        CountDownLatch latch = new CountDownLatch(dbRequests);
        AtomicInteger successCount = new AtomicInteger();
        
        IntStream.range(0, dbRequests).parallel().forEach(i -> {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                    getUrl("/api/participants"),
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
                );
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    successCount.incrementAndGet();
                }
            } finally {
                latch.countDown();
            }
        });
        
        latch.await(30, TimeUnit.SECONDS);
        
        System.out.println("Successful DB requests: " + successCount.get() + "/" + dbRequests);
        Assertions.assertTrue(successCount.get() > dbRequests * 0.9, 
            "Most database requests should succeed");
    }
    
    // Helper methods
    
    private void seedInitialData() {
        // Create initial participants
        for (int i = 0; i < 20; i++) {
            Map<String, Object> participant = generateParticipant();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(participant, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                getUrl("/api/participants"),
                HttpMethod.POST,
                request,
                Map.class
            );
            
            if (response.getBody() != null && response.getBody().containsKey("id")) {
                createdParticipantIds.add(response.getBody().get("id").toString());
            }
        }
        
        System.out.println("Seeded " + createdParticipantIds.size() + " participants");
    }
    
    private Map<String, Object> generateParticipant() {
        Map<String, Object> participant = new HashMap<>();
        participant.put("firstName", faker.name().firstName());
        participant.put("lastName", faker.name().lastName());
        participant.put("ndisNumber", generateNdisNumber());
        participant.put("dateOfBirth", 
            LocalDate.now().minusYears(faker.number().numberBetween(18, 65)).toString());
        participant.put("email", faker.internet().emailAddress());
        participant.put("phone", generateAustralianPhone());
        participant.put("emergencyContact", faker.name().fullName());
        participant.put("emergencyPhone", generateAustralianPhone());
        participant.put("fundingType", faker.options().option("Plan Managed", "Self Managed", "Agency Managed"));
        return participant;
    }
    
    private String generateNdisNumber() {
        return String.format("%09d", faker.number().numberBetween(100000000, 999999999));
    }
    
    private String generateAustralianPhone() {
        return "04" + faker.number().digits(8);
    }
    
    private String getRandomParticipantId() {
        if (createdParticipantIds.isEmpty()) {
            return "test-id";
        }
        return createdParticipantIds.get(
            faker.number().numberBetween(0, createdParticipantIds.size())
        );
    }
    
    private ResponseEntity<Map> performReadOperation() {
        return restTemplate.exchange(
            getUrl("/api/participants?page=0&size=10"),
            HttpMethod.GET,
            new HttpEntity<>(headers),
            Map.class
        );
    }
    
    private ResponseEntity<Map> performCreateOperation() {
        Map<String, Object> participant = generateParticipant();
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(participant, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            getUrl("/api/participants"),
            HttpMethod.POST,
            request,
            Map.class
        );
        
        if (response.getBody() != null && response.getBody().containsKey("id")) {
            createdParticipantIds.add(response.getBody().get("id").toString());
        }
        
        return response;
    }
    
    private ResponseEntity<Map> performUpdateOperation() {
        if (createdParticipantIds.isEmpty()) {
            return performCreateOperation();
        }
        
        String id = getRandomParticipantId();
        Map<String, Object> updates = new HashMap<>();
        updates.put("phone", generateAustralianPhone());
        updates.put("email", faker.internet().emailAddress());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(updates, headers);
        
        return restTemplate.exchange(
            getUrl("/api/participants/" + id),
            HttpMethod.PATCH,
            request,
            Map.class
        );
    }
    
    private ResponseEntity<Map> performDeleteOperation() {
        if (createdParticipantIds.size() <= 10) {
            // Keep minimum participants
            return performReadOperation();
        }
        
        String id = createdParticipantIds.remove(0);
        
        return restTemplate.exchange(
            getUrl("/api/participants/" + id),
            HttpMethod.DELETE,
            new HttpEntity<>(headers),
            Map.class
        );
    }
    
    private String getUrl(String path) {
        return "http://localhost:" + port + path;
    }
    
    private String getAuthToken() {
        // TODO: Implement actual auth token retrieval
        return "test-token";
    }
    
    /**
     * Performance metrics collector
     */
    private static class PerformanceMetrics {
        private final String name;
        private final List<Long> responseTimes = new CopyOnWriteArrayList<>();
        private final AtomicInteger successCount = new AtomicInteger();
        private final AtomicInteger errorCount = new AtomicInteger();
        private final Map<HttpStatus, AtomicInteger> statusCounts = new ConcurrentHashMap<>();
        
        public PerformanceMetrics(String name) {
            this.name = name;
        }
        
        public void recordResponse(long responseTime, HttpStatus status) {
            responseTimes.add(responseTime);
            
            if (status.is2xxSuccessful()) {
                successCount.incrementAndGet();
            }
            
            statusCounts.computeIfAbsent(status, k -> new AtomicInteger()).incrementAndGet();
        }
        
        public void recordError() {
            errorCount.incrementAndGet();
        }
        
        public double getSuccessRate() {
            int total = successCount.get() + errorCount.get() + 
                statusCounts.values().stream()
                    .filter(count -> count.get() > 0)
                    .mapToInt(AtomicInteger::get)
                    .sum();
            
            return total > 0 ? (double) successCount.get() / total : 0;
        }
        
        public double getAverageResponseTime() {
            return responseTimes.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0);
        }
        
        public long getP95ResponseTime() {
            if (responseTimes.isEmpty()) return 0;
            
            List<Long> sorted = new ArrayList<>(responseTimes);
            Collections.sort(sorted);
            
            int index = (int) Math.ceil(sorted.size() * 0.95) - 1;
            return sorted.get(Math.min(index, sorted.size() - 1));
        }
        
        public long getP99ResponseTime() {
            if (responseTimes.isEmpty()) return 0;
            
            List<Long> sorted = new ArrayList<>(responseTimes);
            Collections.sort(sorted);
            
            int index = (int) Math.ceil(sorted.size() * 0.99) - 1;
            return sorted.get(Math.min(index, sorted.size() - 1));
        }
        
        public void printSummary(Duration totalDuration) {
            System.out.println("\n=== " + name + " Performance Summary ===");
            System.out.println("Total Duration: " + totalDuration.toSeconds() + "s");
            System.out.println("Total Requests: " + (successCount.get() + errorCount.get()));
            System.out.println("Successful: " + successCount.get());
            System.out.println("Errors: " + errorCount.get());
            System.out.println("Success Rate: " + String.format("%.2f%%", getSuccessRate() * 100));
            System.out.println("Throughput: " + 
                String.format("%.2f req/s", 
                    (successCount.get() + errorCount.get()) / (double) totalDuration.toSeconds()));
            System.out.println("\nResponse Times:");
            System.out.println("  Average: " + String.format("%.2f ms", getAverageResponseTime()));
            System.out.println("  P95: " + getP95ResponseTime() + " ms");
            System.out.println("  P99: " + getP99ResponseTime() + " ms");
            System.out.println("\nStatus Code Distribution:");
            statusCounts.forEach((status, count) -> 
                System.out.println("  " + status + ": " + count.get()));
            System.out.println("=====================================\n");
        }
    }
}