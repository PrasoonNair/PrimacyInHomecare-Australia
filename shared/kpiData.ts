// KPI definitions extracted from Primacy Care Australia KPI Master
export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "good" | "warning" | "critical";
  description?: string;
  category: string;
}

// Comprehensive KPI definitions for all roles
export const roleKPIs: Record<string, KPIMetric[]> = {
  "Intake Coordinator": [
    {
      id: "intake_avg_time",
      title: "Average Time from Enquiry to Completed Intake",
      value: 36,
      target: 48,
      unit: "hours",
      trend: "down",
      trendValue: "-12%",
      status: "good",
      description: "Time from initial enquiry to completed intake process",
      category: "time"
    },
    {
      id: "intake_sla_compliance",
      title: "Intakes Completed Within SLA (48 hrs)",
      value: 87,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "warning",
      description: "Percentage of intakes completed within 48-hour SLA",
      category: "compliance"
    },
    {
      id: "documentation_upload",
      title: "Documentation Uploaded Before Service Start",
      value: 92,
      target: 95,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Participant documentation uploaded before service commencement",
      category: "compliance"
    },
    {
      id: "ndis_plan_processing",
      title: "NDIS Plans Processed Successfully",
      value: 98,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+3%",
      status: "good",
      description: "Successfully processed NDIS plan uploads with data extraction",
      category: "quality"
    },
    {
      id: "referral_conversion",
      title: "Referral to Service Conversion Rate",
      value: 78,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "warning",
      description: "Percentage of referrals converted to active services",
      category: "participants"
    }
  ],

  "Service Coordinator": [
    {
      id: "service_planning_time",
      title: "Average Service Planning Time",
      value: 4.2,
      target: 5.0,
      unit: "hours",
      trend: "down",
      trendValue: "-15%",
      status: "good",
      description: "Time to complete comprehensive service planning",
      category: "time"
    },
    {
      id: "participant_satisfaction",
      title: "Participant Satisfaction Score",
      value: 4.6,
      target: 4.5,
      unit: "/5",
      trend: "up",
      trendValue: "+0.2",
      status: "good",
      description: "Average participant satisfaction rating",
      category: "quality"
    },
    {
      id: "goal_achievement",
      title: "Goal Achievement Rate",
      value: 73,
      target: 80,
      unit: "%",
      trend: "up",
      trendValue: "+12%",
      status: "warning",
      description: "Percentage of participant goals achieved on time",
      category: "targets"
    },
    {
      id: "service_utilization",
      title: "Service Utilization Rate",
      value: 89,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+7%",
      status: "good",
      description: "Percentage of allocated service hours utilized",
      category: "participants"
    },
    {
      id: "plan_review_timeliness",
      title: "Plan Reviews Completed On Time",
      value: 82,
      target: 90,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Plan reviews completed within required timeframes",
      category: "compliance"
    }
  ],

  "Support Worker": [
    {
      id: "shift_attendance",
      title: "Shift Attendance Rate",
      value: 96,
      target: 98,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Percentage of scheduled shifts attended",
      category: "time"
    },
    {
      id: "case_note_completion",
      title: "Case Note Completion Rate",
      value: 94,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+6%",
      status: "warning",
      description: "Case notes completed within 24 hours of service",
      category: "compliance"
    },
    {
      id: "participant_feedback",
      title: "Participant Feedback Score",
      value: 4.7,
      target: 4.5,
      unit: "/5",
      trend: "up",
      trendValue: "+0.1",
      status: "good",
      description: "Average participant feedback rating for support worker",
      category: "quality"
    },
    {
      id: "clock_accuracy",
      title: "Clock In/Out Accuracy",
      value: 98,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Accurate clock in/out within allocated timeframes",
      category: "compliance"
    },
    {
      id: "training_compliance",
      title: "Training Compliance Rate",
      value: 88,
      target: 95,
      unit: "%",
      trend: "up",
      trendValue: "+10%",
      status: "warning",
      description: "Completion of mandatory training requirements",
      category: "compliance"
    }
  ],

  "Team Leader": [
    {
      id: "team_performance",
      title: "Team Performance Score",
      value: 4.3,
      target: 4.5,
      unit: "/5",
      trend: "up",
      trendValue: "+0.3",
      status: "warning",
      description: "Overall team performance rating",
      category: "quality"
    },
    {
      id: "staff_retention",
      title: "Staff Retention Rate",
      value: 89,
      target: 90,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "12-month staff retention rate",
      category: "participants"
    },
    {
      id: "incident_resolution",
      title: "Incident Resolution Time",
      value: 18,
      target: 24,
      unit: "hours",
      trend: "down",
      trendValue: "-25%",
      status: "good",
      description: "Average time to resolve reported incidents",
      category: "time"
    },
    {
      id: "quality_audits",
      title: "Quality Audit Pass Rate",
      value: 92,
      target: 95,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "warning",
      description: "Percentage of quality audits passed",
      category: "quality"
    },
    {
      id: "supervision_compliance",
      title: "Staff Supervision Compliance",
      value: 95,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Regular supervision meetings completed on schedule",
      category: "compliance"
    }
  ],

  "Finance Manager": [
    {
      id: "budget_variance",
      title: "Budget Variance",
      value: 2.3,
      target: 5.0,
      unit: "%",
      trend: "down",
      trendValue: "-1.2%",
      status: "good",
      description: "Variance from approved budget",
      category: "financial"
    },
    {
      id: "invoice_processing",
      title: "Invoice Processing Time",
      value: 3.2,
      target: 5.0,
      unit: "days",
      trend: "down",
      trendValue: "-30%",
      status: "good",
      description: "Average time to process invoices",
      category: "time"
    },
    {
      id: "payment_collection",
      title: "Payment Collection Rate",
      value: 96,
      target: 98,
      unit: "%",
      trend: "up",
      trendValue: "+4%",
      status: "warning",
      description: "Percentage of invoices paid within terms",
      category: "financial"
    },
    {
      id: "cost_per_service",
      title: "Cost Per Service Hour",
      value: 125,
      target: 130,
      unit: "$",
      trend: "down",
      trendValue: "-$8",
      status: "good",
      description: "Average cost per service hour delivered",
      category: "financial"
    },
    {
      id: "financial_reporting",
      title: "Financial Reporting Timeliness",
      value: 98,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Monthly reports completed on time",
      category: "compliance"
    }
  ],

  "HR Manager": [
    {
      id: "recruitment_time",
      title: "Average Recruitment Time",
      value: 21,
      target: 30,
      unit: "days",
      trend: "down",
      trendValue: "-9 days",
      status: "good",
      description: "Time from job posting to offer acceptance",
      category: "time"
    },
    {
      id: "onboarding_completion",
      title: "Onboarding Completion Rate",
      value: 94,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+6%",
      status: "warning",
      description: "New staff completing full onboarding process",
      category: "compliance"
    },
    {
      id: "staff_satisfaction",
      title: "Staff Satisfaction Score",
      value: 4.2,
      target: 4.5,
      unit: "/5",
      trend: "up",
      trendValue: "+0.3",
      status: "warning",
      description: "Annual staff satisfaction survey results",
      category: "quality"
    },
    {
      id: "compliance_training",
      title: "Compliance Training Completion",
      value: 91,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+15%",
      status: "warning",
      description: "Mandatory compliance training completion rate",
      category: "compliance"
    },
    {
      id: "performance_reviews",
      title: "Performance Reviews On Time",
      value: 87,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+12%",
      status: "warning",
      description: "Annual performance reviews completed on schedule",
      category: "compliance"
    }
  ],

  "CEO": [
    {
      id: "revenue_growth",
      title: "Revenue Growth",
      value: 18.5,
      target: 15.0,
      unit: "%",
      trend: "up",
      trendValue: "+3.5%",
      status: "good",
      description: "Year-over-year revenue growth",
      category: "financial"
    },
    {
      id: "participant_growth",
      title: "Participant Growth",
      value: 24,
      target: 20,
      unit: "%",
      trend: "up",
      trendValue: "+4%",
      status: "good",
      description: "Growth in active participant base",
      category: "participants"
    },
    {
      id: "market_share",
      title: "Market Share",
      value: 12.8,
      target: 15.0,
      unit: "%",
      trend: "up",
      trendValue: "+2.3%",
      status: "warning",
      description: "Market share in regional NDIS services",
      category: "targets"
    },
    {
      id: "operational_efficiency",
      title: "Operational Efficiency Ratio",
      value: 87,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "warning",
      description: "Service delivery efficiency metric",
      category: "quality"
    },
    {
      id: "regulatory_compliance",
      title: "Regulatory Compliance Score",
      value: 96,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Overall regulatory compliance rating",
      category: "compliance"
    }
  ],

  "Compliance Officer": [
    {
      id: "audit_compliance",
      title: "Audit Compliance Rate",
      value: 98,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Compliance with internal and external audits",
      category: "compliance"
    },
    {
      id: "incident_reporting",
      title: "Incident Reporting Timeliness",
      value: 94,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "warning",
      description: "Incidents reported within required timeframes",
      category: "compliance"
    },
    {
      id: "policy_updates",
      title: "Policy Update Completion",
      value: 91,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+15%",
      status: "warning",
      description: "Staff acknowledgment of policy updates",
      category: "compliance"
    },
    {
      id: "risk_assessments",
      title: "Risk Assessment Completion",
      value: 89,
      target: 95,
      unit: "%",
      trend: "up",
      trendValue: "+12%",
      status: "warning",
      description: "Scheduled risk assessments completed on time",
      category: "compliance"
    },
    {
      id: "ndis_compliance",
      title: "NDIS Compliance Score",
      value: 97,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Compliance with NDIS practice standards",
      category: "compliance"
    }
  ]
};

// Get KPIs for a specific role
export function getKPIsForRole(role: string): KPIMetric[] {
  return roleKPIs[role] || [];
}

// Get all available roles
export function getAllRoles(): string[] {
  return Object.keys(roleKPIs);
}

// Calculate overall KPI status for a role
export function getRoleKPIStatus(role: string): { good: number; warning: number; critical: number } {
  const metrics = getKPIsForRole(role);
  return metrics.reduce(
    (acc, metric) => {
      if (metric.status === "good") acc.good++;
      else if (metric.status === "warning") acc.warning++;
      else if (metric.status === "critical") acc.critical++;
      return acc;
    },
    { good: 0, warning: 0, critical: 0 }
  );
}