package au.com.primacycare.cms.service;

import au.com.primacycare.cms.dto.*;
import au.com.primacycare.cms.entity.Staff;
import au.com.primacycare.cms.mapper.StaffMapper;
import au.com.primacycare.cms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service skeleton for Staff operations with TODO markers for business logic
 * References Node.js implementation in server/storage.ts and server/routes.ts
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StaffService {
    
    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final PayrollService payrollService;
    private final SchedulingService schedulingService;
    
    /**
     * Get all staff with filtering and pagination
     * Mirrors: server/storage.ts:getStaff()
     */
    @Cacheable(value = "staff", key = "#pageable.pageNumber + '-' + #department")
    @Transactional(readOnly = true)
    public Page<StaffDto> getStaff(Pageable pageable, String department) {
        log.debug("Fetching staff page: {}, department: {}", pageable.getPageNumber(), department);
        
        // TODO: Business rule - Apply role-based filtering
        // Reference: server/routes.ts:463-471
        // - Admin: View all staff
        // - Department Manager: View only their department
        // - Staff: View basic info only
        
        Page<Staff> staff;
        if (department != null && !department.isEmpty()) {
            staff = staffRepository.findByDepartment(department, pageable);
        } else {
            staff = staffRepository.findAll(pageable);
        }
        
        return staff.map(s -> {
            StaffDto dto = staffMapper.toDto(s);
            
            // TODO: Calculate utilization metrics
            // Reference: server/cache.ts staff metrics calculation
            calculateStaffMetrics(s, dto);
            
            return dto;
        });
    }
    
    /**
     * Create new staff member
     * Mirrors: server/storage.ts:createStaffMember()
     */
    @CacheEvict(value = "staff", allEntries = true)
    @Transactional
    public StaffDto createStaffMember(CreateStaffDto dto) {
        log.info("Creating new staff member: {} {}", dto.getFirstName(), dto.getLastName());
        
        // TODO: Business rule - Check for duplicate email
        // Reference: server/storage.ts validation
        if (staffRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
        }
        
        Staff staff = staffMapper.toEntity(dto);
        staff.setId(UUID.randomUUID().toString());
        
        // TODO: Business rule - Initialize staff onboarding workflow
        // Reference: server/routes.ts:479-484
        // - Create onboarding checklist
        // - Assign to HR for document collection
        // - Schedule initial training
        // - Set up system access based on role
        
        // TODO: Business rule - Set up SCHADS award classification
        // Reference: Australian SCHADS Award rates
        // - Determine classification level based on qualifications
        // - Set base rate according to award
        // - Configure penalty rates for weekends/public holidays
        BigDecimal baseRate = calculateSchadsBaseRate(dto.getPosition(), dto.getQualifications());
        
        staff = staffRepository.save(staff);
        
        // TODO: Business rule - Send onboarding notifications
        // - Welcome email with login credentials
        // - Manager notification
        // - HR task assignment
        notificationService.sendStaffOnboardingNotifications(staff);
        
        // Audit log
        auditService.logStaffOnboarded(staff.getId(), SecurityUtils.getCurrentUserId(), staff);
        
        return staffMapper.toDto(staff);
    }
    
    /**
     * Update staff member
     * Mirrors: server/storage.ts:updateStaffMember()
     */
    @CacheEvict(value = {"staff", "staffAvailability"}, allEntries = true)
    @Transactional
    public StaffDto updateStaffMember(String id, UpdateStaffDto dto) {
        log.info("Updating staff member: {}", id);
        
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Staff not found: " + id));
        
        Staff oldStaff = staff.clone();
        
        // TODO: Business rule - Handle department change
        // Reference: server/routes.ts staff department logic
        if (dto.getDepartment() != null && !dto.getDepartment().equals(staff.getDepartment())) {
            // - Reassign active cases
            // - Update reporting lines
            // - Transfer pending tasks
            handleDepartmentChange(staff, dto.getDepartment());
        }
        
        // TODO: Business rule - Recalculate payroll if position changes
        // Reference: SCHADS award calculations
        if (dto.getPosition() != null && !dto.getPosition().equals(staff.getPosition())) {
            BigDecimal newRate = calculateSchadsBaseRate(dto.getPosition(), dto.getQualifications());
            updatePayrollRates(staff.getId(), newRate);
        }
        
        staffMapper.updateEntityFromDto(dto, staff);
        staff = staffRepository.save(staff);
        
        // Audit log
        auditService.logUpdate("staff", staff.getId(), oldStaff, staff);
        
        return staffMapper.toDto(staff);
    }
    
    /**
     * Get staff availability
     * Mirrors: server/routes.ts staff availability endpoints
     */
    @Cacheable(value = "staffAvailability", key = "#staffId + '-' + #weekStart")
    @Transactional(readOnly = true)
    public List<StaffAvailabilityDto> getStaffAvailability(String staffId, LocalDate weekStart) {
        log.debug("Fetching availability for staff: {} week: {}", staffId, weekStart);
        
        // TODO: Business rule - Calculate availability with conflict detection
        // Reference: server/storage.ts availability logic
        // - Check against existing shifts
        // - Validate minimum rest periods (11 hours between shifts)
        // - Apply maximum hours per week restrictions
        // - Consider public holidays and leave
        
        List<StaffAvailability> availability = staffAvailabilityRepository
            .findByStaffIdAndWeek(staffId, weekStart);
        
        return availability.stream()
            .map(avail -> {
                StaffAvailabilityDto dto = staffMapper.toAvailabilityDto(avail);
                
                // TODO: Mark conflicts
                if (hasConflictingShift(avail)) {
                    dto.setHasConflict(true);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Staff allocation algorithm
     * Mirrors: server/workflowService.ts:findMatchingStaff()
     */
    @Transactional(readOnly = true)
    public List<StaffAllocationDto> findMatchingStaff(String participantId, String serviceType, LocalDate date) {
        log.info("Finding matching staff for participant: {} service: {} date: {}", 
                 participantId, serviceType, date);
        
        // TODO: Business rule - Implement intelligent staff matching
        // Reference: server/workflowService.ts matching algorithm
        
        List<Staff> availableStaff = staffRepository.findAvailableStaff(date);
        Participant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new EntityNotFoundException("Participant not found"));
        
        return availableStaff.stream()
            .map(staff -> {
                StaffAllocationDto allocation = new StaffAllocationDto();
                allocation.setStaffId(staff.getId());
                allocation.setStaffName(staff.getFirstName() + " " + staff.getLastName());
                
                // TODO: Calculate matching score based on multiple factors
                int score = 0;
                
                // 1. Qualification match (0-30 points)
                // Reference: NDIS qualification requirements
                if (hasRequiredQualification(staff, serviceType)) {
                    score += 30;
                }
                
                // 2. Geographic proximity (0-25 points)
                // Reference: server/workflowService.ts distance calculation
                double distance = calculateDistance(staff.getRegionId(), participant.getRegionId());
                if (distance < 5) {
                    score += 25;
                } else if (distance < 15) {
                    score += 15;
                } else if (distance < 30) {
                    score += 5;
                }
                
                // 3. Previous relationship (0-20 points)
                // Reference: Continuity of care principle
                if (hasWorkedWithParticipant(staff.getId(), participantId)) {
                    score += 20;
                }
                
                // 4. Language/cultural match (0-15 points)
                // Reference: Cultural safety requirements
                if (matchesCulturalNeeds(staff, participant)) {
                    score += 15;
                }
                
                // 5. Availability fit (0-10 points)
                // Reference: Roster optimization
                if (hasGoodAvailability(staff.getId(), date)) {
                    score += 10;
                }
                
                allocation.setMatchScore(score);
                allocation.setRecommendationReason(generateRecommendationReason(score));
                
                return allocation;
            })
            .sorted((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()))
            .limit(10) // Return top 10 matches
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate SCHADS payroll
     * Mirrors: Payroll calculation logic
     */
    @Async
    @Transactional
    public void calculatePayroll(String staffId, LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        log.info("Calculating payroll for staff: {} period: {} to {}", 
                 staffId, payPeriodStart, payPeriodEnd);
        
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
        
        // TODO: Business rule - SCHADS Award calculation
        // Reference: Australian SCHADS Modern Award
        // https://www.fairwork.gov.au/employment-conditions/awards/
        
        List<Shift> shifts = shiftRepository.findByStaffIdAndPeriod(staffId, payPeriodStart, payPeriodEnd);
        
        BigDecimal totalPay = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;
        
        for (Shift shift : shifts) {
            // TODO: Calculate rates based on time of shift
            BigDecimal rate = staff.getBaseRate();
            
            // Apply penalty rates
            if (isWeekend(shift.getShiftDate())) {
                // Saturday: 150% for first 2 hours, 200% thereafter
                // Sunday: 200% all day
                if (shift.getShiftDate().getDayOfWeek() == DayOfWeek.SATURDAY) {
                    rate = applyPenaltyRate(rate, 1.5, 2.0, shift.getTotalHours());
                } else {
                    rate = rate.multiply(BigDecimal.valueOf(2.0));
                }
            } else if (isPublicHoliday(shift.getShiftDate())) {
                // Public holiday: 250%
                rate = rate.multiply(BigDecimal.valueOf(2.5));
            } else if (isNightShift(shift.getStartTime())) {
                // Night shift (10pm-6am): 115%
                rate = rate.multiply(BigDecimal.valueOf(1.15));
            } else if (isEveningShift(shift.getStartTime())) {
                // Evening shift (6pm-10pm): 112.5%
                rate = rate.multiply(BigDecimal.valueOf(1.125));
            }
            
            // TODO: Add allowances
            // - Travel allowance
            // - Meal allowance
            // - Sleep-over allowance
            // - First aid allowance
            
            BigDecimal shiftPay = rate.multiply(shift.getTotalHours());
            totalPay = totalPay.add(shiftPay);
            totalHours = totalHours.add(shift.getTotalHours());
            
            // Update shift with calculated pay
            shift.setTotalPay(shiftPay);
            shiftRepository.save(shift);
        }
        
        // TODO: Calculate superannuation (11% as of 2024)
        BigDecimal superannuation = totalPay.multiply(BigDecimal.valueOf(0.11));
        
        // TODO: Create payroll record
        PayrollRecord payroll = new PayrollRecord();
        payroll.setStaffId(staffId);
        payroll.setPeriodStart(payPeriodStart);
        payroll.setPeriodEnd(payPeriodEnd);
        payroll.setTotalHours(totalHours);
        payroll.setGrossPay(totalPay);
        payroll.setSuperannuation(superannuation);
        payrollRepository.save(payroll);
        
        // Audit log
        auditService.logPayrollCalculated(staffId, payroll);
    }
    
    /**
     * Helper: Calculate SCHADS base rate
     */
    private BigDecimal calculateSchadsBaseRate(String position, List<String> qualifications) {
        // TODO: Implement SCHADS award rate calculation
        // Reference: SCHADS Modern Award pay rates
        // Level 1: $28.26/hour (2024 rate)
        // Level 2: $29.65/hour
        // Level 3: $30.91/hour
        // Level 4: $32.58/hour
        // Level 5: $35.39/hour
        // Level 6: $37.28/hour
        // Level 7: $38.52/hour
        // Level 8: $41.72/hour
        
        return BigDecimal.valueOf(30.91); // Default Level 3
    }
    
    /**
     * Helper: Calculate staff metrics
     */
    private void calculateStaffMetrics(Staff staff, StaffDto dto) {
        // TODO: Implement metrics calculation
        // Reference: server/cache.ts metrics logic
    }
    
    /**
     * Helper: Check for conflicting shifts
     */
    private boolean hasConflictingShift(StaffAvailability availability) {
        // TODO: Check for shift conflicts
        return false;
    }
    
    /**
     * Helper: Check required qualifications
     */
    private boolean hasRequiredQualification(Staff staff, String serviceType) {
        // TODO: Match qualifications to service requirements
        return true;
    }
    
    /**
     * Helper: Calculate distance between regions
     */
    private double calculateDistance(String regionId1, String regionId2) {
        // TODO: Implement distance calculation
        return 10.0;
    }
    
    /**
     * Helper: Check previous participant relationship
     */
    private boolean hasWorkedWithParticipant(String staffId, String participantId) {
        // TODO: Check service history
        return false;
    }
    
    /**
     * Helper: Check cultural match
     */
    private boolean matchesCulturalNeeds(Staff staff, Participant participant) {
        // TODO: Compare languages and cultural background
        return false;
    }
    
    /**
     * Helper: Check availability quality
     */
    private boolean hasGoodAvailability(String staffId, LocalDate date) {
        // TODO: Check roster gaps and preferences
        return true;
    }
    
    /**
     * Helper: Generate recommendation reason
     */
    private String generateRecommendationReason(int score) {
        if (score >= 80) {
            return "Excellent match - highly qualified and available";
        } else if (score >= 60) {
            return "Good match - meets key requirements";
        } else if (score >= 40) {
            return "Moderate match - consider if others unavailable";
        } else {
            return "Low match - may not meet requirements";
        }
    }
    
    /**
     * Helper: Handle department change
     */
    private void handleDepartmentChange(Staff staff, StaffDto.DepartmentEnum newDepartment) {
        // TODO: Implement department change logic
        log.info("Handling department change for staff: {} to {}", staff.getId(), newDepartment);
    }
    
    /**
     * Helper: Update payroll rates
     */
    private void updatePayrollRates(String staffId, BigDecimal newRate) {
        // TODO: Update payroll configuration
        log.info("Updating payroll rate for staff: {} to {}", staffId, newRate);
    }
}