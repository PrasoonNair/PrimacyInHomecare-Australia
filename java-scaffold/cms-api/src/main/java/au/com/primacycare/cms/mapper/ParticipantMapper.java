package au.com.primacycare.cms.mapper;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.entity.Participant;
import org.mapstruct.*;

/**
 * MapStruct mapper for Participant entity
 * Converts between Entity, DTO, and Create/Update DTOs
 * Mirrors TypeScript type conversions
 */
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    uses = {StateMapper.class, RegionMapper.class, NdisPlanMapper.class, ServiceMapper.class}
)
public interface ParticipantMapper {
    
    /**
     * Entity to DTO conversion
     */
    @Mapping(target = "activeServicesCount", expression = "java(participant.getServices() != null ? (int)participant.getServices().stream().filter(s -> s.getScheduledDate() != null && s.getScheduledDate().isAfter(java.time.LocalDate.now())).count() : 0)")
    @Mapping(target = "goalsCount", expression = "java(participant.getParticipantGoals() != null ? participant.getParticipantGoals().size() : 0)")
    @Mapping(target = "upcomingAppointmentsCount", ignore = true) // TODO: Calculate from services
    @Mapping(target = "currentPlanStatus", ignore = true) // TODO: Get from active plan
    @Mapping(target = "recentPlans", source = "ndisPlans")
    @Mapping(target = "recentServices", source = "services")
    ParticipantDto toDto(Participant participant);
    
    /**
     * Create DTO to Entity conversion
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userId", ignore = true) // Set from security context
    @Mapping(target = "createdBy", ignore = true) // Set from security context
    @Mapping(target = "ndisPlans", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "participantGoals", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    @Mapping(target = "progressNotes", ignore = true)
    @Mapping(target = "incidents", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "region", ignore = true)
    Participant toEntity(CreateParticipantDto dto);
    
    /**
     * Update existing entity from DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "ndisPlans", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "participantGoals", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    @Mapping(target = "progressNotes", ignore = true)
    @Mapping(target = "incidents", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "region", ignore = true)
    void updateEntityFromDto(UpdateParticipantDto dto, @MappingTarget Participant participant);
    
    /**
     * After mapping enrichment
     */
    @AfterMapping
    default void enrichDto(@MappingTarget ParticipantDto dto, Participant participant) {
        // Calculate age from date of birth
        if (participant.getDateOfBirth() != null) {
            int age = java.time.Period.between(
                participant.getDateOfBirth(),
                java.time.LocalDate.now()
            ).getYears();
            // Can add age to DTO if needed
        }
        
        // Get current active plan status
        if (participant.getNdisPlans() != null && !participant.getNdisPlans().isEmpty()) {
            participant.getNdisPlans().stream()
                .filter(plan -> plan.getStartDate().isBefore(java.time.LocalDate.now()) 
                    && plan.getEndDate().isAfter(java.time.LocalDate.now()))
                .findFirst()
                .ifPresent(plan -> dto.setCurrentPlanStatus("Active"));
        }
    }
}