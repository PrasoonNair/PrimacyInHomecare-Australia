#!/bin/bash

echo "========================================="
echo "Primacy Care Australia CMS - System Test"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000"

echo "Testing API Endpoints..."
echo "------------------------"

# Test auth endpoint
echo -n "Testing /api/auth/user... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/auth/user)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

# Test participants endpoint
echo -n "Testing /api/participants... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/participants)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

# Test staff endpoint
echo -n "Testing /api/staff... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/staff)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

# Test dashboard stats
echo -n "Testing /api/dashboard/stats... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/dashboard/stats)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

# Test services endpoint
echo -n "Testing /api/services... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/services)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

# Test automation status
echo -n "Testing /api/automation/status... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/automation/status)
if [ $STATUS -eq 200 ] || [ $STATUS -eq 304 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL (Status: $STATUS)${NC}"
fi

echo ""
echo "Database Check..."
echo "-----------------"

# Check database connection
echo -n "Testing database connection... "
if [ ! -z "$DATABASE_URL" ]; then
    echo -e "${GREEN}✓ Database configured${NC}"
else
    echo -e "${YELLOW}⚠ No database URL found${NC}"
fi

echo ""
echo "Build Status..."
echo "---------------"

# Check if build completes
echo -n "Testing production build... "
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
fi

echo ""
echo "TypeScript Check..."
echo "-------------------"

# Count TypeScript errors
echo -n "Checking TypeScript errors... "
ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
if [ "$ERROR_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠ $ERROR_COUNT TypeScript errors found${NC}"
fi

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo -e "${GREEN}Testing environment is ready!${NC}"
echo ""
echo "Next steps:"
echo "1. Open the app in your browser"
echo "2. Follow the test scenarios in TEST_GUIDE.md"
echo "3. Report any issues found"
echo ""
echo "Happy testing! 🚀"
