package au.com.primacycare.cms.mapper;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.entity.Service;
import au.com.primacycare.cms.entity.Staff;
import au.com.primacycare.cms.entity.Participant;
import org.mapstruct.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalTime;

/**
 * MapStruct mapper for Service entity with NDIS price calculations
 */
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
    imports = {BigDecimal.class, Duration.class, LocalTime.class}
)
public interface ServiceMapper {
    
    /**
     * Entity to DTO with cost calculations
     */
    @Mapping(target = "participant", source = "participant", qualifiedByName = "toParticipantSummary")
    @Mapping(target = "assignedStaff", source = "assignedTo", qualifiedByName = "toStaffSummary")
    @Mapping(target = "totalCost", expression = "java(calculateTotalCost(service))")
    ServiceDto toDto(Service service);
    
    /**
     * Create DTO to Entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "participant", ignore = true)
    @Mapping(target = "assignedStaff", ignore = true)
    @Mapping(target = "durationMinutes", expression = "java(calculateDuration(dto.getStartTime(), dto.getEndTime()))")
    @Mapping(target = "totalCost", expression = "java(calculateCostFromDto(dto))")
    Service toEntity(CreateServiceDto dto);
    
    /**
     * Update entity from DTO
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "participant", ignore = true)
    @Mapping(target = "assignedStaff", ignore = true)
    void updateEntityFromDto(UpdateServiceDto dto, @MappingTarget Service service);
    
    /**
     * Map participant to summary
     */
    @Named("toParticipantSummary")
    default ParticipantSummaryDto toParticipantSummary(Participant participant) {
        if (participant == null) return null;
        
        ParticipantSummaryDto summary = new ParticipantSummaryDto();
        summary.setId(participant.getId());
        summary.setFirstName(participant.getFirstName());
        summary.setLastName(participant.getLastName());
        summary.setNdisNumber(participant.getNdisNumber());
        summary.setProfilePhoto(participant.getProfilePhoto());
        return summary;
    }
    
    /**
     * Map staff to summary
     */
    @Named("toStaffSummary")
    default StaffSummaryDto toStaffSummary(Staff staff) {
        if (staff == null) return null;
        
        StaffSummaryDto summary = new StaffSummaryDto();
        summary.setId(staff.getId());
        summary.setFirstName(staff.getFirstName());
        summary.setLastName(staff.getLastName());
        summary.setPosition(staff.getPosition());
        return summary;
    }
    
    /**
     * Calculate duration in minutes
     */
    default Integer calculateDuration(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) return null;
        
        Duration duration = Duration.between(startTime, endTime);
        if (duration.isNegative()) {
            // Handle overnight shifts
            duration = duration.plusHours(24);
        }
        return (int) duration.toMinutes();
    }
    
    /**
     * Calculate total cost based on NDIS pricing
     */
    default BigDecimal calculateTotalCost(Service service) {
        if (service == null || service.getRate() == null || service.getDurationMinutes() == null) {
            return BigDecimal.ZERO;
        }
        
        // NDIS rates are typically per hour
        BigDecimal hours = BigDecimal.valueOf(service.getDurationMinutes())
            .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        
        BigDecimal baseCost = service.getRate().multiply(hours);
        
        // Apply rate type multipliers
        BigDecimal multiplier = getRateMultiplier(service.getRateType());
        BigDecimal totalCost = baseCost.multiply(multiplier);
        
        // Add transport cost if applicable
        if (service.getTransportCost() != null) {
            totalCost = totalCost.add(service.getTransportCost());
        }
        
        return totalCost.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate cost from DTO
     */
    default BigDecimal calculateCostFromDto(CreateServiceDto dto) {
        if (dto.getTotalCost() != null) {
            return dto.getTotalCost();
        }
        
        if (dto.getRate() == null || dto.getDurationMinutes() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal hours = BigDecimal.valueOf(dto.getDurationMinutes())
            .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        
        BigDecimal baseCost = dto.getRate().multiply(hours);
        BigDecimal multiplier = getRateMultiplier(dto.getRateType());
        BigDecimal totalCost = baseCost.multiply(multiplier);
        
        if (dto.getTransportCost() != null) {
            totalCost = totalCost.add(dto.getTransportCost());
        }
        
        return totalCost.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Get rate multiplier based on rate type
     */
    default BigDecimal getRateMultiplier(ServiceDto.RateTypeEnum rateType) {
        if (rateType == null) return BigDecimal.ONE;
        
        return switch (rateType) {
            case SATURDAY -> BigDecimal.valueOf(1.5);
            case SUNDAY -> BigDecimal.valueOf(2.0);
            case PUBLIC_HOLIDAY -> BigDecimal.valueOf(2.5);
            case NIGHT -> BigDecimal.valueOf(1.15);
            case EVENING -> BigDecimal.valueOf(1.125);
            default -> BigDecimal.ONE;
        };
    }
    
    /**
     * Get rate multiplier for string rate type
     */
    default BigDecimal getRateMultiplier(String rateType) {
        if (rateType == null) return BigDecimal.ONE;
        
        try {
            ServiceDto.RateTypeEnum enumType = ServiceDto.RateTypeEnum.valueOf(rateType);
            return getRateMultiplier(enumType);
        } catch (IllegalArgumentException e) {
            return BigDecimal.ONE;
        }
    }
    
    /**
     * After mapping enrichment
     */
    @AfterMapping
    default void enrichServiceDto(@MappingTarget ServiceDto dto, Service service) {
        // Add NDIS item description if available
        if (service.getItemNumber() != null) {
            dto.setItemDescription(getNdisItemDescription(service.getItemNumber()));
        }
        
        // Calculate GST if applicable
        if (dto.getTotalCost() != null) {
            BigDecimal gst = dto.getTotalCost()
                .multiply(BigDecimal.valueOf(0.10))
                .setScale(2, RoundingMode.HALF_UP);
            dto.setGstAmount(gst);
            dto.setTotalIncGst(dto.getTotalCost().add(gst));
        }
        
        // Add service status
        if (service.getScheduledDate() != null) {
            if (service.getScheduledDate().isBefore(java.time.LocalDate.now())) {
                dto.setServiceStatus("Completed");
            } else if (service.getScheduledDate().equals(java.time.LocalDate.now())) {
                dto.setServiceStatus("Today");
            } else {
                dto.setServiceStatus("Scheduled");
            }
        }
    }
    
    /**
     * Get NDIS item description from item number
     */
    default String getNdisItemDescription(String itemNumber) {
        // Sample NDIS item descriptions
        return switch (itemNumber) {
            case "01_011_0107_1_1" -> "Assistance With Self-Care Activities - Standard - Weekday Daytime";
            case "04_104_0125_6_1" -> "Group-Based Community, Social And Recreational Activities";
            case "07_001_0106_8_3" -> "Support Coordination";
            case "01_010_0107_1_1" -> "Assistance With Self-Care Activities - Night-Time Sleepover";
            case "01_012_0107_1_1" -> "Assistance With Self-Care Activities - Public Holiday";
            default -> "NDIS Support Service";
        };
    }
}