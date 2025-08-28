package au.com.primacycare.cms.form;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring MVC form for participant creation/update
 * Handles multipart file uploads and complex validation
 */
@Data
@ValidParticipant // Custom validator
public class ParticipantForm {
    
    // Basic Information Section
    @NotBlank(message = "form.participant.firstName.required")
    @Size(min = 2, max = 100, message = "form.participant.firstName.size")
    private String firstName;
    
    @NotBlank(message = "form.participant.lastName.required")
    @Size(min = 2, max = 100, message = "form.participant.lastName.size")
    private String lastName;
    
    @Size(max = 100, message = "form.participant.preferredName.size")
    private String preferredName;
    
    @NotBlank(message = "form.participant.ndisNumber.required")
    @Pattern(regexp = "^\\d{9}$", message = "form.participant.ndisNumber.pattern")
    private String ndisNumber;
    
    @NotNull(message = "form.participant.dateOfBirth.required")
    @Past(message = "form.participant.dateOfBirth.past")
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDate dateOfBirth;
    
    private String gender;
    private String pronouns;
    
    // Contact Information Section
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "form.participant.phone.pattern")
    private String phone;
    
    @Email(message = "form.participant.email.invalid")
    private String email;
    
    @ValidAddress // Custom address validator
    private AddressForm address;
    
    // Emergency Contact Section
    @NotBlank(message = "form.participant.emergencyContact.required")
    private String emergencyContact;
    
    @NotBlank(message = "form.participant.emergencyPhone.required")
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "form.participant.emergencyPhone.pattern")
    private String emergencyPhone;
    
    // Cultural & Communication Section
    private String culturalBackground;
    private List<String> languagesSpoken;
    private String communicationNeeds;
    private String preferredCommunicationMethod;
    
    // Medical Information Section
    private List<String> medicalConditions;
    private List<MedicationForm> medications;
    private List<String> allergies;
    private String mobilityNeeds;
    private String dietaryRequirements;
    
    // Healthcare Providers Section
    private String gpName;
    private String gpContact;
    private List<SpecialistForm> specialists;
    
    // Guardian Information Section (if applicable)
    @ValidGuardian // Custom validator that checks if guardian is required based on age
    private GuardianForm guardian;
    
    // Plan Management Section
    private String planManager;
    private String planManagerEmail;
    private String planManagerPhone;
    
    private String supportCoordinator;
    private String supportCoordinatorEmail;
    private String supportCoordinatorPhone;
    
    // Goals & Preferences Section
    @Size(max = 2000, message = "form.participant.goals.size")
    private String goals;
    
    @Size(max = 2000, message = "form.participant.interests.size")
    private String interests;
    
    private List<String> preferredActivities;
    
    // Funding & Services Section
    @NotNull(message = "form.participant.fundingType.required")
    private String fundingType;
    
    private String transportMethod;
    
    // Support Plans Section
    private String behaviourSupportPlan;
    private String riskAssessment;
    
    // Consent Section
    @AssertTrue(message = "form.participant.privacyConsent.required")
    private Boolean privacyConsent;
    
    private Boolean consentPhotos;
    private Boolean consentDataSharing;
    
    // File Uploads
    @ValidFile(maxSize = 5242880, allowedTypes = {"image/jpeg", "image/png"})
    private MultipartFile profilePhoto;
    
    @ValidFiles(maxSize = 10485760, allowedTypes = {"application/pdf", "image/jpeg", "image/png"})
    private List<MultipartFile> documents;
    
    // Location
    @NotNull(message = "form.participant.state.required")
    private String stateId;
    
    @NotNull(message = "form.participant.region.required")
    private String regionId;
    
    // Additional Notes
    @Size(max = 5000, message = "form.participant.notes.size")
    private String notes;
    
    // Hidden fields
    private String id;
    private String action; // create or update
    
    // Nested form classes
    @Data
    public static class AddressForm {
        @NotBlank(message = "form.address.street.required")
        private String street;
        
        @NotBlank(message = "form.address.suburb.required")
        private String suburb;
        
        @NotBlank(message = "form.address.state.required")
        private String state;
        
        @Pattern(regexp = "^\\d{4}$", message = "form.address.postcode.pattern")
        private String postcode;
    }
    
    @Data
    public static class MedicationForm {
        @NotBlank(message = "form.medication.name.required")
        private String name;
        
        private String dosage;
        private String frequency;
        private String prescribedBy;
    }
    
    @Data
    public static class SpecialistForm {
        private String type;
        private String name;
        private String contact;
        private String lastVisit;
    }
    
    @Data
    public static class GuardianForm {
        private String name;
        private String relationship;
        
        @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "form.guardian.phone.pattern")
        private String phone;
        
        @Email(message = "form.guardian.email.invalid")
        private String email;
        
        private Boolean isPrimaryContact;
        private Boolean hasLegalAuthority;
    }
    
    /**
     * Validation groups for wizard-style forms
     */
    public interface BasicInfoStep {}
    public interface ContactInfoStep {}
    public interface MedicalInfoStep {}
    public interface GuardianInfoStep {}
    public interface PlanInfoStep {}
    public interface ConsentStep {}
}