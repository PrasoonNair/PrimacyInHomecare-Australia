#!/bin/bash

# Comprehensive Role System Test for Primacy Care Australia CMS
# Tests all 15 roles and their functionalities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000"

# Test results file
TEST_RESULTS="test_results_$(date +%Y%m%d_%H%M%S).md"

# Initialize test results
echo "# Primacy Care CMS - Comprehensive Role System Test" > $TEST_RESULTS
echo "## Test Execution: $(date)" >> $TEST_RESULTS
echo "" >> $TEST_RESULTS

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log results
log_test() {
    local role=$1
    local test_name=$2
    local status=$3
    local details=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} [$role] $test_name"
        echo "✅ **[$role]** $test_name - $details" >> $TEST_RESULTS
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} [$role] $test_name: $details"
        echo "❌ **[$role]** $test_name - $details" >> $TEST_RESULTS
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test API endpoint
test_endpoint() {
    local role=$1
    local endpoint=$2
    local method=$3
    local expected_status=$4
    local test_name=$5
    
    response=$(curl -s -w "\n%{http_code}" -X $method \
        -H "Content-Type: application/json" \
        -c cookies.txt -b cookies.txt \
        "$BASE_URL$endpoint")
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        log_test "$role" "$test_name" "PASS" "Status: $http_code"
    else
        log_test "$role" "$test_name" "FAIL" "Expected: $expected_status, Got: $http_code"
    fi
}

# Function to login as test user
login_as_role() {
    local role=$1
    local role_id=$2
    
    echo -e "\n${BLUE}Testing Role: $role${NC}"
    echo "" >> $TEST_RESULTS
    echo "### Role: $role" >> $TEST_RESULTS
    echo "" >> $TEST_RESULTS
    
    # Login as test user
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -c cookies.txt \
        -d "{\"testUserId\": \"$role_id\"}" \
        "$BASE_URL/api/test-login")
    
    http_code=$(echo "$response" | tail -n 1)
    
    if [ "$http_code" = "200" ]; then
        log_test "$role" "Login" "PASS" "Successfully logged in"
        return 0
    else
        log_test "$role" "Login" "FAIL" "HTTP $http_code"
        return 1
    fi
}

# Test role-specific dashboards and KPIs
test_role_dashboards() {
    local role=$1
    local role_key=$2
    
    # Test dashboard KPIs
    test_endpoint "$role" "/api/dashboard/kpis/$role_key" "GET" "200" "Dashboard KPIs Access"
    
    # Test stats endpoint
    test_endpoint "$role" "/api/dashboard/stats" "GET" "200" "Dashboard Stats Access"
}

# Test CRUD operations based on role permissions
test_role_permissions() {
    local role=$1
    local permissions=$2
    
    # Test participant access
    if [[ "$permissions" == *"participant"* ]] || [[ "$permissions" == "all" ]]; then
        test_endpoint "$role" "/api/participants" "GET" "200" "View Participants"
    else
        test_endpoint "$role" "/api/participants" "GET" "403" "Restricted: Participants"
    fi
    
    # Test staff access
    if [[ "$permissions" == *"staff"* ]] || [[ "$permissions" == "all" ]]; then
        test_endpoint "$role" "/api/staff" "GET" "200" "View Staff"
    else
        test_endpoint "$role" "/api/staff" "GET" "403" "Restricted: Staff"
    fi
    
    # Test financial access
    if [[ "$permissions" == *"financial"* ]] || [[ "$permissions" == "all" ]]; then
        test_endpoint "$role" "/api/invoices" "GET" "200" "View Invoices"
    else
        test_endpoint "$role" "/api/invoices" "GET" "403" "Restricted: Invoices"
    fi
    
    # Test shifts access
    if [[ "$permissions" == *"shift"* ]] || [[ "$permissions" == "all" ]]; then
        test_endpoint "$role" "/api/shifts" "GET" "200" "View Shifts"
    else
        test_endpoint "$role" "/api/shifts" "GET" "403" "Restricted: Shifts"
    fi
}

# Test workflow access
test_workflow_access() {
    local role=$1
    local has_workflow=$2
    
    if [ "$has_workflow" = "yes" ]; then
        test_endpoint "$role" "/api/workflows" "GET" "200" "Workflow Access"
        test_endpoint "$role" "/api/service-agreements" "GET" "200" "Service Agreements"
    else
        test_endpoint "$role" "/api/workflows" "GET" "403" "Restricted: Workflows"
    fi
}

# Main test execution
echo -e "${YELLOW}Starting Comprehensive Role System Test...${NC}\n"

# Test all 15 roles
roles=(
    "super_admin|test-super-admin|all|yes"
    "ceo|test-ceo|all|yes"
    "general_manager|test-general-manager|all|yes"
    "intake_coordinator|test-intake-coordinator|participant|yes"
    "intake_manager|test-intake-manager|participant|yes"
    "finance_officer_billing|test-finance-billing|financial|no"
    "finance_officer_payroll|test-finance-payroll|financial,staff|no"
    "finance_manager|test-finance-manager|financial,staff|yes"
    "hr_manager|test-hr-manager|staff|yes"
    "hr_recruiter|test-hr-recruiter|staff|no"
    "service_delivery_manager|test-service-manager|participant,shift,staff|yes"
    "service_delivery_allocation|test-service-allocation|shift,staff|no"
    "service_delivery_coordinator|test-service-coordinator|participant,shift|yes"
    "quality_manager|test-quality-manager|all|yes"
    "support_worker|test-support-worker|participant,shift|no"
)

for role_data in "${roles[@]}"; do
    IFS='|' read -r role_key role_id permissions has_workflow <<< "$role_data"
    
    if login_as_role "$role_key" "$role_id"; then
        # Test dashboard access
        test_role_dashboards "$role_key" "$role_key"
        
        # Test permissions
        test_role_permissions "$role_key" "$permissions"
        
        # Test workflow access
        test_workflow_access "$role_key" "$has_workflow"
        
        # Test role-specific endpoints
        case "$role_key" in
            "intake_coordinator"|"intake_manager")
                test_endpoint "$role_key" "/api/referrals" "GET" "200" "Referrals Access"
                ;;
            "finance_officer_billing"|"finance_manager")
                test_endpoint "$role_key" "/api/ndis-pricing" "GET" "200" "NDIS Pricing Access"
                ;;
            "hr_manager"|"hr_recruiter")
                test_endpoint "$role_key" "/api/recruitment" "GET" "200" "Recruitment Access"
                ;;
            "quality_manager")
                test_endpoint "$role_key" "/api/incidents" "GET" "200" "Incidents Access"
                test_endpoint "$role_key" "/api/audits" "GET" "200" "Audits Access"
                ;;
            "support_worker")
                test_endpoint "$role_key" "/api/progress-notes" "GET" "200" "Progress Notes Access"
                ;;
        esac
    fi
done

# Generate summary
echo -e "\n${YELLOW}=== TEST SUMMARY ===${NC}"
echo "" >> $TEST_RESULTS
echo "## Test Summary" >> $TEST_RESULTS
echo "" >> $TEST_RESULTS

echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

echo "- **Total Tests:** $TOTAL_TESTS" >> $TEST_RESULTS
echo "- **Passed:** $PASSED_TESTS ✅" >> $TEST_RESULTS
echo "- **Failed:** $FAILED_TESTS ❌" >> $TEST_RESULTS
echo "- **Success Rate:** $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%" >> $TEST_RESULTS

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo "" >> $TEST_RESULTS
    echo "### Result: ✅ ALL TESTS PASSED!" >> $TEST_RESULTS
else
    echo -e "\n${RED}⚠️  Some tests failed. Check $TEST_RESULTS for details.${NC}"
    echo "" >> $TEST_RESULTS
    echo "### Result: ⚠️ Some tests failed" >> $TEST_RESULTS
fi

echo -e "\nTest results saved to: ${BLUE}$TEST_RESULTS${NC}"

# Clean up
rm -f cookies.txt

exit 0