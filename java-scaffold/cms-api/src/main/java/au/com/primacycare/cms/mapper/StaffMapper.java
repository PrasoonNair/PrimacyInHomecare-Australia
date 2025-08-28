package au.com.primacycare.cms.mapper;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.entity.Staff;
import org.mapstruct.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * MapStruct mapper for Staff entity with null-safe conversions and formatting
 */
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
    uses = {DateMapper.class, StateMapper.class, RegionMapper.class}
)
public interface StaffMapper {
    
    /**
     * Entity to DTO mapping with null-safe nested object handling
     */
    @Mapping(target = "availability", source = "staffAvailability")
    @Mapping(target = "metrics", expression = "java(calculateMetrics(staff))")
    @Mapping(target = "state", source = "state", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(target = "region", source = "region", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    StaffDto toDto(Staff staff);
    
    /**
     * Create DTO to Entity with validation
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "staffAvailability", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "shifts", ignore = true)
    @Mapping(target = "progressNotes", ignore = true)
    @Mapping(target = "incidents", ignore = true)
    @Mapping(target = "participantGoals", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "region", ignore = true)
    Staff toEntity(CreateStaffDto dto);
    
    /**
     * Update entity from DTO (partial update)
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "staffAvailability", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "shifts", ignore = true)
    @Mapping(target = "progressNotes", ignore = true)
    @Mapping(target = "incidents", ignore = true)
    @Mapping(target = "participantGoals", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "region", ignore = true)
    void updateEntityFromDto(UpdateStaffDto dto, @MappingTarget Staff staff);
    
    /**
     * Map availability with time formatting
     */
    @Mapping(target = "startTime", expression = "java(formatTime(availability.getStartTime()))")
    @Mapping(target = "endTime", expression = "java(formatTime(availability.getEndTime()))")
    StaffAvailabilityDto toAvailabilityDto(StaffAvailability availability);
    
    /**
     * Enum mapping with null safety
     */
    @ValueMapping(source = "OPERATIONS", target = "OPERATIONS")
    @ValueMapping(source = "INTAKE", target = "INTAKE")
    @ValueMapping(source = "SERVICE_DELIVERY", target = "SERVICE_DELIVERY")
    @ValueMapping(source = "FINANCE", target = "FINANCE")
    @ValueMapping(source = "RECRUITMENT_HR", target = "RECRUITMENT_HR")
    @ValueMapping(source = MappingConstants.NULL, target = MappingConstants.NULL)
    @ValueMapping(source = MappingConstants.ANY_REMAINING, target = MappingConstants.NULL)
    StaffDto.DepartmentEnum mapDepartment(String department);
    
    /**
     * Calculate metrics for staff (called from expression)
     */
    default StaffMetricsDto calculateMetrics(Staff staff) {
        if (staff == null) {
            return null;
        }
        
        StaffMetricsDto metrics = new StaffMetricsDto();
        
        // Calculate active shifts
        if (staff.getShifts() != null) {
            metrics.setActiveShiftsCount(
                (int) staff.getShifts().stream()
                    .filter(shift -> "Scheduled".equals(shift.getStatus()))
                    .count()
            );
            
            metrics.setCompletedShiftsCount(
                (int) staff.getShifts().stream()
                    .filter(shift -> "Completed".equals(shift.getStatus()))
                    .count()
            );
            
            // Calculate total hours this month
            java.time.LocalDate now = java.time.LocalDate.now();
            double totalHours = staff.getShifts().stream()
                .filter(shift -> shift.getShiftDate() != null 
                    && shift.getShiftDate().getMonth() == now.getMonth()
                    && shift.getTotalHours() != null)
                .mapToDouble(shift -> shift.getTotalHours().doubleValue())
                .sum();
            metrics.setTotalHoursThisMonth((int) totalHours);
        }
        
        // Calculate utilization rate (example: hours worked / hours available)
        if (staff.getStaffAvailability() != null && !staff.getStaffAvailability().isEmpty()) {
            double availableHours = staff.getStaffAvailability().stream()
                .filter(StaffAvailability::getAvailable)
                .mapToDouble(avail -> {
                    if (avail.getStartTime() != null && avail.getEndTime() != null) {
                        return java.time.Duration.between(avail.getStartTime(), avail.getEndTime()).toHours();
                    }
                    return 0.0;
                })
                .sum() * 4; // Assuming 4 weeks per month
            
            if (availableHours > 0 && metrics.getTotalHoursThisMonth() != null) {
                metrics.setUtilizationRate(metrics.getTotalHoursThisMonth() / availableHours * 100);
            }
        }
        
        return metrics;
    }
    
    /**
     * Format time for DTO
     */
    default String formatTime(LocalTime time) {
        if (time == null) {
            return null;
        }
        return time.format(DateTimeFormatter.ofPattern("HH:mm"));
    }
    
    /**
     * Parse time from string
     */
    default LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) {
            return null;
        }
        return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
    }
}

/**
 * Date/Time mapper component
 */
@Component
class DateMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    public String asString(java.time.LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }
    
    public java.time.LocalDate asLocalDate(String dateString) {
        return dateString != null ? java.time.LocalDate.parse(dateString, DATE_FORMATTER) : null;
    }
    
    public String asString(java.time.LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : null;
    }
    
    public java.time.LocalDateTime asLocalDateTime(String dateTimeString) {
        return dateTimeString != null ? java.time.LocalDateTime.parse(dateTimeString, DATETIME_FORMATTER) : null;
    }
}