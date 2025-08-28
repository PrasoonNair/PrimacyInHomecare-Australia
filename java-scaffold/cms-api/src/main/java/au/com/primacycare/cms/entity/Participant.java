package au.com.primacycare.cms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity mapping for 'participants' table
 * Mirrors TypeScript interface from shared/schema.ts
 */
@Entity
@Table(name = "participants", indexes = {
    @Index(name = "idx_participants_ndis", columnList = "ndis_number"),
    @Index(name = "idx_participants_user", columnList = "user_id"),
    @Index(name = "idx_participants_created", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class Participant extends BaseAuditEntity {
    
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "id", length = 36)
    private String id;
    
    @NotNull
    @Column(name = "user_id", length = 255)
    private String userId;
    
    @NotNull
    @Column(name = "first_name", length = 100)
    private String firstName;
    
    @NotNull
    @Column(name = "last_name", length = 100)
    private String lastName;
    
    @Column(name = "preferred_name", length = 100)
    private String preferredName;
    
    @NotNull
    @Pattern(regexp = "\\d{9}")
    @Column(name = "ndis_number", length = 20, unique = true)
    private String ndisNumber;
    
    @NotNull
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "gender", length = 20)
    private String gender;
    
    @Column(name = "pronouns", length = 50)
    private String pronouns;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "email", length = 255)
    private String email;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "emergency_contact", columnDefinition = "TEXT")
    private String emergencyContact;
    
    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;
    
    @Column(name = "cultural_background", length = 255)
    private String culturalBackground;
    
    @Column(name = "languages_spoken", length = 255)
    private String languagesSpoken;
    
    @Column(name = "communication_needs", columnDefinition = "TEXT")
    private String communicationNeeds;
    
    @Column(name = "mobility_needs", columnDefinition = "TEXT")
    private String mobilityNeeds;
    
    @Column(name = "medical_conditions", columnDefinition = "TEXT")
    private String medicalConditions;
    
    @Column(name = "medications", columnDefinition = "TEXT")
    private String medications;
    
    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;
    
    @Column(name = "gp_name", length = 255)
    private String gpName;
    
    @Column(name = "gp_contact", length = 255)
    private String gpContact;
    
    @Column(name = "specialist_contacts", columnDefinition = "TEXT")
    private String specialistContacts;
    
    @Column(name = "guardian_name", length = 255)
    private String guardianName;
    
    @Column(name = "guardian_relationship", length = 100)
    private String guardianRelationship;
    
    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;
    
    @Column(name = "guardian_email", length = 255)
    private String guardianEmail;
    
    @Column(name = "plan_manager", length = 255)
    private String planManager;
    
    @Column(name = "plan_manager_email", length = 255)
    private String planManagerEmail;
    
    @Column(name = "plan_manager_phone", length = 20)
    private String planManagerPhone;
    
    @Column(name = "support_coordinator", length = 255)
    private String supportCoordinator;
    
    @Column(name = "support_coordinator_email", length = 255)
    private String supportCoordinatorEmail;
    
    @Column(name = "support_coordinator_phone", length = 20)
    private String supportCoordinatorPhone;
    
    @Column(name = "goals", columnDefinition = "TEXT")
    private String goals;
    
    @Column(name = "interests", columnDefinition = "TEXT")
    private String interests;
    
    @Column(name = "preferred_activities", columnDefinition = "TEXT")
    private String preferredActivities;
    
    @Column(name = "funding_type", length = 50)
    private String fundingType;
    
    @Column(name = "transport_method", length = 100)
    private String transportMethod;
    
    @Column(name = "dietary_requirements", columnDefinition = "TEXT")
    private String dietaryRequirements;
    
    @Column(name = "behaviour_support_plan", columnDefinition = "TEXT")
    private String behaviourSupportPlan;
    
    @Column(name = "risk_assessment", columnDefinition = "TEXT")
    private String riskAssessment;
    
    @Column(name = "incident_notes", columnDefinition = "TEXT")
    private String incidentNotes;
    
    @Column(name = "consent_photos")
    private Boolean consentPhotos = false;
    
    @Column(name = "consent_data_sharing")
    private Boolean consentDataSharing = false;
    
    @Column(name = "profile_photo", length = 500)
    private String profilePhoto;
    
    @Column(name = "documents", columnDefinition = "TEXT")
    private String documents;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_by", length = 255)
    private String createdBy;
    
    @Column(name = "state_id", length = 36)
    private String stateId;
    
    @Column(name = "region_id", length = 36)
    private String regionId;
    
    // One-to-Many relationships
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NdisPlan> ndisPlans = new ArrayList<>();
    
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Service> services = new ArrayList<>();
    
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ParticipantGoal> participantGoals = new ArrayList<>();
    
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Invoice> invoices = new ArrayList<>();
    
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProgressNote> progressNotes = new ArrayList<>();
    
    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Incident> incidents = new ArrayList<>();
    
    // Many-to-One relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", insertable = false, updatable = false)
    private State state;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", insertable = false, updatable = false)
    private Region region;
}