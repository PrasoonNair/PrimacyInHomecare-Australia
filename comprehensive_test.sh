#!/bin/bash

echo "=========================================="
echo "NDIS Manager - Frontend-Backend Test"
echo "=========================================="

# Test each major API category
echo -e "\n1. Authentication System"
echo "-------------------------"
auth_response=$(curl -s http://localhost:5000/api/auth/user -w "\nSTATUS:%{http_code}")
status=$(echo "$auth_response" | grep "STATUS:" | cut -d':' -f2)
if [ "$status" = "200" ] || [ "$status" = "304" ]; then
    echo "✓ Authentication working (Status: $status)"
    echo "  User authenticated successfully"
else
    echo "✗ Authentication issue (Status: $status)"
fi

echo -e "\n2. Dashboard Data"
echo "-----------------"
dash_response=$(curl -s http://localhost:5000/api/dashboard/stats -w "\nSTATUS:%{http_code}")
status=$(echo "$dash_response" | grep "STATUS:" | cut -d':' -f2)
if [ "$status" = "200" ] || [ "$status" = "304" ]; then
    echo "✓ Dashboard stats working (Status: $status)"
    data=$(echo "$dash_response" | head -n -1)
    echo "  Data: $data"
else
    echo "✗ Dashboard issue (Status: $status)"
fi

echo -e "\n3. CRUD Operations"
echo "------------------"
endpoints=("participants" "staff" "plans" "services" "progress-notes" "invoices")
for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/$endpoint)
    if [ "$response" = "200" ] || [ "$response" = "304" ]; then
        echo "✓ /api/$endpoint: OK"
    else
        echo "✗ /api/$endpoint: Error ($response)"
    fi
done

echo -e "\n4. Search Functionality"
echo "-----------------------"
search_response=$(curl -s http://localhost:5000/api/search?q=test -w "\nSTATUS:%{http_code}")
status=$(echo "$search_response" | grep "STATUS:" | cut -d':' -f2)
if [ "$status" = "200" ]; then
    echo "✓ Search API working"
else
    echo "✗ Search API issue (Status: $status)"
fi

echo -e "\n5. Role Management"
echo "------------------"
roles_response=$(curl -s http://localhost:5000/api/roles -w "\nSTATUS:%{http_code}")
status=$(echo "$roles_response" | grep "STATUS:" | cut -d':' -f2)
if [ "$status" = "200" ]; then
    echo "✓ Roles API working"
    count=$(echo "$roles_response" | head -n -1 | grep -o '"id"' | wc -l)
    echo "  Found $count roles"
else
    echo "✗ Roles API issue (Status: $status)"
fi

echo -e "\n=========================================="
echo "Test Summary: Frontend-Backend Connection"
echo "=========================================="
echo "All critical endpoints tested"
echo "Check workflow logs for any runtime errors"
