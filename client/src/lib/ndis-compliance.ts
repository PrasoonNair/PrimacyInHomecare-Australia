// NDIS Compliance Rules and Workflow Validation
export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  category: 'documentation' | 'service_delivery' | 'worker_screening' | 'participant_rights' | 'quality_safety';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'compliant' | 'non_compliant' | 'pending' | 'review';
}

// NDIS Practice Standards
export const NDIS_PRACTICE_STANDARDS = {
  RIGHTS_RESPONSIBILITIES: {
    name: 'Rights and Responsibilities',
    requirements: [
      'Person-centred supports',
      'Individual values and beliefs',
      'Privacy and dignity',
      'Independence and informed choice',
      'Violence, abuse, neglect, exploitation and discrimination'
    ]
  },
  GOVERNANCE_OPERATIONS: {
    name: 'Governance and Operational Management',
    requirements: [
      'Governing body',
      'Practice governance',
      'Risk management',
      'Quality management',
      'Information management',
      'Feedback and complaints management',
      'Incident management',
      'Human resource management',
      'Continuity of supports',
      'Participant money and property'
    ]
  },
  SERVICE_PROVISION: {
    name: 'Provision of Supports',
    requirements: [
      'Access to supports',
      'Support planning',
      'Service agreements',
      'Responsive support provision',
      'Transition to or from the provider'
    ]
  },
  SERVICE_ENVIRONMENT: {
    name: 'Support Provision Environment',
    requirements: [
      'Safe environment',
      'Participant money and property',
      'Management of medication',
      'Management of waste',
      'Infection prevention and control'
    ]
  }
};

// Role-specific compliance workflows
export const ROLE_COMPLIANCE_WORKFLOWS = {
  intake_coordinator: {
    checks: [
      {
        id: 'ic-001',
        name: 'Participant Consent Documentation',
        description: 'Ensure all consent forms are completed and stored',
        frequency: 'per_participant',
        mandatoryFields: ['consent_form', 'privacy_agreement', 'service_agreement']
      },
      {
        id: 'ic-002',
        name: 'Eligibility Verification',
        description: 'Verify NDIS eligibility and plan details',
        frequency: 'per_participant',
        mandatoryFields: ['ndis_number', 'plan_dates', 'funding_categories']
      },
      {
        id: 'ic-003',
        name: 'Initial Assessment Completion',
        description: 'Complete comprehensive needs assessment',
        frequency: 'per_participant',
        timeLimit: '48_hours'
      }
    ],
    efficiencyMetrics: {
      averageIntakeTime: { target: 2, unit: 'days' },
      conversionRate: { target: 85, unit: 'percent' },
      documentationCompleteness: { target: 100, unit: 'percent' }
    }
  },
  support_worker: {
    checks: [
      {
        id: 'sw-001',
        name: 'Worker Screening Check',
        description: 'Valid NDIS Worker Screening clearance',
        frequency: 'annual',
        mandatoryFields: ['screening_number', 'expiry_date']
      },
      {
        id: 'sw-002',
        name: 'Progress Note Completion',
        description: 'Complete progress notes after each service',
        frequency: 'per_service',
        timeLimit: '24_hours'
      },
      {
        id: 'sw-003',
        name: 'Incident Reporting',
        description: 'Report incidents within required timeframe',
        frequency: 'as_required',
        timeLimit: '24_hours'
      },
      {
        id: 'sw-004',
        name: 'Mandatory Training',
        description: 'Complete all required NDIS training modules',
        frequency: 'annual',
        modules: ['code_of_conduct', 'manual_handling', 'infection_control', 'medication_management']
      }
    ],
    efficiencyMetrics: {
      punctualityRate: { target: 95, unit: 'percent' },
      documentationTimeliness: { target: 90, unit: 'percent' },
      serviceCompletionRate: { target: 98, unit: 'percent' }
    }
  },
  finance_manager: {
    checks: [
      {
        id: 'fm-001',
        name: 'NDIS Pricing Compliance',
        description: 'Ensure all billing follows NDIS Price Guide',
        frequency: 'per_invoice',
        validationRules: ['price_limits', 'support_ratios', 'travel_rules']
      },
      {
        id: 'fm-002',
        name: 'Service Agreement Verification',
        description: 'Verify service agreements before billing',
        frequency: 'per_invoice',
        mandatoryFields: ['service_agreement', 'consent', 'plan_budget']
      },
      {
        id: 'fm-003',
        name: 'Financial Audit Trail',
        description: 'Maintain complete audit trail for all transactions',
        frequency: 'continuous',
        retention: '7_years'
      }
    ],
    efficiencyMetrics: {
      invoiceAccuracy: { target: 99.5, unit: 'percent' },
      paymentProcessingTime: { target: 14, unit: 'days' },
      claimRejectionRate: { target: 2, unit: 'percent', threshold: 'below' }
    }
  },
  service_delivery_manager: {
    checks: [
      {
        id: 'sdm-001',
        name: 'Service Quality Standards',
        description: 'Monitor service delivery against NDIS standards',
        frequency: 'weekly',
        kpis: ['on_time_rate', 'completion_rate', 'satisfaction_score']
      },
      {
        id: 'sdm-002',
        name: 'Staff Competency Verification',
        description: 'Ensure staff have required qualifications',
        frequency: 'quarterly',
        validations: ['qualifications', 'training_records', 'supervision_notes']
      },
      {
        id: 'sdm-003',
        name: 'Incident Management Review',
        description: 'Review and close incident reports',
        frequency: 'weekly',
        timeLimit: '5_business_days'
      }
    ],
    efficiencyMetrics: {
      serviceUtilization: { target: 85, unit: 'percent' },
      staffProductivity: { target: 80, unit: 'percent' },
      qualityScore: { target: 4.5, unit: 'rating', max: 5 }
    }
  },
  quality_manager: {
    checks: [
      {
        id: 'qm-001',
        name: 'NDIS Practice Standards Audit',
        description: 'Regular audit against NDIS Practice Standards',
        frequency: 'quarterly',
        scope: 'all_standards'
      },
      {
        id: 'qm-002',
        name: 'Complaints Resolution',
        description: 'Ensure complaints are resolved within timeframes',
        frequency: 'continuous',
        timeLimit: '28_days'
      },
      {
        id: 'qm-003',
        name: 'Continuous Improvement',
        description: 'Implement quality improvement initiatives',
        frequency: 'monthly',
        requirements: ['action_plans', 'outcome_measures', 'stakeholder_feedback']
      },
      {
        id: 'qm-004',
        name: 'Reportable Incidents',
        description: 'Report serious incidents to NDIS Commission',
        frequency: 'as_required',
        timeLimit: '24_hours',
        categories: ['death', 'serious_injury', 'abuse_neglect', 'unauthorized_restraint']
      }
    ],
    efficiencyMetrics: {
      complianceScore: { target: 95, unit: 'percent' },
      auditCompletionRate: { target: 100, unit: 'percent' },
      incidentResolutionTime: { target: 5, unit: 'days' }
    }
  },
  hr_manager: {
    checks: [
      {
        id: 'hr-001',
        name: 'Worker Screening Compliance',
        description: 'All staff have valid NDIS Worker Screening',
        frequency: 'continuous',
        coverage: '100_percent'
      },
      {
        id: 'hr-002',
        name: 'Code of Conduct Training',
        description: 'All staff complete NDIS Code of Conduct training',
        frequency: 'annual',
        mandatoryFor: 'all_staff'
      },
      {
        id: 'hr-003',
        name: 'Professional Development',
        description: 'Staff meet professional development requirements',
        frequency: 'annual',
        minHours: 20
      }
    ],
    efficiencyMetrics: {
      screeningCompliance: { target: 100, unit: 'percent' },
      trainingCompletion: { target: 95, unit: 'percent' },
      staffRetention: { target: 85, unit: 'percent' }
    }
  }
};

// Compliance validation functions
export function validateParticipantDocumentation(participant: any): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  
  // Check consent forms
  checks.push({
    id: 'doc-consent',
    name: 'Consent Forms',
    description: 'Participant consent documentation',
    category: 'documentation',
    severity: 'critical',
    status: participant.consentForm ? 'compliant' : 'non_compliant'
  });

  // Check service agreement
  checks.push({
    id: 'doc-agreement',
    name: 'Service Agreement',
    description: 'Valid service agreement in place',
    category: 'documentation',
    severity: 'critical',
    status: participant.serviceAgreement ? 'compliant' : 'non_compliant'
  });

  // Check NDIS plan
  checks.push({
    id: 'doc-plan',
    name: 'NDIS Plan',
    description: 'Current NDIS plan on file',
    category: 'documentation',
    severity: 'high',
    status: participant.ndisPlan ? 'compliant' : 'non_compliant'
  });

  return checks;
}

export function validateWorkerCompliance(worker: any): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  
  // Worker screening
  checks.push({
    id: 'worker-screening',
    name: 'NDIS Worker Screening',
    description: 'Valid worker screening clearance',
    category: 'worker_screening',
    severity: 'critical',
    status: worker.screeningValid ? 'compliant' : 'non_compliant'
  });

  // Training compliance
  checks.push({
    id: 'worker-training',
    name: 'Mandatory Training',
    description: 'All required training completed',
    category: 'worker_screening',
    severity: 'high',
    status: worker.trainingComplete ? 'compliant' : 'non_compliant'
  });

  return checks;
}

export function validateServiceDelivery(service: any): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  
  // Service documentation
  checks.push({
    id: 'service-notes',
    name: 'Progress Notes',
    description: 'Progress notes completed',
    category: 'service_delivery',
    severity: 'medium',
    status: service.progressNote ? 'compliant' : 'non_compliant'
  });

  // Service delivery standards
  checks.push({
    id: 'service-standards',
    name: 'Service Standards',
    description: 'Service delivered to NDIS standards',
    category: 'service_delivery',
    severity: 'high',
    status: service.meetsStandards ? 'compliant' : 'review'
  });

  return checks;
}

// Calculate compliance score
export function calculateComplianceScore(checks: ComplianceCheck[]): number {
  if (checks.length === 0) return 100;
  
  const weights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  
  let totalWeight = 0;
  let compliantWeight = 0;
  
  checks.forEach(check => {
    const weight = weights[check.severity];
    totalWeight += weight;
    if (check.status === 'compliant') {
      compliantWeight += weight;
    }
  });
  
  return Math.round((compliantWeight / totalWeight) * 100);
}

// Get role-specific efficiency metrics
export function getRoleEfficiencyMetrics(role: string): any {
  const workflows = ROLE_COMPLIANCE_WORKFLOWS as any;
  return workflows[role]?.efficiencyMetrics || {};
}

// Get role-specific compliance checks
export function getRoleComplianceChecks(role: string): any[] {
  const workflows = ROLE_COMPLIANCE_WORKFLOWS as any;
  return workflows[role]?.checks || [];
}