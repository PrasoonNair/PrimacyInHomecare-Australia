/**
 * Comprehensive Recruitment & Onboarding Service
 * NDIS Compliant recruitment workflow automation
 */

import { db } from "./db";
import { sql, eq, and, or, desc, asc, like, ilike } from "drizzle-orm";
import { 
  jobRequisitions, 
  jobPosts, 
  recruitmentCandidates, 
  recruitmentApplications,
  users,
  staff
} from "@shared/schema";

export interface RecruitmentKPIs {
  totalApplications: number;
  shortlistedCandidates: number;
  interviewsScheduled: number;
  offersExtended: number;
  hiredCandidates: number;
  timeToHire: number; // average days
  costPerHire: number;
  offerAcceptanceRate: number;
  sourcePerformance: Record<string, number>;
}

export interface ApplicationScreeningRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  outcome: 'auto_shortlist' | 'auto_reject' | 'needs_review';
  reason?: string;
  active: boolean;
}

export class RecruitmentService {
  
  /**
   * Create a new job requisition
   */
  async createJobRequisition(data: any, userId: string): Promise<any> {
    const [requisition] = await db
      .insert(jobRequisitions)
      .values({
        ...data,
        createdBy: userId,
        status: 'draft'
      })
      .returning();
    
    console.log(`Job requisition created: ${requisition.title} by ${userId}`);
    return requisition;
  }

  /**
   * Approve job requisition and create job post
   */
  async approveJobRequisition(requisitionId: string, approverId: string): Promise<any> {
    // Update requisition status
    const [updatedRequisition] = await db
      .update(jobRequisitions)
      .set({
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date()
      })
      .where(eq(jobRequisitions.id, requisitionId))
      .returning();

    // Create job post for careers page
    const [jobPost] = await db
      .insert(jobPosts)
      .values({
        jobRequisitionId: requisitionId,
        channel: 'careers',
        status: 'published',
        publishedAt: new Date()
      })
      .returning();

    console.log(`Job requisition approved: ${requisitionId} by ${approverId}`);
    return { requisition: updatedRequisition, jobPost };
  }

  /**
   * Create candidate from job application
   */
  async createCandidateFromApplication(applicationData: any): Promise<any> {
    // Check for duplicate candidates
    const existingCandidate = await db
      .select()
      .from(recruitmentCandidates)
      .where(eq(recruitmentCandidates.email, applicationData.email))
      .limit(1);

    if (existingCandidate.length > 0) {
      return existingCandidate[0];
    }

    const [candidate] = await db
      .insert(recruitmentCandidates)
      .values({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        mobile: applicationData.mobile,
        address: applicationData.address,
        postcode: applicationData.postcode,
        rightToWork: applicationData.rightToWork || false,
        hasLicense: applicationData.hasLicense || false,
        hasVehicle: applicationData.hasVehicle || false,
        languages: applicationData.languages || [],
        qualifications: applicationData.qualifications || [],
        source: applicationData.source || 'careers',
        experienceYears: applicationData.experienceYears || 0,
        ndisExperience: applicationData.ndisExperience || false,
        availability: applicationData.availability || {}
      })
      .returning();

    return candidate;
  }

  /**
   * Submit job application
   */
  async submitJobApplication(data: any): Promise<any> {
    // Create or get candidate
    const candidate = await this.createCandidateFromApplication(data);

    // Create application
    const [application] = await db
      .insert(recruitmentApplications)
      .values({
        candidateId: candidate.id,
        jobRequisitionId: data.jobRequisitionId,
        jobPostId: data.jobPostId,
        answers: data.answers || {},
        coverLetter: data.coverLetter,
        state: 'received'
      })
      .returning();

    // Run auto-screening
    await this.runAutoScreening(application.id);

    console.log(`Job application submitted by ${candidate.email} for job ${data.jobRequisitionId}`);
    return { candidate, application };
  }

  /**
   * Auto-screening engine
   */
  async runAutoScreening(applicationId: string): Promise<void> {
    const [application] = await db
      .select()
      .from(recruitmentApplications)
      .leftJoin(recruitmentCandidates, eq(recruitmentApplications.candidateId, recruitmentCandidates.id))
      .leftJoin(jobRequisitions, eq(recruitmentApplications.jobRequisitionId, jobRequisitions.id))
      .where(eq(recruitmentApplications.id, applicationId));

    if (!application) return;

    const candidate = application.recruitment_candidates;
    const requisition = application.job_requisitions;
    
    // Default screening rules
    let screeningResult = 'needs_review';
    let score = 50; // Base score
    let reason = '';

    // Check essential criteria
    if (requisition?.requiredChecks?.includes('NDIS_WS') && !candidate?.ndisExperience) {
      screeningResult = 'auto_reject';
      reason = 'Missing NDIS Worker Screening or experience';
      score = 20;
    } else if (requisition?.requiredChecks?.includes('license') && !candidate?.hasLicense) {
      screeningResult = 'auto_reject';
      reason = 'Driving license required but not provided';
      score = 15;
    } else if (candidate?.experienceYears >= 2 && candidate?.ndisExperience) {
      screeningResult = 'auto_shortlist';
      reason = 'Strong NDIS experience and qualifications';
      score = 85;
    } else if (candidate?.experienceYears >= 1) {
      screeningResult = 'needs_review';
      reason = 'Good experience, manual review recommended';
      score = 70;
    }

    // Update application with screening result
    await db
      .update(recruitmentApplications)
      .set({
        autoScreeningResult: screeningResult,
        score: score,
        state: screeningResult === 'auto_shortlist' ? 'shortlisted' : 
               screeningResult === 'auto_reject' ? 'rejected' : 'screening',
        rejectedReason: screeningResult === 'auto_reject' ? reason : null,
        updatedAt: new Date()
      })
      .where(eq(recruitmentApplications.id, applicationId));

    console.log(`Auto-screening completed for application ${applicationId}: ${screeningResult}`);
  }

  /**
   * Get recruitment pipeline for kanban view
   */
  async getRecruitmentPipeline(jobRequisitionId?: string): Promise<any> {
    let query = db
      .select({
        application: recruitmentApplications,
        candidate: recruitmentCandidates,
        job: jobRequisitions
      })
      .from(recruitmentApplications)
      .leftJoin(recruitmentCandidates, eq(recruitmentApplications.candidateId, recruitmentCandidates.id))
      .leftJoin(jobRequisitions, eq(recruitmentApplications.jobRequisitionId, jobRequisitions.id));

    if (jobRequisitionId) {
      query = query.where(eq(recruitmentApplications.jobRequisitionId, jobRequisitionId));
    }

    const applications = await query.orderBy(desc(recruitmentApplications.createdAt));

    // Group by state for kanban columns
    const pipeline = {
      received: [],
      screening: [],
      shortlisted: [],
      interviewed: [],
      reference_check: [],
      offer: [],
      hired: [],
      rejected: []
    };

    applications.forEach(app => {
      const state = app.application.state || 'received';
      if (pipeline[state]) {
        pipeline[state].push({
          application: app.application,
          candidate: app.candidate,
          job: app.job
        });
      }
    });

    return pipeline;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId: string, newState: string, reason?: string, reviewerId?: string): Promise<any> {
    const updateData: any = {
      state: newState,
      updatedAt: new Date()
    };

    if (reason) {
      updateData.rejectedReason = reason;
    }

    if (reviewerId) {
      updateData.reviewerId = reviewerId;
      updateData.reviewedAt = new Date();
    }

    const [updatedApplication] = await db
      .update(recruitmentApplications)
      .set(updateData)
      .where(eq(recruitmentApplications.id, applicationId))
      .returning();

    console.log(`Application ${applicationId} status updated to ${newState}`);
    return updatedApplication;
  }

  /**
   * Move hired candidate to staff system
   */
  async convertCandidateToStaff(candidateId: string, applicationId: string, contractDetails: any): Promise<any> {
    const [candidate] = await db
      .select()
      .from(recruitmentCandidates)
      .where(eq(recruitmentCandidates.id, candidateId));

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Create staff record
    const [staffRecord] = await db
      .insert(staff)
      .values({
        employeeId: `EMP${Date.now().toString().slice(-6)}`,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.mobile,
        position: contractDetails.position || "Support Worker",
        department: contractDetails.department || "service_delivery",
        hourlyRate: contractDetails.hourlyRate || "35.00",
        employmentType: contractDetails.employmentType || "casual",
        isActive: true,
        hireDate: new Date(),
        qualifications: candidate.qualifications || []
      })
      .returning();

    // Create user account
    const [userRecord] = await db
      .insert(users)
      .values({
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        role: "support_worker",
        department: contractDetails.department || "service_delivery",
        position: contractDetails.position || "Support Worker",
        phone: candidate.mobile,
        isActive: true
      })
      .returning();

    // Update application status to hired
    await this.updateApplicationStatus(applicationId, 'hired');

    console.log(`Candidate ${candidateId} converted to staff member ${staffRecord.employeeId}`);
    return { staff: staffRecord, user: userRecord };
  }

  /**
   * Get recruitment KPIs and analytics
   */
  async getRecruitmentKPIs(startDate?: Date, endDate?: Date): Promise<RecruitmentKPIs> {
    const dateFilter = startDate && endDate ? 
      and(
        sql`${recruitmentApplications.createdAt} >= ${startDate}`,
        sql`${recruitmentApplications.createdAt} <= ${endDate}`
      ) : undefined;

    // Get application counts by status
    const applications = await db
      .select({
        state: recruitmentApplications.state,
        source: recruitmentCandidates.source,
        createdAt: recruitmentApplications.createdAt
      })
      .from(recruitmentApplications)
      .leftJoin(recruitmentCandidates, eq(recruitmentApplications.candidateId, recruitmentCandidates.id))
      .where(dateFilter);

    const totalApplications = applications.length;
    const shortlistedCandidates = applications.filter(app => 
      ['shortlisted', 'interviewed', 'reference_check', 'offer', 'hired'].includes(app.state)
    ).length;
    const interviewsScheduled = applications.filter(app => 
      ['interviewed', 'reference_check', 'offer', 'hired'].includes(app.state)
    ).length;
    const offersExtended = applications.filter(app => 
      ['offer', 'hired'].includes(app.state)
    ).length;
    const hiredCandidates = applications.filter(app => app.state === 'hired').length;

    // Calculate source performance
    const sourcePerformance: Record<string, number> = {};
    applications.forEach(app => {
      const source = app.source || 'unknown';
      sourcePerformance[source] = (sourcePerformance[source] || 0) + 1;
    });

    return {
      totalApplications,
      shortlistedCandidates,
      interviewsScheduled,
      offersExtended,
      hiredCandidates,
      timeToHire: 14, // Mock - would calculate from actual data
      costPerHire: 1200, // Mock - would calculate from actual costs
      offerAcceptanceRate: offersExtended > 0 ? (hiredCandidates / offersExtended) * 100 : 0,
      sourcePerformance
    };
  }

  /**
   * Search candidates
   */
  async searchCandidates(searchTerm: string, filters?: any): Promise<any[]> {
    let query = db
      .select()
      .from(recruitmentCandidates);

    const conditions = [];

    if (searchTerm) {
      conditions.push(
        or(
          ilike(recruitmentCandidates.firstName, `%${searchTerm}%`),
          ilike(recruitmentCandidates.lastName, `%${searchTerm}%`),
          ilike(recruitmentCandidates.email, `%${searchTerm}%`)
        )
      );
    }

    if (filters?.experienceYears) {
      conditions.push(sql`${recruitmentCandidates.experienceYears} >= ${filters.experienceYears}`);
    }

    if (filters?.ndisExperience) {
      conditions.push(eq(recruitmentCandidates.ndisExperience, filters.ndisExperience));
    }

    if (filters?.hasLicense) {
      conditions.push(eq(recruitmentCandidates.hasLicense, filters.hasLicense));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(recruitmentCandidates.createdAt)).limit(50);
  }

  /**
   * Send automated recruitment messages
   */
  async sendRecruitmentMessage(
    candidateId: string, 
    template: string, 
    variables: Record<string, any> = {}
  ): Promise<void> {
    const [candidate] = await db
      .select()
      .from(recruitmentCandidates)
      .where(eq(recruitmentCandidates.id, candidateId));

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const templates = {
      application_received: {
        subject: "Application Received - {{job_title}}",
        body: `Hi {{first_name}},\n\nThank you for your application for the {{job_title}} position. We'll review your application and get back to you within 48 hours.\n\nBest regards,\nPrimacy Care Australia HR Team`
      },
      interview_invitation: {
        subject: "Interview Invitation - {{job_title}}",
        body: `Hi {{first_name}},\n\nWe'd like to invite you for an interview for the {{job_title}} position. Please use this link to book a convenient time: {{booking_link}}\n\nBest regards,\nPrimacy Care Australia HR Team`
      },
      auto_reject: {
        subject: "Application Update - {{job_title}}",
        body: `Hi {{first_name}},\n\nThank you for your interest in the {{job_title}} position. Unfortunately, we won't be progressing your application at this time. {{reason}}\n\nWe encourage you to apply for future opportunities.\n\nBest regards,\nPrimacy Care Australia HR Team`
      }
    };

    const templateData = templates[template];
    if (!templateData) {
      throw new Error(`Template ${template} not found`);
    }

    // Replace variables in template
    let subject = templateData.subject;
    let body = templateData.body;

    const allVariables = {
      first_name: candidate.firstName,
      last_name: candidate.lastName,
      email: candidate.email,
      ...variables
    };

    Object.entries(allVariables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    // In production, would integrate with email service
    console.log(`Recruitment message sent to ${candidate.email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  }
}