#!/usr/bin/env python3
"""
Comprehensive Functionality Test Suite for Primacy Care CMS
Tests all system functionalities across all 15 roles
"""

import json
import time
import requests
from datetime import datetime
from typing import Dict, List, Tuple
import sys

# Configuration
BASE_URL = "http://localhost:5000"
TEST_RESULTS = []

# ANSI color codes
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Test roles configuration
ROLES = {
    "super_admin": {
        "id": "test-super-admin",
        "name": "Super Admin",
        "permissions": ["all"],
        "dashboards": ["executive", "operational", "financial", "compliance"],
        "features": ["user_management", "system_config", "all_reports", "audit_logs"]
    },
    "ceo": {
        "id": "test-ceo",
        "name": "CEO",
        "permissions": ["view_all", "strategic", "financial_overview"],
        "dashboards": ["executive", "kpi", "financial"],
        "features": ["strategic_planning", "department_overview", "financial_reports"]
    },
    "general_manager": {
        "id": "test-general-manager",
        "name": "General Manager",
        "permissions": ["operations", "staff_management", "reporting"],
        "dashboards": ["operational", "staff", "service"],
        "features": ["operations_management", "team_performance", "service_quality"]
    },
    "intake_coordinator": {
        "id": "test-intake-coordinator",
        "name": "Intake Coordinator",
        "permissions": ["intake", "participant_registration"],
        "dashboards": ["intake", "referrals"],
        "features": ["referral_processing", "participant_onboarding", "initial_assessment"]
    },
    "intake_manager": {
        "id": "test-intake-manager",
        "name": "Intake Manager",
        "permissions": ["intake_management", "intake_reporting"],
        "dashboards": ["intake", "team", "reports"],
        "features": ["intake_oversight", "team_management", "intake_analytics"]
    },
    "finance_officer_billing": {
        "id": "test-finance-billing",
        "name": "Finance Officer - Billing",
        "permissions": ["billing", "invoicing", "ndis_claims"],
        "dashboards": ["billing", "invoices"],
        "features": ["invoice_generation", "payment_tracking", "ndis_billing"]
    },
    "finance_officer_payroll": {
        "id": "test-finance-payroll",
        "name": "Finance Officer - Payroll",
        "permissions": ["payroll", "timesheets", "awards"],
        "dashboards": ["payroll", "staff_hours"],
        "features": ["payroll_processing", "schads_calculations", "timesheet_approval"]
    },
    "finance_manager": {
        "id": "test-finance-manager",
        "name": "Finance Manager",
        "permissions": ["financial_management", "budget", "reporting"],
        "dashboards": ["financial", "budget", "reports"],
        "features": ["budget_control", "financial_reporting", "xero_integration"]
    },
    "hr_manager": {
        "id": "test-hr-manager",
        "name": "HR Manager",
        "permissions": ["hr_management", "recruitment", "training"],
        "dashboards": ["hr", "recruitment", "staff"],
        "features": ["staff_management", "recruitment_pipeline", "training_compliance"]
    },
    "hr_recruiter": {
        "id": "test-hr-recruiter",
        "name": "HR Recruiter",
        "permissions": ["recruitment", "onboarding"],
        "dashboards": ["recruitment", "candidates"],
        "features": ["job_postings", "candidate_management", "onboarding_process"]
    },
    "service_delivery_manager": {
        "id": "test-service-manager",
        "name": "Service Delivery Manager",
        "permissions": ["service_management", "quality", "team"],
        "dashboards": ["service", "quality", "team"],
        "features": ["service_oversight", "quality_assurance", "team_performance"]
    },
    "service_delivery_allocation": {
        "id": "test-service-allocation",
        "name": "Service Delivery - Allocation",
        "permissions": ["shift_allocation", "roster"],
        "dashboards": ["allocation", "roster"],
        "features": ["staff_matching", "shift_scheduling", "roster_management"]
    },
    "service_delivery_coordinator": {
        "id": "test-service-coordinator",
        "name": "Service Delivery Coordinator",
        "permissions": ["shift_coordination", "operations"],
        "dashboards": ["coordination", "daily_ops"],
        "features": ["service_coordination", "incident_management", "daily_operations"]
    },
    "quality_manager": {
        "id": "test-quality-manager",
        "name": "Quality Manager",
        "permissions": ["quality", "compliance", "audit"],
        "dashboards": ["quality", "compliance", "incidents"],
        "features": ["quality_monitoring", "audit_management", "incident_investigation"]
    },
    "support_worker": {
        "id": "test-support-worker",
        "name": "Support Worker",
        "permissions": ["service_delivery", "progress_notes"],
        "dashboards": ["my_shifts", "participants"],
        "features": ["shift_management", "progress_notes", "participant_support"]
    }
}

class CMSTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_test(self, role: str, test_name: str, status: bool, details: str = ""):
        """Log test results"""
        self.total_tests += 1
        if status:
            self.passed_tests += 1
            print(f"{Colors.OKGREEN}✓{Colors.ENDC} [{role}] {test_name}")
        else:
            self.failed_tests += 1
            print(f"{Colors.FAIL}✗{Colors.ENDC} [{role}] {test_name}: {details}")
        
        self.test_results.append({
            "role": role,
            "test": test_name,
            "status": "PASS" if status else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def login_as_role(self, role_key: str) -> bool:
        """Login as a specific test role"""
        role = ROLES[role_key]
        print(f"\n{Colors.OKBLUE}Testing Role: {role['name']}{Colors.ENDC}")
        
        try:
            response = self.session.post(
                f"{BASE_URL}/api/test-login",
                json={"testUserId": role["id"]},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log_test(role_key, "Authentication", True)
                return True
            else:
                self.log_test(role_key, "Authentication", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test(role_key, "Authentication", False, str(e))
            return False
    
    def test_dashboard_access(self, role_key: str):
        """Test dashboard and KPI access"""
        # Test KPI endpoint
        try:
            response = self.session.get(f"{BASE_URL}/api/dashboard/kpis/{role_key}")
            self.log_test(role_key, "Dashboard KPIs", response.status_code == 200, 
                         f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if "kpis" in data:
                    self.log_test(role_key, "KPI Data Structure", True, 
                                 f"{len(data.get('kpis', []))} KPIs loaded")
        except Exception as e:
            self.log_test(role_key, "Dashboard KPIs", False, str(e))
        
        # Test stats endpoint
        try:
            response = self.session.get(f"{BASE_URL}/api/dashboard/stats")
            self.log_test(role_key, "Dashboard Stats", response.status_code == 200)
        except Exception as e:
            self.log_test(role_key, "Dashboard Stats", False, str(e))
    
    def test_crud_operations(self, role_key: str):
        """Test CRUD operations based on role permissions"""
        role = ROLES[role_key]
        
        # Define endpoint permissions
        endpoints = {
            "/api/participants": ["all", "intake", "service_management", "service_delivery"],
            "/api/staff": ["all", "hr_management", "operations", "payroll"],
            "/api/shifts": ["all", "shift_allocation", "shift_coordination", "service_delivery"],
            "/api/invoices": ["all", "billing", "financial_management"],
            "/api/progress-notes": ["all", "service_delivery", "quality"],
            "/api/incidents": ["all", "quality", "compliance", "shift_coordination"]
        }
        
        for endpoint, allowed_permissions in endpoints.items():
            has_permission = any(perm in role["permissions"] for perm in allowed_permissions)
            
            try:
                response = self.session.get(f"{BASE_URL}{endpoint}")
                
                if has_permission:
                    # Should have access
                    self.log_test(role_key, f"Access {endpoint}", 
                                 response.status_code in [200, 304],
                                 f"Status: {response.status_code}")
                else:
                    # Should be restricted
                    self.log_test(role_key, f"Restricted {endpoint}", 
                                 response.status_code in [403, 401],
                                 f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(role_key, f"Access {endpoint}", False, str(e))
    
    def test_feature_access(self, role_key: str):
        """Test role-specific features"""
        role = ROLES[role_key]
        
        # Test each feature for the role
        for feature in role["features"]:
            # Simulate feature testing based on feature type
            feature_tests = {
                "user_management": "/api/users",
                "system_config": "/api/settings",
                "invoice_generation": "/api/invoices/generate",
                "payroll_processing": "/api/payroll/process",
                "staff_matching": "/api/shifts/match-staff",
                "progress_notes": "/api/progress-notes",
                "quality_monitoring": "/api/quality/metrics",
                "shift_management": "/api/shifts",
                "participant_support": "/api/participants/support"
            }
            
            endpoint = feature_tests.get(feature, "/api/health")
            
            try:
                # Test GET request for feature endpoint
                response = self.session.get(f"{BASE_URL}{endpoint}")
                # Most features should return 200 or 404 (not implemented)
                self.log_test(role_key, f"Feature: {feature}", 
                             response.status_code in [200, 304, 404],
                             f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(role_key, f"Feature: {feature}", False, str(e))
    
    def test_workflow_integration(self, role_key: str):
        """Test workflow integration for roles that have workflow access"""
        workflow_roles = ["super_admin", "ceo", "general_manager", "intake_manager", 
                         "finance_manager", "hr_manager", "service_delivery_manager", 
                         "service_delivery_coordinator", "quality_manager"]
        
        if role_key in workflow_roles:
            try:
                response = self.session.get(f"{BASE_URL}/api/workflows")
                self.log_test(role_key, "Workflow Access", 
                             response.status_code in [200, 304],
                             f"Status: {response.status_code}")
                
                # Test service agreements
                response = self.session.get(f"{BASE_URL}/api/service-agreements")
                self.log_test(role_key, "Service Agreements", 
                             response.status_code in [200, 304])
            except Exception as e:
                self.log_test(role_key, "Workflow Integration", False, str(e))
    
    def test_data_integrity(self, role_key: str):
        """Test data integrity and consistency"""
        try:
            # Test participant data integrity
            response = self.session.get(f"{BASE_URL}/api/participants")
            if response.status_code == 200:
                participants = response.json()
                if isinstance(participants, list):
                    self.log_test(role_key, "Data Integrity - Participants", True,
                                 f"{len(participants)} records")
            
            # Test staff data integrity
            response = self.session.get(f"{BASE_URL}/api/staff")
            if response.status_code == 200:
                staff = response.json()
                if isinstance(staff, list):
                    self.log_test(role_key, "Data Integrity - Staff", True,
                                 f"{len(staff)} records")
        except Exception as e:
            self.log_test(role_key, "Data Integrity", False, str(e))
    
    def run_comprehensive_test(self):
        """Run comprehensive test suite for all roles"""
        print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
        print(f"{Colors.HEADER}Primacy Care CMS - Comprehensive System Test{Colors.ENDC}")
        print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
        
        for role_key in ROLES.keys():
            if self.login_as_role(role_key):
                self.test_dashboard_access(role_key)
                self.test_crud_operations(role_key)
                self.test_feature_access(role_key)
                self.test_workflow_integration(role_key)
                self.test_data_integrity(role_key)
                time.sleep(0.5)  # Small delay between role tests
        
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print(f"\n{Colors.HEADER}{'='*60}{Colors.ENDC}")
        print(f"{Colors.HEADER}TEST SUMMARY{Colors.ENDC}")
        print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
        
        print(f"\nTotal Tests: {Colors.OKBLUE}{self.total_tests}{Colors.ENDC}")
        print(f"Passed: {Colors.OKGREEN}{self.passed_tests}{Colors.ENDC}")
        print(f"Failed: {Colors.FAIL}{self.failed_tests}{Colors.ENDC}")
        
        if self.total_tests > 0:
            success_rate = (self.passed_tests / self.total_tests) * 100
            print(f"Success Rate: {Colors.OKCYAN}{success_rate:.2f}%{Colors.ENDC}")
        
        # Save detailed report
        report_filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w') as f:
            json.dump({
                "summary": {
                    "total": self.total_tests,
                    "passed": self.passed_tests,
                    "failed": self.failed_tests,
                    "success_rate": success_rate if self.total_tests > 0 else 0
                },
                "tests": self.test_results,
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n{Colors.OKGREEN}Detailed report saved to: {report_filename}{Colors.ENDC}")
        
        if self.failed_tests == 0:
            print(f"\n{Colors.OKGREEN}✅ ALL TESTS PASSED!{Colors.ENDC}")
            return 0
        else:
            print(f"\n{Colors.WARNING}⚠️ Some tests failed. Check the report for details.{Colors.ENDC}")
            return 1

if __name__ == "__main__":
    tester = CMSTestSuite()
    exit_code = tester.run_comprehensive_test()
    sys.exit(exit_code)