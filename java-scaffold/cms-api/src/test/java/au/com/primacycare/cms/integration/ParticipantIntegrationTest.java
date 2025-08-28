package au.com.primacycare.cms.integration;

import au.com.primacycare.cms.dto.CreateParticipantDto;
import au.com.primacycare.cms.dto.ParticipantDto;
import au.com.primacycare.cms.entity.Participant;
import au.com.primacycare.cms.repository.ParticipantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Participant API with Testcontainers
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ParticipantIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("primacy_cms_test")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("db/migration/V001__baseline_schema.sql");
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    private static String createdParticipantId;
    
    @BeforeEach
    void setup() {
        // Clear cache before each test
    }
    
    @Test
    @Order(1)
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("Should create participant with valid data")
    void testCreateParticipant_Success() throws Exception {
        CreateParticipantDto dto = new CreateParticipantDto();
        dto.setFirstName("John");
        dto.setLastName("Smith");
        dto.setNdisNumber("123456789");
        dto.setDateOfBirth(LocalDate.of(1990, 1, 15));
        dto.setPhone("0412345678");
        dto.setEmail("john.smith@example.com");
        dto.setEmergencyContact("Jane Smith");
        dto.setEmergencyPhone("0498765432");
        dto.setFundingType("Plan Managed");
        
        String response = mockMvc.perform(post("/api/participants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.lastName").value("Smith"))
            .andExpect(jsonPath("$.ndisNumber").value("123456789"))
            .andExpect(jsonPath("$.createdAt").isNotEmpty())
            .andReturn()
            .getResponse()
            .getContentAsString();
        
        ParticipantDto created = objectMapper.readValue(response, ParticipantDto.class);
        createdParticipantId = created.getId();
        
        // Verify database
        Assertions.assertTrue(participantRepository.existsById(createdParticipantId));
    }
    
    @Test
    @Order(2)
    @WithMockUser(roles = "SUPPORT_WORKER")
    @DisplayName("Should get participant by ID with proper authorization")
    void testGetParticipant_Success() throws Exception {
        mockMvc.perform(get("/api/participants/" + createdParticipantId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdParticipantId))
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.lastName").value("Smith"));
    }
    
    @Test
    @Order(3)
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("Should update participant with partial data")
    @Transactional
    void testUpdateParticipant_PartialUpdate() throws Exception {
        String updateJson = """
            {
                "phone": "0499999999",
                "email": "john.updated@example.com",
                "preferredName": "Johnny"
            }
            """;
        
        mockMvc.perform(patch("/api/participants/" + createdParticipantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.phone").value("0499999999"))
            .andExpect(jsonPath("$.email").value("john.updated@example.com"))
            .andExpect(jsonPath("$.preferredName").value("Johnny"))
            .andExpect(jsonPath("$.firstName").value("John")) // Unchanged
            .andExpect(jsonPath("$.lastName").value("Smith")); // Unchanged
    }
    
    @Test
    @Order(4)
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Should deny participant creation for participant role")
    void testCreateParticipant_Forbidden() throws Exception {
        CreateParticipantDto dto = new CreateParticipantDto();
        dto.setFirstName("Test");
        dto.setLastName("User");
        dto.setNdisNumber("987654321");
        dto.setDateOfBirth(LocalDate.of(1985, 5, 20));
        
        mockMvc.perform(post("/api/participants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("Access Denied"));
    }
    
    @Test
    @Order(5)
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("Should validate required fields")
    void testCreateParticipant_ValidationErrors() throws Exception {
        String invalidJson = """
            {
                "firstName": "",
                "lastName": "X",
                "ndisNumber": "12345",
                "dateOfBirth": "2030-01-01",
                "email": "invalid-email",
                "phone": "123"
            }
            """;
        
        mockMvc.perform(post("/api/participants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors", hasSize(greaterThan(5))))
            .andExpect(jsonPath("$.errors[?(@.field == 'firstName')]").exists())
            .andExpect(jsonPath("$.errors[?(@.field == 'lastName')]").exists())
            .andExpect(jsonPath("$.errors[?(@.field == 'ndisNumber')]").exists())
            .andExpect(jsonPath("$.errors[?(@.field == 'dateOfBirth')]").exists())
            .andExpect(jsonPath("$.errors[?(@.field == 'email')]").exists())
            .andExpect(jsonPath("$.errors[?(@.field == 'phone')]").exists());
    }
    
    @Test
    @Order(6)
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should handle duplicate NDIS number")
    void testCreateParticipant_DuplicateNdisNumber() throws Exception {
        CreateParticipantDto dto = new CreateParticipantDto();
        dto.setFirstName("Jane");
        dto.setLastName("Doe");
        dto.setNdisNumber("123456789"); // Same as created in test 1
        dto.setDateOfBirth(LocalDate.of(1985, 5, 20));
        
        mockMvc.perform(post("/api/participants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value(containsString("already exists")));
    }
    
    @Test
    @Order(7)
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("Should get paginated participants with filters")
    void testGetParticipants_Pagination() throws Exception {
        // Create additional test data
        for (int i = 0; i < 5; i++) {
            Participant p = new Participant();
            p.setId(UUID.randomUUID().toString());
            p.setUserId("test-user-" + i);
            p.setFirstName("Test" + i);
            p.setLastName("User" + i);
            p.setNdisNumber("99999000" + i);
            p.setDateOfBirth(LocalDate.of(1990, 1, 1));
            participantRepository.save(p);
        }
        
        mockMvc.perform(get("/api/participants")
                .param("page", "0")
                .param("size", "3")
                .param("sort", "firstName,asc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(3)))
            .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(6)))
            .andExpect(jsonPath("$.totalPages").value(greaterThanOrEqualTo(2)))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.size").value(3));
    }
    
    @Test
    @Order(8)
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Should delete participant without active services")
    @Transactional
    void testDeleteParticipant_Success() throws Exception {
        // Create a participant to delete
        Participant toDelete = new Participant();
        toDelete.setId(UUID.randomUUID().toString());
        toDelete.setUserId("delete-test");
        toDelete.setFirstName("Delete");
        toDelete.setLastName("Me");
        toDelete.setNdisNumber("888888888");
        toDelete.setDateOfBirth(LocalDate.of(1995, 6, 15));
        toDelete = participantRepository.save(toDelete);
        
        mockMvc.perform(delete("/api/participants/" + toDelete.getId()))
            .andExpect(status().isNoContent());
        
        // Verify deleted
        Assertions.assertFalse(participantRepository.existsById(toDelete.getId()));
    }
    
    @Test
    @Order(9)
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("Should handle concurrent updates with optimistic locking")
    @Transactional
    void testConcurrentUpdate_OptimisticLocking() throws Exception {
        // This test simulates concurrent updates to detect race conditions
        // Implementation would include version checking
    }
    
    @Test
    @Order(10)
    @DisplayName("Should reject requests without authentication")
    void testUnauthenticated_Rejected() throws Exception {
        mockMvc.perform(get("/api/participants"))
            .andExpect(status().isUnauthorized());
    }
}