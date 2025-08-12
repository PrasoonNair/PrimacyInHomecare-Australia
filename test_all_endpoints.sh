#!/bin/bash

BASE_URL="http://localhost:5000/api"
echo "========================================="
echo "Testing NDIS Manager API Endpoints"
echo "========================================="

# Test authentication endpoint
echo -e "\n1. Testing Authentication..."
curl -s -o /dev/null -w "Auth User: %{http_code}\n" $BASE_URL/auth/user

# Test dashboard endpoints
echo -e "\n2. Testing Dashboard..."
curl -s -o /dev/null -w "Dashboard Stats: %{http_code}\n" $BASE_URL/dashboard/stats

# Test participant endpoints
echo -e "\n3. Testing Participants..."
curl -s -o /dev/null -w "Get Participants: %{http_code}\n" $BASE_URL/participants

# Test staff endpoints
echo -e "\n4. Testing Staff..."
curl -s -o /dev/null -w "Get Staff: %{http_code}\n" $BASE_URL/staff

# Test services endpoints
echo -e "\n5. Testing Services..."
curl -s -o /dev/null -w "Get Services: %{http_code}\n" $BASE_URL/services

# Test NDIS plans endpoints
echo -e "\n6. Testing NDIS Plans..."
curl -s -o /dev/null -w "Get NDIS Plans: %{http_code}\n" $BASE_URL/ndis-plans

# Test progress notes endpoints
echo -e "\n7. Testing Progress Notes..."
curl -s -o /dev/null -w "Get Progress Notes: %{http_code}\n" $BASE_URL/progress-notes

# Test invoices endpoints
echo -e "\n8. Testing Financial..."
curl -s -o /dev/null -w "Get Invoices: %{http_code}\n" $BASE_URL/invoices

# Test service agreements endpoints
echo -e "\n9. Testing Service Agreements..."
curl -s -o /dev/null -w "Get Service Agreements: %{http_code}\n" $BASE_URL/service-agreements

# Test referrals endpoints
echo -e "\n10. Testing Referrals..."
curl -s -o /dev/null -w "Get Referrals: %{http_code}\n" $BASE_URL/referrals

# Test participant goals endpoints
echo -e "\n11. Testing Participant Goals..."
curl -s -o /dev/null -w "Get Participant Goals: %{http_code}\n" $BASE_URL/participant-goals

# Test goal actions endpoints
echo -e "\n12. Testing Goal Actions..."
curl -s -o /dev/null -w "Get Goal Actions: %{http_code}\n" $BASE_URL/goal-actions

# Test service allocations endpoints
echo -e "\n13. Testing Service Allocations..."
curl -s -o /dev/null -w "Get Allocations: %{http_code}\n" $BASE_URL/service-allocations

# Test automation endpoints
echo -e "\n14. Testing Automation..."
curl -s -o /dev/null -w "Get Automation Status: %{http_code}\n" $BASE_URL/automation/status
curl -s -o /dev/null -w "Get Automation History: %{http_code}\n" $BASE_URL/automation/history

# Test NDIS price guide endpoints
echo -e "\n15. Testing NDIS Price Guide..."
curl -s -o /dev/null -w "Search Price Guide: %{http_code}\n" "$BASE_URL/ndis-price-guide/search?query=test"

# Test reports endpoint
echo -e "\n16. Testing Reports..."
curl -s -o /dev/null -w "Generate Report: %{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"type":"compliance","dateRange":"month"}' $BASE_URL/reports/generate

# Test users endpoint
echo -e "\n17. Testing Users..."
curl -s -o /dev/null -w "Get Users: %{http_code}\n" $BASE_URL/users

# Test roles endpoint
echo -e "\n18. Testing Roles..."
curl -s -o /dev/null -w "Get Roles: %{http_code}\n" $BASE_URL/roles

echo -e "\n========================================="
echo "API Endpoint Testing Complete"
echo "========================================="
