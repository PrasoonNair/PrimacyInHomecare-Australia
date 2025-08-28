package au.com.primacycare.cms.service;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.entity.Participant;
import au.com.primacycare.cms.mapper.ParticipantMapper;
import au.com.primacycare.cms.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service skeleton for Participant operations with TODO markers for business logic
 * References Node.js implementation in server/storage.ts
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ParticipantService {
    
    private final ParticipantRepository participantRepository;
    private final ParticipantMapper participantMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final WorkflowService workflowService;
    
    /**
     * Get paginated participants with caching
     * Mirrors: server/storage.ts:getParticipants()
     */
    @Cacheable(value = "participants", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #status + '-' + #ndisNumber")
    @Transactional(readOnly = true)
    public Page<ParticipantDto> getParticipants(Pageable pageable, String status, String ndisNumber) {
        log.debug("Fetching participants page: {}, status: {}, ndis: {}", pageable.getPageNumber(), status, ndisNumber);
        
        // TODO: Implement filtering logic from server/storage.ts:getParticipants()
        // - Filter by status if provided
        // - Filter by NDIS number if provided
        // - Apply role-based data filtering based on current user
        
        Page<Participant> participants;
        
        if (ndisNumber != null && !ndisNumber.isEmpty()) {
            participants = participantRepository.findByNdisNumberContaining(ndisNumber, pageable);
        } else if (status != null && !status.isEmpty()) {
            // TODO: Implement status-based filtering
            participants = participantRepository.findAll(pageable);
        } else {
            participants = participantRepository.findAll(pageable);
        }
        
        return participants.map(participantMapper::toDto);
    }
    
    /**
     * Get single participant by ID
     * Mirrors: server/storage.ts:getParticipantById()
     */
    @Cacheable(value = "participant", key = "#id")
    @Transactional(readOnly = true)
    public ParticipantDto getParticipant(String id) {
        log.debug("Fetching participant: {}", id);
        
        // TODO: Business rule - Check user has permission to view this participant
        // Reference: server/routes.ts:349-358 authorization logic
        
        Participant participant = participantRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Participant not found: " + id));
        
        // TODO: Business rule - Load related data based on user role
        // - Admin/Case Manager: Full access including financial data
        // - Support Worker: Limited to service-related data
        // - Participant: Only their own data
        
        return participantMapper.toDto(participant);
    }
    
    /**
     * Create new participant
     * Mirrors: server/storage.ts:createParticipant()
     */
    @CacheEvict(value = "participants", allEntries = true)
    @Transactional
    public ParticipantDto createParticipant(CreateParticipantDto dto) {
        log.info("Creating new participant: {} {}", dto.getFirstName(), dto.getLastName());
        
        // TODO: Business rule - Validate NDIS number format and uniqueness
        // Reference: server/storage.ts:createParticipant() validation
        if (participantRepository.existsByNdisNumber(dto.getNdisNumber())) {
            throw new DuplicateResourceException("NDIS number already exists: " + dto.getNdisNumber());
        }
        
        // TODO: Business rule - Auto-generate participant ID if not provided
        Participant participant = participantMapper.toEntity(dto);
        participant.setId(UUID.randomUUID().toString());
        
        // TODO: Business rule - Set created_by from security context
        participant.setCreatedBy(SecurityUtils.getCurrentUserId());
        
        // TODO: Business rule - Initialize default values
        // - Set default funding type based on age
        // - Create initial service agreement status
        // - Set up default communication preferences
        
        participant = participantRepository.save(participant);
        
        // TODO: Business rule - Create initial workflow entry
        // Reference: server/workflowService.ts:createReferral()
        workflowService.initializeParticipantWorkflow(participant.getId());
        
        // TODO: Business rule - Send welcome notifications
        // Reference: server/routes.ts notification logic
        notificationService.sendWelcomeNotifications(participant);
        
        // Audit log
        auditService.logCreate("participant", participant.getId(), participant);
        
        return participantMapper.toDto(participant);
    }
    
    /**
     * Update participant
     * Mirrors: server/storage.ts:updateParticipant()
     */
    @CacheEvict(value = {"participant", "participants"}, allEntries = true)
    @Transactional
    public ParticipantDto updateParticipant(String id, UpdateParticipantDto dto) {
        log.info("Updating participant: {}", id);
        
        Participant participant = participantRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Participant not found: " + id));
        
        // TODO: Business rule - Check user has permission to edit this participant
        // Reference: server/routes.ts authorization checks
        
        // Store old values for audit
        Participant oldParticipant = participant.clone();
        
        // TODO: Business rule - Validate changes
        // - Cannot change NDIS number once set
        // - Cannot change date of birth if services exist
        // - Validate guardian info if participant is minor
        
        participantMapper.updateEntityFromDto(dto, participant);
        
        // TODO: Business rule - Handle cascading updates
        // - Update service agreements if funding type changed
        // - Update staff allocations if location changed
        // - Recalculate budget if plan details changed
        
        participant = participantRepository.save(participant);
        
        // TODO: Business rule - Trigger notifications for significant changes
        // - Notify case manager if contact details changed
        // - Notify finance if funding type changed
        // - Notify assigned staff if availability changed
        
        // Audit log
        auditService.logUpdate("participant", participant.getId(), oldParticipant, participant);
        
        return participantMapper.toDto(participant);
    }
    
    /**
     * Delete participant (soft delete)
     * Mirrors: server/storage.ts:deleteParticipant()
     */
    @CacheEvict(value = {"participant", "participants"}, allEntries = true)
    @Transactional
    public void deleteParticipant(String id) {
        log.warn("Deleting participant: {}", id);
        
        Participant participant = participantRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Participant not found: " + id));
        
        // TODO: Business rule - Check for active services
        // Reference: server/storage.ts delete validations
        if (hasActiveServices(participant)) {
            throw new BusinessRuleException("Cannot delete participant with active services");
        }
        
        // TODO: Business rule - Archive related data
        // - Archive all service records
        // - Archive all progress notes
        // - Archive all invoices
        // - Maintain audit trail
        
        // TODO: Business rule - Soft delete (mark as inactive)
        // participant.setStatus("INACTIVE");
        // participant.setDeletedAt(LocalDateTime.now());
        // participantRepository.save(participant);
        
        // Hard delete for now
        participantRepository.delete(participant);
        
        // Audit log
        auditService.logDelete("participant", participant.getId(), participant);
    }
    
    /**
     * Get participant goals
     * Mirrors: server/routes.ts:2144-2152
     */
    @Cacheable(value = "participantGoals", key = "#participantId")
    @Transactional(readOnly = true)
    public List<ParticipantGoalDto> getParticipantGoals(String participantId) {
        log.debug("Fetching goals for participant: {}", participantId);
        
        // TODO: Business rule - Load goals with progress calculation
        // Reference: server/storage.ts goal loading logic
        // - Calculate progress percentage based on completed actions
        // - Include staff assignments
        // - Filter based on user role permissions
        
        return participantGoalRepository.findByParticipantId(participantId)
            .stream()
            .map(goal -> {
                ParticipantGoalDto dto = goalMapper.toDto(goal);
                
                // TODO: Calculate progress from completed actions
                int completedActions = goal.getActions().stream()
                    .filter(action -> "Completed".equals(action.getStatus()))
                    .count();
                int totalActions = goal.getActions().size();
                
                if (totalActions > 0) {
                    dto.setProgress((completedActions * 100) / totalActions);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Create participant goal
     * Mirrors: Node.js goal creation logic
     */
    @CacheEvict(value = "participantGoals", key = "#participantId")
    @Transactional
    public ParticipantGoalDto createGoal(String participantId, CreateGoalDto dto) {
        log.info("Creating goal for participant: {}", participantId);
        
        // TODO: Business rule - Validate participant exists and is active
        
        // TODO: Business rule - Check goal aligns with NDIS plan categories
        // - Validate against participant's approved NDIS plan
        // - Ensure funding is available for goal category
        
        // TODO: Business rule - Auto-assign staff based on goal type
        // - Match staff qualifications with goal requirements
        // - Consider staff availability and workload
        // - Apply geographic proximity rules
        
        // TODO: Business rule - Generate default action items
        // - Create standard actions based on goal template
        // - Set realistic timelines based on goal complexity
        // - Calculate estimated costs from NDIS price guide
        
        ParticipantGoal goal = goalMapper.toEntity(dto);
        goal.setParticipantId(participantId);
        goal.setId(UUID.randomUUID().toString());
        goal = participantGoalRepository.save(goal);
        
        // TODO: Business rule - Send notifications
        // - Notify assigned staff
        // - Update participant portal
        // - Alert case manager
        
        // Audit log
        auditService.logCreate("participantGoal", goal.getId(), goal);
        
        return goalMapper.toDto(goal);
    }
    
    /**
     * Helper method to check for active services
     */
    private boolean hasActiveServices(Participant participant) {
        // TODO: Implement check for active services
        // Reference: server/storage.ts service checking logic
        return participant.getServices() != null && 
               participant.getServices().stream()
                   .anyMatch(service -> service.getScheduledDate() != null && 
                            service.getScheduledDate().isAfter(java.time.LocalDate.now()));
    }
}