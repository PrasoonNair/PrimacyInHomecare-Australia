package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Staff DTOs with full Jakarta Validation matching TypeScript types
 */
@Data
public class StaffDto {
    
    private String id;
    private String userId;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private String email;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "Must be a valid Australian phone number")
    private String phone;
    
    @Size(max = 100, message = "Position cannot exceed 100 characters")
    private String position;
    
    @NotNull(message = "Department is required")
    private DepartmentEnum department;
    
    @NotNull(message = "Employment type is required")
    private EmploymentTypeEnum employmentType;
    
    @PastOrPresent(message = "Start date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    private List<String> qualifications;
    private List<String> certifications;
    
    private String emergencyContact;
    private String emergencyPhone;
    
    private String stateId;
    private String regionId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Nested DTOs
    private StateDto state;
    private RegionDto region;
    private List<StaffAvailabilityDto> availability;
    private StaffMetricsDto metrics;
    
    // Enums matching TypeScript
    public enum DepartmentEnum {
        OPERATIONS("Operations"),
        INTAKE("Intake"),
        SERVICE_DELIVERY("Service Delivery"),
        FINANCE("Finance"),
        RECRUITMENT_HR("Recruitment & HR");
        
        private final String displayName;
        
        DepartmentEnum(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum EmploymentTypeEnum {
        FULL_TIME("Full-time"),
        PART_TIME("Part-time"),
        CASUAL("Casual"),
        CONTRACT("Contract");
        
        private final String displayName;
        
        EmploymentTypeEnum(String displayName) {
            this.displayName = displayName;
        }
    }
}

@Data
class CreateStaffDto {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100)
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$", message = "Must be a valid Australian phone number")
    private String phone;
    
    @Size(max = 100)
    private String position;
    
    @NotNull(message = "Department is required")
    private StaffDto.DepartmentEnum department;
    
    @NotNull(message = "Employment type is required")
    private StaffDto.EmploymentTypeEnum employmentType;
    
    @PastOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    private List<String> qualifications;
    private List<String> certifications;
    
    private String emergencyContact;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String emergencyPhone;
    
    private String stateId;
    private String regionId;
}

@Data
class UpdateStaffDto {
    
    @Size(min = 2, max = 100)
    private String firstName;
    
    @Size(min = 2, max = 100)
    private String lastName;
    
    @Email
    private String email;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String phone;
    
    @Size(max = 100)
    private String position;
    
    private StaffDto.DepartmentEnum department;
    private StaffDto.EmploymentTypeEnum employmentType;
    
    @PastOrPresent
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    private List<String> qualifications;
    private List<String> certifications;
    
    private String emergencyContact;
    
    @Pattern(regexp = "^(\\+61|0)[2-9]\\d{8}$")
    private String emergencyPhone;
    
    private String stateId;
    private String regionId;
}

@Data
class StaffAvailabilityDto {
    
    private String id;
    private String staffId;
    
    @Min(value = 1, message = "Day must be between 1 and 7")
    @Max(value = 7, message = "Day must be between 1 and 7")
    private Integer dayOfWeek;
    
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time must be in HH:mm format")
    private String startTime;
    
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time must be in HH:mm format")
    private String endTime;
    
    private Boolean available = true;
}

@Data
class StaffMetricsDto {
    private Integer activeShiftsCount;
    private Integer completedShiftsCount;
    private Double averageRating;
    private Integer totalHoursThisMonth;
    private Double utilizationRate;
}