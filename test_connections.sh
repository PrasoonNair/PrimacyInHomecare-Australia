#!/bin/bash

echo "=========================================="
echo "NDIS Manager - Full Connection Test"
echo "=========================================="

BASE_URL="http://localhost:5000"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-}
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "204" ] || [ "$response" = "304" ]; then
        echo "✓ $endpoint [$method]: $response OK"
    else
        echo "✗ $endpoint [$method]: $response ERROR"
    fi
}

echo -e "\n1. Testing Authentication Endpoints"
echo "------------------------------------"
test_endpoint "/api/auth/user"
test_endpoint "/api/login"
test_endpoint "/api/callback"

echo -e "\n2. Testing Core CRUD Endpoints"
echo "------------------------------------"
test_endpoint "/api/participants"
test_endpoint "/api/staff"
test_endpoint "/api/plans"
test_endpoint "/api/services"
test_endpoint "/api/progress-notes"
test_endpoint "/api/invoices"
test_endpoint "/api/ndis-rates"

echo -e "\n3. Testing Department Endpoints"
echo "------------------------------------"
test_endpoint "/api/referrals"
test_endpoint "/api/service-agreements"
test_endpoint "/api/staff-qualifications"
test_endpoint "/api/performance-reviews"
test_endpoint "/api/goals"
test_endpoint "/api/goal-actions"

echo -e "\n4. Testing Dashboard & Analytics"
echo "------------------------------------"
test_endpoint "/api/dashboard/stats"
test_endpoint "/api/dashboard/revenue"
test_endpoint "/api/dashboard/compliance"
test_endpoint "/api/roles"
test_endpoint "/api/search?q=test"

echo -e "\n5. Testing Automation Endpoints"
echo "------------------------------------"
test_endpoint "/api/automation/status"
test_endpoint "/api/automation/metrics"
test_endpoint "/api/automation/staff-matching"

echo -e "\n6. Testing Data Write Operations"
echo "------------------------------------"
# Test creating a participant
participant_data='{"firstName":"Connection","lastName":"Test","email":"test@example.com","phone":"0400000000","dateOfBirth":"1990-01-01","ndisNumber":"12345678","address":"123 Test St","communicationNeeds":"None","culturalBackground":"Australian","emergencyContact":"Emergency Test","emergencyPhone":"0400000001"}'
echo "Creating test participant..."
create_response=$(curl -s -X POST "$BASE_URL/api/participants" -H "Content-Type: application/json" -d "$participant_data" -w "\nHTTP_STATUS:%{http_code}")
http_status=$(echo "$create_response" | grep "HTTP_STATUS" | cut -d':' -f2)
if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
    echo "✓ CREATE participant: $http_status OK"
    # Extract participant ID for deletion
    participant_id=$(echo "$create_response" | head -n -1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$participant_id" ]; then
        # Test deletion
        delete_response=$(curl -s -X DELETE "$BASE_URL/api/participants/$participant_id" -w "%{http_code}")
        echo "✓ DELETE participant: $delete_response OK"
    fi
else
    echo "✗ CREATE participant: $http_status ERROR"
fi

echo -e "\n=========================================="
echo "Connection Test Complete!"
echo "=========================================="
