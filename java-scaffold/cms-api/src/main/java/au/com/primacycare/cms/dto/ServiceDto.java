package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Service DTOs with Jakarta Validation for NDIS services
 */
@Data
public class ServiceDto {
    
    private String id;
    
    @NotNull(message = "Participant ID is required")
    private String participantId;
    
    @NotBlank(message = "Service type is required")
    @Size(max = 100)
    private String serviceType;
    
    @NotNull(message = "Service category is required")
    private ServiceCategoryEnum category;
    
    private ServiceSubcategoryEnum subcategory;
    
    @Pattern(regexp = "^\\d{2}_\\d{3}_\\d{4}_\\d{1}_\\d{1}$", 
             message = "Item number must match NDIS format (e.g., 01_011_0107_1_1)")
    private String itemNumber;
    
    @NotNull(message = "Scheduled date is required")
    @Future(message = "Service date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @Min(value = 15, message = "Service duration must be at least 15 minutes")
    @Max(value = 480, message = "Service duration cannot exceed 8 hours")
    private Integer durationMinutes;
    
    @Size(max = 255)
    private String location;
    
    private String assignedTo; // Staff ID
    
    @NotNull(message = "Rate type is required")
    private RateTypeEnum rateType;
    
    @DecimalMin(value = "0.00", message = "Rate must be positive")
    @DecimalMax(value = "9999.99", message = "Rate exceeds maximum")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal rate;
    
    @DecimalMin(value = "0.00")
    @Digits(integer = 6, fraction = 2)
    private BigDecimal totalCost;
    
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "999.99")
    @Digits(integer = 3, fraction = 2)
    private BigDecimal transportCost;
    
    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Nested DTOs
    private ParticipantSummaryDto participant;
    private StaffSummaryDto assignedStaff;
    
    // Service Category Enum (NDIS Support Categories)
    public enum ServiceCategoryEnum {
        CORE("Core Supports"),
        CAPACITY_BUILDING("Capacity Building Supports"),
        CAPITAL("Capital Supports"),
        PLAN_MANAGEMENT("Plan Management");
        
        private final String displayName;
        
        ServiceCategoryEnum(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Service Subcategory Enum
    public enum ServiceSubcategoryEnum {
        // Core Supports
        ASSISTANCE_WITH_DAILY_LIFE("Assistance with daily life"),
        TRANSPORT("Transport"),
        CONSUMABLES("Consumables"),
        ASSISTANCE_WITH_SOCIAL("Assistance with social and community participation"),
        
        // Capacity Building
        SUPPORT_COORDINATION("Support Coordination"),
        IMPROVED_LIVING("Improved living arrangements"),
        INCREASED_SOCIAL("Increased social and community participation"),
        FINDING_EMPLOYMENT("Finding and keeping a job"),
        IMPROVED_RELATIONSHIPS("Improved relationships"),
        IMPROVED_HEALTH("Improved health and wellbeing"),
        IMPROVED_LEARNING("Improved learning"),
        IMPROVED_LIFE_CHOICES("Improved life choices"),
        IMPROVED_DAILY_LIVING("Improved daily living skills"),
        
        // Capital
        ASSISTIVE_TECHNOLOGY("Assistive technology"),
        HOME_MODIFICATIONS("Home modifications");
        
        private final String displayName;
        
        ServiceSubcategoryEnum(String displayName) {
            this.displayName = displayName;
        }
    }
    
    // Rate Type Enum
    public enum RateTypeEnum {
        STANDARD("Standard"),
        SATURDAY("Saturday"),
        SUNDAY("Sunday"),
        NIGHT("Night"),
        EVENING("Evening"),
        PUBLIC_HOLIDAY("Public Holiday");
        
        private final String displayName;
        
        RateTypeEnum(String displayName) {
            this.displayName = displayName;
        }
    }
}

@Data
class CreateServiceDto {
    
    @NotNull(message = "Participant ID is required")
    private String participantId;
    
    @NotBlank(message = "Service type is required")
    @Size(max = 100)
    private String serviceType;
    
    @NotNull(message = "Service category is required")
    private ServiceDto.ServiceCategoryEnum category;
    
    private ServiceDto.ServiceSubcategoryEnum subcategory;
    
    @Pattern(regexp = "^\\d{2}_\\d{3}_\\d{4}_\\d{1}_\\d{1}$")
    private String itemNumber;
    
    @NotNull(message = "Scheduled date is required")
    @Future(message = "Service date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @Min(15)
    @Max(480)
    private Integer durationMinutes;
    
    @Size(max = 255)
    private String location;
    
    private String assignedTo;
    
    @NotNull
    private ServiceDto.RateTypeEnum rateType;
    
    @DecimalMin("0.00")
    @DecimalMax("9999.99")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal rate;
    
    @DecimalMin("0.00")
    @Digits(integer = 6, fraction = 2)
    private BigDecimal totalCost;
    
    @DecimalMin("0.00")
    @DecimalMax("999.99")
    @Digits(integer = 3, fraction = 2)
    private BigDecimal transportCost;
    
    @Size(max = 2000)
    private String notes;
}

@Data
class UpdateServiceDto extends CreateServiceDto {
    // All fields optional for partial updates
}

@Data
class ParticipantSummaryDto {
    private String id;
    private String firstName;
    private String lastName;
    private String ndisNumber;
    private String profilePhoto;
}

@Data
class StaffSummaryDto {
    private String id;
    private String firstName;
    private String lastName;
    private String position;
    private String profilePhoto;
}