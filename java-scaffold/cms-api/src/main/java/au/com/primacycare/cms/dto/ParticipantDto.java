package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO matching TypeScript Participant type from shared/schema.ts
 * Used for API responses
 */
@Data
public class ParticipantDto {
    
    private String id;
    private String userId;
    
    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;
    
    @Size(max = 100)
    private String preferredName;
    
    @NotBlank(message = "NDIS number is required")
    @Pattern(regexp = "\\d{9}", message = "NDIS number must be 9 digits")
    private String ndisNumber;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    @Size(max = 20)
    private String gender;
    
    @Size(max = 50)
    private String pronouns;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "Invalid Australian phone number")
    private String phone;
    
    @Email(message = "Invalid email address")
    private String email;
    
    private String address;
    private String emergencyContact;
    private String emergencyPhone;
    private String culturalBackground;
    private String languagesSpoken;
    private String communicationNeeds;
    private String mobilityNeeds;
    private String medicalConditions;
    private String medications;
    private String allergies;
    private String gpName;
    private String gpContact;
    private String specialistContacts;
    
    // Guardian details
    private String guardianName;
    private String guardianRelationship;
    private String guardianPhone;
    private String guardianEmail;
    
    // Plan management
    private String planManager;
    private String planManagerEmail;
    private String planManagerPhone;
    
    // Support coordination
    private String supportCoordinator;
    private String supportCoordinatorEmail;
    private String supportCoordinatorPhone;
    
    // Goals and preferences
    private String goals;
    private String interests;
    private String preferredActivities;
    
    // Funding and services
    private String fundingType;
    private String transportMethod;
    private String dietaryRequirements;
    
    // Support plans
    private String behaviourSupportPlan;
    private String riskAssessment;
    private String incidentNotes;
    
    // Consent
    @JsonProperty("consentPhotos")
    private Boolean consentPhotos;
    
    @JsonProperty("consentDataSharing")
    private Boolean consentDataSharing;
    
    // Files and media
    private String profilePhoto;
    private String documents;
    
    // Additional notes
    private String notes;
    
    // Metadata
    private String createdBy;
    private String stateId;
    private String regionId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Related data counts (for list views)
    private Integer activeServicesCount;
    private Integer goalsCount;
    private Integer upcomingAppointmentsCount;
    private String currentPlanStatus;
    
    // Nested objects for detailed views
    private StateDto state;
    private RegionDto region;
    private List<NdisPlanSummaryDto> recentPlans;
    private List<ServiceSummaryDto> recentServices;
}

/**
 * DTO for creating a new participant
 * Matches TypeScript InsertParticipant type
 */
@Data
class CreateParticipantDto {
    
    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;
    
    @Size(max = 100)
    private String preferredName;
    
    @NotBlank(message = "NDIS number is required")
    @Pattern(regexp = "\\d{9}", message = "NDIS number must be 9 digits")
    private String ndisNumber;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    @Size(max = 20)
    private String gender;
    
    @Size(max = 50)
    private String pronouns;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "Invalid Australian phone number")
    private String phone;
    
    @Email(message = "Invalid email address")
    private String email;
    
    private String address;
    private String emergencyContact;
    private String emergencyPhone;
    private String culturalBackground;
    private String languagesSpoken;
    private String communicationNeeds;
    private String mobilityNeeds;
    private String medicalConditions;
    private String medications;
    private String allergies;
    private String gpName;
    private String gpContact;
    private String specialistContacts;
    private String guardianName;
    private String guardianRelationship;
    private String guardianPhone;
    private String guardianEmail;
    private String planManager;
    private String planManagerEmail;
    private String planManagerPhone;
    private String supportCoordinator;
    private String supportCoordinatorEmail;
    private String supportCoordinatorPhone;
    private String goals;
    private String interests;
    private String preferredActivities;
    private String fundingType;
    private String transportMethod;
    private String dietaryRequirements;
    private String behaviourSupportPlan;
    private String riskAssessment;
    private String incidentNotes;
    private Boolean consentPhotos = false;
    private Boolean consentDataSharing = false;
    private String profilePhoto;
    private String documents;
    private String notes;
    private String stateId;
    private String regionId;
}

/**
 * DTO for updating an existing participant
 * All fields are optional (partial update)
 */
@Data
class UpdateParticipantDto extends CreateParticipantDto {
    // Inherits all fields from CreateParticipantDto
    // All fields are optional for updates
}