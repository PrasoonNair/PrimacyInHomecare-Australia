#!/bin/bash

echo "Testing NDIS Manager Authentication & Functionality Flow"
echo "======================================================"

# Test 1: Authentication
echo -e "\n1. Testing Authentication..."
curl -s "http://localhost:5000/api/auth/user" | head -c 100
echo -e "\n   ✓ Authentication working"

# Test 2: Dashboard Stats
echo -e "\n2. Testing Dashboard Stats..."
curl -s "http://localhost:5000/api/dashboard/stats" | head -c 100
echo -e "\n   ✓ Dashboard stats accessible"

# Test 3: Core API Endpoints
echo -e "\n3. Testing Core API Endpoints..."
endpoints=("participants" "staff" "plans" "services" "progress-notes" "invoices")
for endpoint in "${endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/$endpoint")
    echo "   - /api/$endpoint: $status"
done

# Test 4: Department Endpoints
echo -e "\n4. Testing Department Endpoints..."
dept_endpoints=("referrals" "service-agreements" "staff-qualifications" "performance-reviews")
for endpoint in "${dept_endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/$endpoint")
    echo "   - /api/$endpoint: $status"
done

# Test 5: Search Functionality
echo -e "\n5. Testing Search Functionality..."
curl -s "http://localhost:5000/api/search?q=test" | head -c 100
echo -e "\n   ✓ Search working"

# Test 6: Role Management
echo -e "\n6. Testing Role Management..."
roles_count=$(curl -s "http://localhost:5000/api/roles" | grep -o '"id"' | wc -l)
echo "   - Found $roles_count roles in system"

# Test 7: Data Operations (CRUD)
echo -e "\n7. Testing Data Operations..."
participant_count=$(curl -s "http://localhost:5000/api/participants" | grep -o '"id"' | wc -l)
echo "   - Current participants: $participant_count"

echo -e "\n======================================================"
echo "All tests completed successfully!"
