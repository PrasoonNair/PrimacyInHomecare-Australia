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
      id: "referral_to_profile_time",
      title: "Avg Time from Referral to Profile Creation",
      value: 18,
      target: 24,
      unit: "hours",
      trend: "down",
      trendValue: "-25%",
      status: "good",
      description: "Average time from referral receipt to profile creation",
      category: "time"
    },
    {
      id: "referrals_24hr",
      title: "Referrals Processed Within 24 Hours",
      value: 92,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "good",
      description: "Percentage of referrals processed within 24 hours",
      category: "compliance"
    },
    {
      id: "duplicate_entry_rate",
      title: "Duplicate Entry Rate",
      value: 2,
      target: 3,
      unit: "%",
      trend: "down",
      trendValue: "-1%",
      status: "good",
      description: "Percentage of duplicate participant entries detected",
      category: "quality"
    },
    {
      id: "agreement_turnaround",
      title: "Avg Turnaround to Signed Agreement",
      value: 5.2,
      target: 7,
      unit: "days",
      trend: "down",
      trendValue: "-15%",
      status: "good",
      description: "Average turnaround from profile creation to signed agreement",
      category: "time"
    },
    {
      id: "agreements_7days",
      title: "Agreements Signed Within 7 Days",
      value: 88,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "good",
      description: "Percentage of agreements signed within 7 days",
      category: "compliance"
    },
    {
      id: "agreement_error_rate",
      title: "Agreement Error Rate",
      value: 3,
      target: 5,
      unit: "%",
      trend: "down",
      trendValue: "-2%",
      status: "good",
      description: "Percentage of agreements with errors requiring correction",
      category: "quality"
    }
  ],

  "Finance Officer - Billing": [
    {
      id: "funding_verification_time",
      title: "Avg Time for Funding Verification",
      value: 2.5,
      target: 4,
      unit: "hours",
      trend: "down",
      trendValue: "-38%",
      status: "good",
      description: "Average time for funding verification",
      category: "time"
    },
    {
      id: "funding_delays",
      title: "Cases Delayed Due to Funding",
      value: 8,
      target: 10,
      unit: "%",
      trend: "down",
      trendValue: "-20%",
      status: "good",
      description: "Percentage of cases delayed due to funding issues",
      category: "financial"
    },
    {
      id: "budget_projection_accuracy",
      title: "Accuracy of Budget Projections",
      value: 94,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+4%",
      status: "good",
      description: "Accuracy of budget projections vs actual",
      category: "financial"
    },
    {
      id: "invoice_processing_time",
      title: "Invoice Processing Time",
      value: 1.8,
      target: 3,
      unit: "days",
      trend: "down",
      trendValue: "-40%",
      status: "good",
      description: "Average time to process invoices",
      category: "time"
    },
    {
      id: "payment_accuracy",
      title: "Payment Accuracy Rate",
      value: 99.2,
      target: 99,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Accuracy of payments processed",
      category: "quality"
    }
  ],

  "Service Delivery Allocation Officer": [
    {
      id: "allocation_time",
      title: "Avg Allocation Time from Ready Status",
      value: 3.2,
      target: 4,
      unit: "hours",
      trend: "down",
      trendValue: "-20%",
      status: "good",
      description: "Average allocation time from ready status",
      category: "time"
    },
    {
      id: "first_attempt_acceptance",
      title: "Allocations Accepted on First Attempt",
      value: 82,
      target: 80,
      unit: "%",
      trend: "up",
      trendValue: "+7%",
      status: "good",
      description: "Percentage of allocations accepted on first attempt",
      category: "quality"
    },
    {
      id: "allocation_accuracy",
      title: "Allocation Accuracy (Match Success)",
      value: 91,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+6%",
      status: "good",
      description: "Match success rate after Meet & Greet",
      category: "quality"
    },
    {
      id: "staff_utilization",
      title: "Staff Utilization Rate",
      value: 87,
      target: 85,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Percentage of available staff hours utilized",
      category: "participants"
    },
    {
      id: "geographic_coverage",
      title: "Geographic Coverage Efficiency",
      value: 93,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+3%",
      status: "good",
      description: "Efficiency of geographic allocation",
      category: "quality"
    }
  ],

  "Service Delivery Coordinator": [
    {
      id: "meet_greet_success",
      title: "Meet & Greets Leading to Service",
      value: 88,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "good",
      description: "Percentage of Meet & Greets leading to ongoing service",
      category: "quality"
    },
    {
      id: "meet_greet_time",
      title: "Avg Time from Allocation to Meet & Greet",
      value: 3.5,
      target: 5,
      unit: "days",
      trend: "down",
      trendValue: "-30%",
      status: "good",
      description: "Average time from allocation to Meet & Greet",
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
      id: "shift_completion_rate",
      title: "Shift Completion Rate",
      value: 94,
      target: 95,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Percentage of scheduled shifts completed",
      category: "compliance"
    },
    {
      id: "last_minute_cancellations",
      title: "Last-Minute Cancellations",
      value: 6,
      target: 5,
      unit: "%",
      trend: "down",
      trendValue: "-2%",
      status: "warning",
      description: "Percentage of last-minute shift cancellations",
      category: "quality"
    },
    {
      id: "open_shift_fill_time",
      title: "Avg Time to Fill Open Shifts",
      value: 2.8,
      target: 3,
      unit: "hours",
      trend: "down",
      trendValue: "-15%",
      status: "good",
      description: "Average time to fill open shifts",
      category: "time"
    }
  ],

  "Support Worker": [
    {
      id: "hours_of_support",
      title: "Hours of Support Provided",
      value: 156,
      target: 160,
      unit: "hrs",
      trend: "up",
      trendValue: "+12 hrs",
      status: "warning",
      description: "Total support hours delivered this month",
      category: "productivity"
    },
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
      id: "recruitment_to_onboarding",
      title: "Time from Request to Onboarding",
      value: 21,
      target: 30,
      unit: "days",
      trend: "down",
      trendValue: "-30%",
      status: "good",
      description: "Time from recruitment request to onboarding",
      category: "time"
    },
    {
      id: "compliance_documentation",
      title: "Workers with Full Compliance Docs",
      value: 96,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+4%",
      status: "warning",
      description: "Percentage of workers with full compliance documentation",
      category: "compliance"
    },
    {
      id: "compliance_lapse_prevention",
      title: "Compliance Lapses Avoided",
      value: 98,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Percentage of compliance lapses avoided through proactive management",
      category: "compliance"
    },
    {
      id: "staff_retention",
      title: "Annual Staff Retention Rate",
      value: 87,
      target: 85,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "good",
      description: "Annual staff retention percentage",
      category: "participants"
    },
    {
      id: "onboarding_satisfaction",
      title: "Onboarding Satisfaction Score",
      value: 4.4,
      target: 4.0,
      unit: "/5",
      trend: "up",
      trendValue: "+0.2",
      status: "good",
      description: "New employee onboarding satisfaction",
      category: "quality"
    }
  ],

  "Quality Manager": [
    {
      id: "compliance_percentage",
      title: "Workers & Participants Fully Compliant",
      value: 93,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "warning",
      description: "Percentage of workers and participants fully compliant",
      category: "compliance"
    },
    {
      id: "compliance_resolution_time",
      title: "Avg Time to Resolve Compliance Issues",
      value: 18,
      target: 24,
      unit: "hours",
      trend: "down",
      trendValue: "-25%",
      status: "good",
      description: "Average time to resolve compliance issues",
      category: "time"
    },
    {
      id: "audit_pass_rate",
      title: "Audit Pass Rate",
      value: 96,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "warning",
      description: "Percentage of audits passed successfully",
      category: "compliance"
    },
    {
      id: "quality_incidents",
      title: "Quality Incidents per Month",
      value: 3,
      target: 5,
      unit: "count",
      trend: "down",
      trendValue: "-40%",
      status: "good",
      description: "Number of quality incidents reported per month",
      category: "quality"
    },
    {
      id: "practice_standards_compliance",
      title: "NDIS Practice Standards Compliance",
      value: 98,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Compliance with NDIS practice standards",
      category: "compliance"
    }
  ],

  "CEO": [
    {
      id: "weekly_kpi_review",
      title: "Weekly KPI Review Completion",
      value: 100,
      target: 100,
      unit: "%",
      trend: "stable",
      status: "good",
      description: "Completion rate of weekly KPI reviews",
      category: "operational"
    },
    {
      id: "overdue_corrective_actions",
      title: "Overdue Corrective Actions",
      value: 2,
      target: 0,
      unit: "count",
      trend: "down",
      trendValue: "-3",
      status: "warning",
      description: "Number of overdue corrective actions",
      category: "compliance"
    },
    {
      id: "departmental_performance",
      title: "Departmental Performance vs Targets",
      value: 89,
      target: 90,
      unit: "%",
      trend: "up",
      trendValue: "+7%",
      status: "warning",
      description: "Average departmental performance against targets",
      category: "operational"
    },
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

  "General Manager": [
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
      id: "departmental_kpi_achievement",
      title: "Departmental KPI Achievement",
      value: 91,
      target: 95,
      unit: "%",
      trend: "up",
      trendValue: "+8%",
      status: "warning",
      description: "Average KPI achievement across all departments",
      category: "operational"
    },
    {
      id: "staff_productivity",
      title: "Staff Productivity Index",
      value: 4.2,
      target: 4.5,
      unit: "/5",
      trend: "up",
      trendValue: "+0.3",
      status: "warning",
      description: "Overall staff productivity rating",
      category: "quality"
    },
    {
      id: "service_quality_score",
      title: "Service Quality Score",
      value: 93,
      target: 95,
      unit: "%",
      trend: "stable",
      status: "warning",
      description: "Overall service quality rating",
      category: "quality"
    },
    {
      id: "compliance_dashboard_status",
      title: "Compliance Dashboard Status",
      value: 95,
      target: 100,
      unit: "%",
      trend: "up",
      trendValue: "+5%",
      status: "warning",
      description: "Percentage of compliance metrics in green status",
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