package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Referral DTOs for the 9-stage workflow management
 */
@Data
public class ReferralDto {
    
    private String id;
    
    @NotNull(message = "Referral date is required")
    @PastOrPresent(message = "Referral date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate referralDate;
    
    @NotBlank(message = "Referral source is required")
    @Size(max = 255)
    private String referralSource;
    
    @Size(max = 255)
    private String referrerName;
    
    @Email(message = "Invalid referrer email")
    private String referrerEmail;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "Invalid phone number")
    private String referrerPhone;
    
    @NotBlank(message = "Participant name is required")
    @Size(min = 2, max = 255)
    private String participantName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate participantDob;
    
    @Pattern(regexp = "^\\d{9}$", message = "NDIS number must be 9 digits")
    private String participantNdis;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String participantPhone;
    
    @Email
    private String participantEmail;
    
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    
    @Size(max = 2000)
    private String supportRequirements;
    
    @NotNull(message = "Urgency level is required")
    private UrgencyEnum urgency;
    
    @NotNull
    private ReferralStatusEnum status;
    
    private String assignedTo;
    
    @Size(max = 2000)
    private String notes;
    
    private OutcomeEnum outcome;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate outcomeDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Workflow tracking
    private WorkflowStageEnum currentStage;
    private List<WorkflowHistoryDto> workflowHistory;
    private StaffSummaryDto assignedStaff;
    
    public enum UrgencyEnum {
        LOW("Low - Routine"),
        MEDIUM("Medium - Within 7 days"),
        HIGH("High - Within 48 hours"),
        CRITICAL("Critical - Immediate");
        
        private final String displayName;
        
        UrgencyEnum(String displayName) {
            this.displayName = displayName;
        }
    }
    
    public enum ReferralStatusEnum {
        NEW("New"),
        IN_REVIEW("In Review"),
        CONTACTING("Contacting Participant"),
        AWAITING_DOCUMENTS("Awaiting Documents"),
        ASSESSING("Assessing Eligibility"),
        APPROVED("Approved"),
        REJECTED("Rejected"),
        WITHDRAWN("Withdrawn"),
        CONVERTED("Converted to Participant");
        
        private final String displayName;
        
        ReferralStatusEnum(String displayName) {
            this.displayName = displayName;
        }
    }
    
    public enum OutcomeEnum {
        ACCEPTED("Accepted - Onboarded"),
        REJECTED_INELIGIBLE("Rejected - Ineligible"),
        REJECTED_CAPACITY("Rejected - No Capacity"),
        WITHDRAWN("Withdrawn by Referrer"),
        NO_RESPONSE("No Response from Participant");
        
        private final String displayName;
        
        OutcomeEnum(String displayName) {
            this.displayName = displayName;
        }
    }
    
    public enum WorkflowStageEnum {
        REFERRAL_RECEIVED("Referral Received"),
        DATA_VERIFIED("Data Verified"),
        SERVICE_AGREEMENT_PREPARED("Service Agreement Prepared"),
        AGREEMENT_SENT("Agreement Sent"),
        AGREEMENT_SIGNED("Agreement Signed"),
        FUNDING_VERIFICATION("Funding Verification"),
        FUNDING_VERIFIED("Funding Verified"),
        STAFF_ALLOCATION("Staff Allocation"),
        WORKER_ALLOCATED("Worker Allocated"),
        MEET_GREET_SCHEDULED("Meet & Greet Scheduled"),
        MEET_GREET_COMPLETED("Meet & Greet Completed"),
        SERVICE_COMMENCED("Service Commenced");
        
        private final String displayName;
        
        WorkflowStageEnum(String displayName) {
            this.displayName = displayName;
        }
    }
}

@Data
class WorkflowHistoryDto {
    private String id;
    private WorkflowStageEnum stage;
    private LocalDateTime timestamp;
    private String performedBy;
    private String notes;
    private Boolean automated;
}

@Data
class CreateReferralDto {
    
    @NotNull(message = "Referral date is required")
    @PastOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate referralDate;
    
    @NotBlank(message = "Referral source is required")
    @Size(max = 255)
    private String referralSource;
    
    @Size(max = 255)
    private String referrerName;
    
    @Email
    private String referrerEmail;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String referrerPhone;
    
    @NotBlank(message = "Participant name is required")
    @Size(min = 2, max = 255)
    private String participantName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate participantDob;
    
    @Pattern(regexp = "^\\d{9}$")
    private String participantNdis;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String participantPhone;
    
    @Email
    private String participantEmail;
    
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    
    @Size(max = 2000)
    private String supportRequirements;
    
    @NotNull(message = "Urgency level is required")
    private ReferralDto.UrgencyEnum urgency;
    
    @Size(max = 2000)
    private String notes;
}