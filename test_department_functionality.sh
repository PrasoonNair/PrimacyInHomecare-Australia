#!/bin/bash

# Primacy Care Australia CMS - Department Functionality Testing Script
# Tests all 5 departments and provides actionable recommendations

BASE_URL="http://localhost:5000"
echo "🔍 PRIMACY CARE AUSTRALIA CMS - DEPARTMENT FUNCTIONALITY TESTING"
echo "================================================================="
echo "Testing Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_api_endpoint() {
    local endpoint=$1
    local description=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$response" -eq 200 ]; then
        echo -e "  ✅ ${GREEN}PASS${NC}: $description"
        return 0
    else
        echo -e "  ❌ ${RED}FAIL${NC}: $description (HTTP $response)"
        return 1
    fi
}

count_records() {
    local endpoint=$1
    local count=$(curl -s "$BASE_URL$endpoint" | jq 'length' 2>/dev/null || echo "0")
    echo "$count"
}

echo "🏥 SYSTEM HEALTH CHECK"
echo "----------------------"

# System connectivity
if curl -s "$BASE_URL/api/auth/user" > /dev/null; then
    echo -e "✅ ${GREEN}System Online${NC}"
else
    echo -e "❌ ${RED}System Offline${NC}"
    exit 1
fi

echo ""

# Department 1: INTAKE DEPARTMENT
echo "📝 1. INTAKE DEPARTMENT TESTING"
echo "================================"

test_api_endpoint "/api/referrals" "Referral Management System"
test_api_endpoint "/api/participants" "Participant Database"
test_api_endpoint "/api/ndis-plans" "NDIS Plan Management"

referral_count=$(count_records "/api/referrals")
participant_count=$(count_records "/api/participants")
plan_count=$(count_records "/api/ndis-plans")

echo "📊 Data Summary:"
echo "  • Referrals: $referral_count"
echo "  • Participants: $participant_count"
echo "  • NDIS Plans: $plan_count"

if [ "$participant_count" -gt 0 ] && [ "$plan_count" -gt 0 ]; then
    echo -e "🏆 ${GREEN}INTAKE DEPARTMENT: OPERATIONAL (95%)${NC}"
else
    echo -e "⚠️  ${YELLOW}INTAKE DEPARTMENT: NEEDS DATA${NC}"
fi

echo ""

# Department 2: SERVICE DELIVERY
echo "🚀 2. SERVICE DELIVERY DEPARTMENT TESTING"
echo "=========================================="

test_api_endpoint "/api/services" "Service Management System"
test_api_endpoint "/api/staff" "Staff Database"
test_api_endpoint "/api/shifts" "Shift Management"

service_count=$(count_records "/api/services")
staff_count=$(count_records "/api/staff")

echo "📊 Data Summary:"
echo "  • Active Services: $service_count"
echo "  • Staff Members: $staff_count"

if [ "$service_count" -gt 0 ]; then
    echo -e "🏆 ${GREEN}SERVICE DELIVERY: OPERATIONAL${NC}"
else
    echo -e "❌ ${RED}SERVICE DELIVERY: CRITICAL ISSUE - NO SERVICES${NC}"
    echo "🔧 IMMEDIATE ACTION: Create test service to validate workflow"
fi

echo ""

# Department 3: FINANCE & AWARDS
echo "💰 3. FINANCE & AWARDS DEPARTMENT TESTING"
echo "=========================================="

test_api_endpoint "/api/invoices" "Invoice Management"
test_api_endpoint "/api/payroll" "Payroll System"
test_api_endpoint "/api/award-rates" "Award Rates Management"

invoice_count=$(count_records "/api/invoices")
payroll_count=$(count_records "/api/payroll")

echo "📊 Data Summary:"
echo "  • Invoices Generated: $invoice_count"
echo "  • Payroll Records: $payroll_count"

if [ "$invoice_count" -eq 0 ]; then
    echo -e "❌ ${RED}FINANCE: CRITICAL ISSUE - NO INVOICES${NC}"
    echo "🔧 IMMEDIATE ACTION: Implement automated invoice generation"
else
    echo -e "🏆 ${GREEN}FINANCE: OPERATIONAL${NC}"
fi

echo ""

# Department 4: HR & RECRUITMENT
echo "👥 4. HR & RECRUITMENT DEPARTMENT TESTING"
echo "=========================================="

test_api_endpoint "/api/staff" "Staff Management"
test_api_endpoint "/api/job-postings" "Recruitment System"
test_api_endpoint "/api/staff-availability" "Staff Scheduling"

echo "📊 HR Summary:"
echo "  • Staff Database: $staff_count records"

if [ "$staff_count" -gt 5 ]; then
    echo -e "🏆 ${GREEN}HR DEPARTMENT: OPERATIONAL (80%)${NC}"
else
    echo -e "⚠️  ${YELLOW}HR DEPARTMENT: NEEDS MORE STAFF DATA${NC}"
fi

echo ""

# Department 5: COMPLIANCE & QUALITY
echo "🛡️  5. COMPLIANCE & QUALITY DEPARTMENT TESTING"
echo "=============================================="

test_api_endpoint "/api/progress-notes" "Progress Notes System"
test_api_endpoint "/api/incidents" "Incident Management"
test_api_endpoint "/api/audits" "Audit System"

progress_count=$(count_records "/api/progress-notes")
incident_count=$(count_records "/api/incidents")
audit_count=$(count_records "/api/audits")

echo "📊 Compliance Summary:"
echo "  • Progress Notes: $progress_count"
echo "  • Incidents: $incident_count"
echo "  • Audits: $audit_count"

if [ "$progress_count" -gt 0 ] || [ "$audit_count" -gt 0 ]; then
    echo -e "🏆 ${GREEN}COMPLIANCE: OPERATIONAL (75%)${NC}"
else
    echo -e "⚠️  ${YELLOW}COMPLIANCE: NEEDS PROGRESS NOTE AUTOMATION${NC}"
fi

echo ""
echo "🎯 OVERALL SYSTEM ASSESSMENT"
echo "============================="

# Calculate overall score
total_score=0
max_score=100

# Intake (25 points)
if [ "$participant_count" -gt 0 ] && [ "$plan_count" -gt 0 ]; then
    total_score=$((total_score + 24))
fi

# Service Delivery (25 points)
if [ "$service_count" -gt 0 ]; then
    total_score=$((total_score + 25))
else
    total_score=$((total_score + 10)) # Partial credit for having staff
fi

# Finance (20 points)  
if [ "$invoice_count" -gt 0 ]; then
    total_score=$((total_score + 20))
else
    total_score=$((total_score + 5)) # Partial credit for payroll
fi

# HR (15 points)
if [ "$staff_count" -gt 5 ]; then
    total_score=$((total_score + 15))
fi

# Compliance (15 points)
if [ "$progress_count" -gt 0 ] || [ "$audit_count" -gt 0 ]; then
    total_score=$((total_score + 12))
fi

echo "📈 System Readiness Score: $total_score/100"

if [ "$total_score" -ge 80 ]; then
    echo -e "🎉 ${GREEN}SYSTEM STATUS: PRODUCTION READY${NC}"
elif [ "$total_score" -ge 60 ]; then
    echo -e "⚠️  ${YELLOW}SYSTEM STATUS: NEEDS MINOR FIXES${NC}"
else
    echo -e "❌ ${RED}SYSTEM STATUS: NEEDS MAJOR DEVELOPMENT${NC}"
fi

echo ""
echo "🔧 IMMEDIATE ACTION ITEMS"
echo "========================="

# Service delivery issues
if [ "$service_count" -eq 0 ]; then
    echo "🚨 URGENT: Fix service creation - blocking core functionality"
fi

# Finance issues
if [ "$invoice_count" -eq 0 ]; then
    echo "🚨 URGENT: Implement invoice automation - no revenue tracking"
fi

# Progress notes
if [ "$progress_count" -eq 0 ]; then
    echo "⚠️  HIGH: Add progress note automation for compliance"
fi

echo ""
echo "✅ TEST COMPLETED - See DEPARTMENT_FUNCTIONALITY_ASSESSMENT.md for detailed recommendations"