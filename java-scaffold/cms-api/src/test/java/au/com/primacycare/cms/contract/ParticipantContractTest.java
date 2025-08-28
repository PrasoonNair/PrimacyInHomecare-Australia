package au.com.primacycare.cms.contract;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

/**
 * REST Assured contract tests for Participant API
 * Verifies API compatibility with Node.js implementation
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@TestPropertySource(locations = "classpath:application-test.yml")
public class ParticipantContractTest {
    
    @LocalServerPort
    private int port;
    
    private String authToken;
    
    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        
        // TODO: Get auth token from Keycloak
        authToken = getTestAuthToken();
    }
    
    /**
     * Test: GET /api/participants
     * Verifies pagination and response structure
     */
    @Test
    void testGetParticipants_Success() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("page", 1)
            .queryParam("limit", 50)
        .when()
            .get("/participants")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("data", notNullValue())
            .body("data", hasSize(lessThanOrEqualTo(50)))
            .body("data[0].id", matchesPattern("^[a-f0-9-]{36}$"))
            .body("data[0].firstName", notNullValue())
            .body("data[0].lastName", notNullValue())
            .body("data[0].ndisNumber", matchesPattern("\\d{9}"))
            .body("data[0].dateOfBirth", matchesPattern("\\d{4}-\\d{2}-\\d{2}"))
            .body("pagination.page", equalTo(1))
            .body("pagination.limit", equalTo(50))
            .body("pagination.total", greaterThanOrEqualTo(0))
            .body("pagination.pages", greaterThanOrEqualTo(1));
    }
    
    /**
     * Test: GET /api/participants with filters
     */
    @Test
    void testGetParticipants_WithFilters() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .queryParam("status", "Active")
            .queryParam("ndisNumber", "123")
        .when()
            .get("/participants")
        .then()
            .statusCode(200)
            .body("data", everyItem(
                hasEntry(equalTo("status"), equalTo("Active"))
            ))
            .body("data.ndisNumber", everyItem(containsString("123")));
    }
    
    /**
     * Test: GET /api/participants/:id
     */
    @Test
    void testGetParticipantById_Success() {
        String participantId = createTestParticipant();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/participants/" + participantId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("id", equalTo(participantId))
            .body("firstName", notNullValue())
            .body("lastName", notNullValue())
            .body("ndisNumber", matchesPattern("\\d{9}"))
            .body("createdAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z"))
            .body("updatedAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z"));
    }
    
    /**
     * Test: GET /api/participants/:id - Not Found
     */
    @Test
    void testGetParticipantById_NotFound() {
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/participants/non-existent-id")
        .then()
            .statusCode(404)
            .body("error", containsString("not found"));
    }
    
    /**
     * Test: POST /api/participants
     */
    @Test
    void testCreateParticipant_Success() {
        String requestBody = """
            {
                "firstName": "John",
                "lastName": "Doe",
                "ndisNumber": "123456789",
                "dateOfBirth": "1990-01-15",
                "email": "john.doe@example.com",
                "phone": "0412345678",
                "address": "123 Test St, Sydney NSW 2000",
                "emergencyContact": "Jane Doe",
                "emergencyPhone": "0498765432",
                "fundingType": "Plan Managed"
            }
            """;
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/participants")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body("id", notNullValue())
            .body("firstName", equalTo("John"))
            .body("lastName", equalTo("Doe"))
            .body("ndisNumber", equalTo("123456789"))
            .body("createdAt", notNullValue())
            .header("Location", containsString("/api/participants/"));
    }
    
    /**
     * Test: POST /api/participants - Validation Failures
     */
    @Test
    void testCreateParticipant_ValidationFailure() {
        String invalidBody = """
            {
                "firstName": "",
                "lastName": "D",
                "ndisNumber": "12345",
                "dateOfBirth": "2030-01-15",
                "email": "invalid-email",
                "phone": "123"
            }
            """;
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(invalidBody)
        .when()
            .post("/participants")
        .then()
            .statusCode(400)
            .body("errors", hasSize(greaterThan(0)))
            .body("errors", hasItems(
                hasEntry("field", "firstName"),
                hasEntry("field", "lastName"),
                hasEntry("field", "ndisNumber"),
                hasEntry("field", "dateOfBirth"),
                hasEntry("field", "email"),
                hasEntry("field", "phone")
            ))
            .body("errors[0].message", notNullValue());
    }
    
    /**
     * Test: POST /api/participants - Duplicate NDIS Number
     */
    @Test
    void testCreateParticipant_DuplicateNdisNumber() {
        String ndisNumber = "987654321";
        createParticipantWithNdisNumber(ndisNumber);
        
        String requestBody = String.format("""
            {
                "firstName": "Jane",
                "lastName": "Smith",
                "ndisNumber": "%s",
                "dateOfBirth": "1985-05-20"
            }
            """, ndisNumber);
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/participants")
        .then()
            .statusCode(409)
            .body("error", containsString("already exists"));
    }
    
    /**
     * Test: PUT /api/participants/:id
     */
    @Test
    void testUpdateParticipant_Success() {
        String participantId = createTestParticipant();
        
        String updateBody = """
            {
                "phone": "0499999999",
                "email": "updated@example.com",
                "address": "456 New St, Melbourne VIC 3000"
            }
            """;
        
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(updateBody)
        .when()
            .put("/participants/" + participantId)
        .then()
            .statusCode(200)
            .body("id", equalTo(participantId))
            .body("phone", equalTo("0499999999"))
            .body("email", equalTo("updated@example.com"))
            .body("address", containsString("Melbourne"));
    }
    
    /**
     * Test: DELETE /api/participants/:id
     */
    @Test
    void testDeleteParticipant_Success() {
        String participantId = createTestParticipant();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .delete("/participants/" + participantId)
        .then()
            .statusCode(204);
        
        // Verify deleted
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/participants/" + participantId)
        .then()
            .statusCode(404);
    }
    
    /**
     * Test: DELETE /api/participants/:id - With Active Services
     */
    @Test
    void testDeleteParticipant_WithActiveServices() {
        String participantId = createParticipantWithActiveServices();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .delete("/participants/" + participantId)
        .then()
            .statusCode(400)
            .body("error", containsString("active services"));
    }
    
    /**
     * Test: Authorization - No Token
     */
    @Test
    void testParticipantEndpoints_Unauthorized() {
        given()
            // No auth header
        .when()
            .get("/participants")
        .then()
            .statusCode(401)
            .body("error", containsString("Unauthorized"));
    }
    
    /**
     * Test: Authorization - Invalid Role
     */
    @Test
    void testCreateParticipant_InsufficientRole() {
        String participantToken = getParticipantRoleToken();
        
        given()
            .header("Authorization", "Bearer " + participantToken)
            .contentType(ContentType.JSON)
            .body("{\"firstName\": \"Test\"}")
        .when()
            .post("/participants")
        .then()
            .statusCode(403)
            .body("error", containsString("Forbidden"));
    }
    
    /**
     * Test: Response Headers
     */
    @Test
    void testResponseHeaders() {
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/participants")
        .then()
            .header("Content-Type", containsString("application/json"))
            .header("X-Total-Count", notNullValue())
            .header("X-Page", notNullValue())
            .header("X-Per-Page", notNullValue());
    }
    
    // Helper methods
    
    private String getTestAuthToken() {
        // TODO: Implement Keycloak token retrieval
        return "test-token";
    }
    
    private String getParticipantRoleToken() {
        // TODO: Get token with participant role only
        return "participant-token";
    }
    
    private String createTestParticipant() {
        // TODO: Create test participant and return ID
        return "test-participant-id";
    }
    
    private String createParticipantWithNdisNumber(String ndisNumber) {
        // TODO: Create participant with specific NDIS number
        return "test-participant-id";
    }
    
    private String createParticipantWithActiveServices() {
        // TODO: Create participant with active services
        return "test-participant-id";
    }
}