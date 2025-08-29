import { Express, Request, Response } from "express";
import { db } from "./db";
import { participants, staff, referrals, jobApplications } from "@shared/schema";
import { format } from "date-fns";

/**
 * Public API routes for website widgets
 * These endpoints accept data from external websites
 */
export function setupPublicWidgetRoutes(app: Express) {
  // Enable CORS for widget endpoints
  app.use("/api/public/*", (req, res, next) => {
    // Allow requests from any origin for public widgets
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Widget-Source");
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    
    next();
  });

  /**
   * Public Referral Submission Endpoint
   * Receives referrals from external website widget
   */
  app.post("/api/public/referral", async (req: Request, res: Response) => {
    try {
      const referralData = req.body;
      const widgetSource = req.headers["x-widget-source"] || "unknown";
      
      // Validate required fields
      if (!referralData.participantFirstName || !referralData.participantLastName || !referralData.referrerEmail) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Generate reference number
      const referenceNumber = `REF-${Date.now()}`;
      
      // Create referral record
      const newReferral = {
        referenceNumber,
        status: "new",
        priority: referralData.urgency || "standard",
        source: widgetSource as string,
        submittedAt: new Date(),
        
        // Participant details
        participantFirstName: referralData.participantFirstName,
        participantLastName: referralData.participantLastName,
        participantDOB: referralData.participantDOB,
        participantNDISNumber: referralData.participantNDISNumber,
        participantPhone: referralData.participantPhone,
        participantEmail: referralData.participantEmail,
        participantAddress: `${referralData.participantAddress}, ${referralData.participantSuburb} ${referralData.participantState} ${referralData.participantPostcode}`,
        
        // Referrer details
        referrerName: referralData.referrerName,
        referrerOrganization: referralData.referrerOrganization,
        referrerRole: referralData.referrerRole,
        referrerPhone: referralData.referrerPhone,
        referrerEmail: referralData.referrerEmail,
        referralSource: referralData.referralSource,
        
        // Support needs
        primaryDisability: referralData.primaryDisability,
        supportNeeds: referralData.supportNeeds,
        additionalInfo: referralData.additionalInfo,
        
        // Processing
        assignedTo: null,
        processedAt: null,
        notes: "Submitted via website widget"
      };

      // In production, this would insert into the referrals table
      // For now, we'll simulate the insertion
      console.log("New referral received:", newReferral);
      
      // Send email notification to intake team
      await sendIntakeNotification(newReferral);
      
      // Return success response
      res.json({
        success: true,
        referenceNumber,
        message: "Referral submitted successfully",
        estimatedResponse: "24-48 hours"
      });
      
    } catch (error) {
      console.error("Error processing referral:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process referral" 
      });
    }
  });

  /**
   * Public Careers/Job Application Endpoint
   * Receives job applications from careers widget
   */
  app.post("/api/public/careers", async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      const widgetSource = req.headers["x-widget-source"] || "unknown";
      
      // Validate required fields
      if (!applicationData.firstName || !applicationData.lastName || !applicationData.email) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      // Generate application ID
      const applicationId = `APP-${Date.now()}`;
      
      // Create job application record
      const newApplication = {
        applicationId,
        status: "new",
        source: widgetSource as string,
        submittedAt: new Date(),
        
        // Personal details
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        address: `${applicationData.address}, ${applicationData.suburb} ${applicationData.state} ${applicationData.postcode}`,
        
        // Position details
        positionApplying: applicationData.positionApplying,
        employmentType: applicationData.employmentType,
        availability: applicationData.availability,
        expectedSalary: applicationData.expectedSalary,
        
        // Qualifications
        highestQualification: applicationData.highestQualification,
        yearsExperience: applicationData.yearsExperience,
        ndisWorkerScreening: applicationData.ndisWorkerScreening,
        ndisScreeningExpiry: applicationData.ndisScreeningExpiry,
        firstAidCertificate: applicationData.firstAidCertificate,
        driversLicense: applicationData.driversLicense,
        ownVehicle: applicationData.ownVehicle,
        
        // Experience & preferences
        previousRole: applicationData.previousRole,
        previousEmployer: applicationData.previousEmployer,
        specializations: applicationData.specializations,
        languages: applicationData.languages,
        preferredLocations: applicationData.preferredLocations,
        shiftPreferences: applicationData.shiftPreferences,
        
        // Cover letter & references
        coverLetter: applicationData.coverLetter,
        referee1: {
          name: applicationData.referee1Name,
          phone: applicationData.referee1Phone,
          relationship: applicationData.referee1Relationship
        },
        referee2: {
          name: applicationData.referee2Name,
          phone: applicationData.referee2Phone,
          relationship: applicationData.referee2Relationship
        },
        
        // Processing
        assignedRecruiter: null,
        screeningStatus: "pending",
        interviewDate: null,
        notes: "Submitted via careers widget"
      };

      // In production, this would insert into the jobApplications table
      console.log("New job application received:", newApplication);
      
      // Send notification to HR team
      await sendHRNotification(newApplication);
      
      // If NDIS screening is current, fast-track the application
      if (applicationData.ndisWorkerScreening === "current") {
        newApplication.screeningStatus = "fast_track";
      }
      
      // Return success response
      res.json({
        success: true,
        applicationId,
        message: "Application submitted successfully",
        nextSteps: "Our HR team will review your application within 3-5 business days"
      });
      
    } catch (error) {
      console.error("Error processing job application:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process application" 
      });
    }
  });

  /**
   * Widget Configuration Endpoint
   * Returns configuration for embedding widgets
   */
  app.get("/api/public/widget-config", (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    res.json({
      referralWidget: {
        embedCode: `
<!-- Primacy Care Referral Widget -->
<div id="primacy-referral-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widgets/referral.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`,
        iframeCode: `<iframe src="${baseUrl}/widget/referral" width="100%" height="1200" frameborder="0"></iframe>`,
        styles: {
          primaryColor: "#3B82F6",
          fontFamily: "Inter, sans-serif"
        }
      },
      careersWidget: {
        embedCode: `
<!-- Primacy Care Careers Widget -->
<div id="primacy-careers-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widgets/careers.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`,
        iframeCode: `<iframe src="${baseUrl}/widget/careers" width="100%" height="1500" frameborder="0"></iframe>`,
        styles: {
          primaryColor: "#8B5CF6",
          fontFamily: "Inter, sans-serif"
        }
      }
    });
  });

  /**
   * Widget Pages - Standalone pages for iframe embedding
   */
  app.get("/widget/referral", (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Primacy Care - Referral Form</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
    .widget-container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="/widget-bundle/referral.js"></script>
</body>
</html>
    `);
  });

  app.get("/widget/careers", (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Primacy Care - Careers</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
    .widget-container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="/widget-bundle/careers.js"></script>
</body>
</html>
    `);
  });
}

/**
 * Send email notification to intake team
 */
async function sendIntakeNotification(referral: any) {
  // In production, this would send an actual email
  console.log("Intake notification:", {
    to: "intake@primacycare.com.au",
    subject: `New Referral: ${referral.participantFirstName} ${referral.participantLastName}`,
    priority: referral.priority,
    referenceNumber: referral.referenceNumber
  });
}

/**
 * Send email notification to HR team
 */
async function sendHRNotification(application: any) {
  // In production, this would send an actual email
  console.log("HR notification:", {
    to: "hr@primacycare.com.au",
    subject: `New Application: ${application.firstName} ${application.lastName} - ${application.positionApplying}`,
    applicationId: application.applicationId,
    fastTrack: application.screeningStatus === "fast_track"
  });
}