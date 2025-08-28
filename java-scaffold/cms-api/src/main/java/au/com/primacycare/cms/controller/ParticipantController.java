package au.com.primacycare.cms.controller;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.service.ParticipantService;
import au.com.primacycare.cms.security.RequiresRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Mirrors Express routes from server/routes.ts:339-409
 * GET /api/participants
 * GET /api/participants/:id
 * POST /api/participants
 * PUT /api/participants/:id
 * DELETE /api/participants/:id
 */
@RestController
@RequestMapping("/participants")
@RequiredArgsConstructor
@Tag(name = "Participants", description = "NDIS Participant Management")
@PreAuthorize("isAuthenticated()")
public class ParticipantController {
    
    private final ParticipantService participantService;
    
    @GetMapping
    @Operation(summary = "Get all participants with pagination")
    @RequiresRole({"admin", "case_manager", "support_coordinator", "staff"})
    public Page<ParticipantDto> getParticipants(
            Pageable pageable,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String ndisNumber) {
        // TODO: Implement caching from server/cache.ts
        return participantService.getParticipants(pageable, status, ndisNumber);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get participant by ID")
    @RequiresRole({"admin", "case_manager", "support_coordinator", "staff"})
    public ParticipantDto getParticipant(@PathVariable String id) {
        return participantService.getParticipant(id);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create new participant")
    @RequiresRole({"admin", "case_manager", "support_coordinator"})
    public ParticipantDto createParticipant(@Valid @RequestBody CreateParticipantDto dto) {
        // TODO: Add audit logging as in server/routes.ts
        return participantService.createParticipant(dto);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update participant")
    @RequiresRole({"admin", "case_manager", "support_coordinator"})
    public ParticipantDto updateParticipant(
            @PathVariable String id,
            @Valid @RequestBody UpdateParticipantDto dto) {
        // TODO: Add audit logging
        return participantService.updateParticipant(id, dto);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete participant")
    @RequiresRole({"admin"})
    public void deleteParticipant(@PathVariable String id) {
        // TODO: Add audit logging
        participantService.deleteParticipant(id);
    }
    
    @GetMapping("/{participantId}/goals")
    @Operation(summary = "Get participant goals")
    @RequiresRole({"admin", "case_manager", "support_coordinator", "staff"})
    public List<ParticipantGoalDto> getParticipantGoals(@PathVariable String participantId) {
        return participantService.getParticipantGoals(participantId);
    }
    
    @PostMapping("/{participantId}/goals")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create participant goal")
    @RequiresRole({"admin", "case_manager", "support_coordinator"})
    public ParticipantGoalDto createParticipantGoal(
            @PathVariable String participantId,
            @Valid @RequestBody CreateGoalDto dto) {
        return participantService.createGoal(participantId, dto);
    }
}