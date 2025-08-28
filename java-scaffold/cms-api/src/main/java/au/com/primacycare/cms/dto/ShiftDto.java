package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Shift DTOs with comprehensive validation for clock-in/out functionality
 */
@Data
public class ShiftDto {
    
    private String id;
    
    private String participantId;
    
    @NotNull(message = "Staff assignment is required")
    private String assignedStaffId;
    
    @NotNull(message = "Shift date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate shiftDate;
    
    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @Min(value = 0, message = "Break minutes cannot be negative")
    @Max(value = 120, message = "Break cannot exceed 2 hours")
    private Integer breakMinutes = 0;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualStartTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualEndTime;
    
    @NotNull
    private ShiftStatusEnum status;
    
    // Geolocation for clock-in/out
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal clockInLat;
    
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal clockInLng;
    
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal clockOutLat;
    
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal clockOutLng;
    
    @Size(max = 5000, message = "Case notes cannot exceed 5000 characters")
    private String caseNotes;
    
    @Size(max = 2000)
    private String incidentReport;
    
    private RateTypeEnum rateType;
    
    @DecimalMin(value = "0.00")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal baseRate;
    
    @DecimalMin(value = "0.00")
    @Digits(integer = 4, fraction = 2)
    private BigDecimal penaltyRate;
    
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "24.00")
    @Digits(integer = 2, fraction = 2)
    private BigDecimal totalHours;
    
    @DecimalMin(value = "0.00")
    @Digits(integer = 6, fraction = 2)
    private BigDecimal totalPay;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Nested DTOs
    private ParticipantSummaryDto participant;
    private StaffSummaryDto assignedStaff;
    private ServiceSummaryDto linkedService;
    
    public enum ShiftStatusEnum {
        SCHEDULED("Scheduled"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        NO_SHOW("No Show"),
        PARTIAL("Partial");
        
        private final String displayName;
        
        ShiftStatusEnum(String displayName) {
            this.displayName = displayName;
        }
    }
    
    public enum RateTypeEnum {
        STANDARD("Standard"),
        SATURDAY("Saturday"),
        SUNDAY("Sunday"),
        PUBLIC_HOLIDAY("Public Holiday"),
        NIGHT("Night"),
        EVENING("Evening");
        
        private final String displayName;
        
        RateTypeEnum(String displayName) {
            this.displayName = displayName;
        }
    }
}

@Data
class ClockInDto {
    
    @NotNull(message = "Shift ID is required")
    private String shiftId;
    
    @NotNull(message = "Location is required for clock-in")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal latitude;
    
    @NotNull(message = "Location is required for clock-in")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal longitude;
    
    @Size(max = 500)
    private String notes;
    
    private String deviceId;
    private String ipAddress;
}

@Data
class ClockOutDto {
    
    @NotNull(message = "Shift ID is required")
    private String shiftId;
    
    @NotNull(message = "Location is required for clock-out")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal latitude;
    
    @NotNull(message = "Location is required for clock-out")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal longitude;
    
    @NotBlank(message = "Case notes are required at shift completion")
    @Size(min = 50, max = 5000, message = "Case notes must be between 50 and 5000 characters")
    private String caseNotes;
    
    @Min(value = 0)
    @Max(value = 120)
    private Integer breakMinutes;
    
    private String incidentReport;
    private String deviceId;
    private String ipAddress;
}

@Data
class ServiceSummaryDto {
    private String id;
    private String serviceType;
    private String itemNumber;
    private LocalDate scheduledDate;
}