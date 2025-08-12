// Role definitions and permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CEO: 'ceo',
  GENERAL_MANAGER: 'general_manager',
  INTAKE_COORDINATOR: 'intake_coordinator',
  INTAKE_MANAGER: 'intake_manager',
  FINANCE_OFFICER_BILLING: 'finance_officer_billing',
  FINANCE_OFFICER_PAYROLL: 'finance_officer_payroll',
  FINANCE_MANAGER: 'finance_manager',
  HR_MANAGER: 'hr_manager',
  HR_RECRUITER: 'hr_recruiter',
  SERVICE_DELIVERY_MANAGER: 'service_delivery_manager',
  SERVICE_DELIVERY_ALLOCATION: 'service_delivery_allocation',
  SERVICE_DELIVERY_COORDINATOR: 'service_delivery_coordinator',
  QUALITY_MANAGER: 'quality_manager',
  SUPPORT_WORKER: 'support_worker'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Department mappings
export const DEPARTMENTS = {
  INTAKE: 'intake',
  HR_RECRUITMENT: 'hr_recruitment',
  FINANCE: 'finance',
  SERVICE_DELIVERY: 'service_delivery',
  COMPLIANCE_QUALITY: 'compliance_quality'
} as const;

export type Department = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

// Role to department mapping
export const ROLE_DEPARTMENTS: Record<UserRole, Department> = {
  [ROLES.SUPER_ADMIN]: DEPARTMENTS.COMPLIANCE_QUALITY,
  [ROLES.CEO]: DEPARTMENTS.COMPLIANCE_QUALITY,
  [ROLES.GENERAL_MANAGER]: DEPARTMENTS.COMPLIANCE_QUALITY,
  [ROLES.INTAKE_COORDINATOR]: DEPARTMENTS.INTAKE,
  [ROLES.INTAKE_MANAGER]: DEPARTMENTS.INTAKE,
  [ROLES.FINANCE_OFFICER_BILLING]: DEPARTMENTS.FINANCE,
  [ROLES.FINANCE_OFFICER_PAYROLL]: DEPARTMENTS.FINANCE,
  [ROLES.FINANCE_MANAGER]: DEPARTMENTS.FINANCE,
  [ROLES.HR_MANAGER]: DEPARTMENTS.HR_RECRUITMENT,
  [ROLES.HR_RECRUITER]: DEPARTMENTS.HR_RECRUITMENT,
  [ROLES.SERVICE_DELIVERY_MANAGER]: DEPARTMENTS.SERVICE_DELIVERY,
  [ROLES.SERVICE_DELIVERY_ALLOCATION]: DEPARTMENTS.SERVICE_DELIVERY,
  [ROLES.SERVICE_DELIVERY_COORDINATOR]: DEPARTMENTS.SERVICE_DELIVERY,
  [ROLES.QUALITY_MANAGER]: DEPARTMENTS.COMPLIANCE_QUALITY,
  [ROLES.SUPPORT_WORKER]: DEPARTMENTS.SERVICE_DELIVERY
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CEO]: 'CEO',
  [ROLES.GENERAL_MANAGER]: 'General Manager',
  [ROLES.INTAKE_COORDINATOR]: 'Intake Coordinator',
  [ROLES.INTAKE_MANAGER]: 'Intake Manager',
  [ROLES.FINANCE_OFFICER_BILLING]: 'Finance Officer - Billing',
  [ROLES.FINANCE_OFFICER_PAYROLL]: 'Finance Officer - Payroll',
  [ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [ROLES.HR_MANAGER]: 'HR Manager',
  [ROLES.HR_RECRUITER]: 'HR Recruiter',
  [ROLES.SERVICE_DELIVERY_MANAGER]: 'Service Delivery Manager',
  [ROLES.SERVICE_DELIVERY_ALLOCATION]: 'Service Delivery - Allocation',
  [ROLES.SERVICE_DELIVERY_COORDINATOR]: 'Service Delivery Coordinator',
  [ROLES.QUALITY_MANAGER]: 'Quality Manager',
  [ROLES.SUPPORT_WORKER]: 'Support Worker'
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // All permissions
  [ROLES.CEO]: ['view_all', 'strategic_planning', 'financial_overview', 'department_management'],
  [ROLES.GENERAL_MANAGER]: ['view_all', 'operations_management', 'staff_management', 'reporting'],
  [ROLES.INTAKE_COORDINATOR]: ['intake_management', 'referral_processing', 'participant_registration'],
  [ROLES.INTAKE_MANAGER]: ['intake_management', 'intake_reporting', 'intake_team_management'],
  [ROLES.FINANCE_OFFICER_BILLING]: ['billing_management', 'invoice_processing', 'ndis_claims'],
  [ROLES.FINANCE_OFFICER_PAYROLL]: ['payroll_processing', 'timesheets', 'award_calculations'],
  [ROLES.FINANCE_MANAGER]: ['financial_management', 'budget_control', 'financial_reporting', 'team_management'],
  [ROLES.HR_MANAGER]: ['hr_management', 'recruitment', 'training', 'compliance', 'team_management'],
  [ROLES.HR_RECRUITER]: ['recruitment', 'onboarding', 'candidate_management'],
  [ROLES.SERVICE_DELIVERY_MANAGER]: ['service_management', 'quality_assurance', 'team_management', 'reporting'],
  [ROLES.SERVICE_DELIVERY_ALLOCATION]: ['shift_allocation', 'roster_management', 'staff_matching'],
  [ROLES.SERVICE_DELIVERY_COORDINATOR]: ['shift_coordination', 'daily_operations', 'incident_management'],
  [ROLES.QUALITY_MANAGER]: ['quality_management', 'audit_management', 'compliance', 'reporting'],
  [ROLES.SUPPORT_WORKER]: ['service_delivery', 'progress_notes', 'shift_management', 'participant_support']
};

// Check if user has permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

// Get role dashboard path
export function getRoleDashboardPath(role: UserRole): string {
  const dashboardPaths: Record<UserRole, string> = {
    [ROLES.SUPER_ADMIN]: '/role-dashboards/super-admin',
    [ROLES.CEO]: '/role-dashboards/ceo',
    [ROLES.GENERAL_MANAGER]: '/role-dashboards/general-manager',
    [ROLES.INTAKE_COORDINATOR]: '/role-dashboards/intake-coordinator',
    [ROLES.INTAKE_MANAGER]: '/role-dashboards/intake-manager',
    [ROLES.FINANCE_OFFICER_BILLING]: '/role-dashboards/finance-officer-billing',
    [ROLES.FINANCE_OFFICER_PAYROLL]: '/role-dashboards/finance-officer-payroll',
    [ROLES.FINANCE_MANAGER]: '/role-dashboards/finance-manager',
    [ROLES.HR_MANAGER]: '/role-dashboards/hr-manager',
    [ROLES.HR_RECRUITER]: '/role-dashboards/hr-recruiter',
    [ROLES.SERVICE_DELIVERY_MANAGER]: '/role-dashboards/service-delivery-manager',
    [ROLES.SERVICE_DELIVERY_ALLOCATION]: '/role-dashboards/service-delivery-allocation',
    [ROLES.SERVICE_DELIVERY_COORDINATOR]: '/role-dashboards/service-delivery-coordinator',
    [ROLES.QUALITY_MANAGER]: '/role-dashboards/quality-manager',
    [ROLES.SUPPORT_WORKER]: '/role-dashboards/support-worker'
  };
  
  return dashboardPaths[role] || '/dashboard';
}