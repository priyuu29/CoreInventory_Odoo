#!/bin/bash

# Test script for Deliveries and Receipts API
# Requires MongoDB and the Next.js dev server to be running

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== API Test Script ===${NC}"
echo ""

# Function to make requests
test_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X "$method" "$BASE_URL$endpoint" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data" -w "\n%{http_code}"
        else
            curl -s -X "$method" "$BASE_URL$endpoint" -H "Authorization: Bearer $token" -w "\n%{http_code}"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X "$method" "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data" -w "\n%{http_code}"
        else
            curl -s -X "$method" "$BASE_URL$endpoint" -w "\n%{http_code}"
        fi
    fi
}

# Step 1: Login to get token
echo -e "${YELLOW}1. Login to get authentication token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get token. Creating test user...${NC}"
    
    # Create test user
    curl -s -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test User","email":"admin@example.com","password":"admin123"}' > /dev/null
    
    # Try login again
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}')
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Could not authenticate. Please check MongoDB and server.${NC}"
    exit 1
fi

echo -e "${GREEN}Authentication successful!${NC}"
echo ""

# Create a warehouse first
echo -e "${YELLOW}2. Creating test warehouse...${NC}"
WAREHOUSE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/warehouses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name":"Test Warehouse","short_code":"TST","address":"123 Test St"}')

WAREHOUSE_ID=$(echo $WAREHOUSE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Warehouse ID: $WAREHOUSE_ID"
echo ""

# ============================================
# DELIVERIES API TESTS
# ============================================
echo -e "${YELLOW}=== DELIVERIES API TESTS ===${NC}"
echo ""

# GET all deliveries
echo "GET /api/deliveries"
curl -s -X GET "$BASE_URL/api/deliveries" -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

# POST create delivery
echo "POST /api/deliveries"
DELIVERY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/deliveries" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"destination\":\"Test Customer\",\"warehouse_id\":\"$WAREHOUSE_ID\",\"responsible\":\"John Doe\",\"contact\":\"+1234567890\"}")

DELIVERY_ID=$(echo $DELIVERY_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "$DELIVERY_RESPONSE"
echo "Delivery ID: $DELIVERY_ID"
echo ""

# GET delivery by ID
echo "GET /api/deliveries/:id"
curl -s -X GET "$BASE_URL/api/deliveries/$DELIVERY_ID" -H "Authorization: Bearer $TOKEN" | head -c 300
echo ""
echo ""

# PUT update delivery
echo "PUT /api/deliveries/:id"
curl -s -X PUT "$BASE_URL/api/deliveries/$DELIVERY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"destination":"Updated Customer"}' | head -c 200
echo ""
echo ""

# POST add item to delivery
echo "POST /api/deliveries/:id/items"
curl -s -X POST "$BASE_URL/api/deliveries/$DELIVERY_ID/items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"product_id":"507f1f77bcf86cd799439011","quantity":10}' | head -c 200
echo ""
echo ""

# POST check-stock
echo "POST /api/deliveries/:id/check-stock"
curl -s -X POST "$BASE_URL/api/deliveries/$DELIVERY_ID/check-stock" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# POST validate delivery
echo "POST /api/deliveries/:id/validate"
curl -s -X POST "$BASE_URL/api/deliveries/$DELIVERY_ID/validate" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# POST complete delivery
echo "POST /api/deliveries/:id/complete"
curl -s -X POST "$BASE_URL/api/deliveries/$DELIVERY_ID/complete" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# GET print delivery
echo "GET /api/deliveries/:id/print"
curl -s -X GET "$BASE_URL/api/deliveries/$DELIVERY_ID/print" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

# DELETE delivery
echo "DELETE /api/deliveries/:id"
curl -s -X DELETE "$BASE_URL/api/deliveries/$DELIVERY_ID" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# ============================================
# RECEIPTS API TESTS
# ============================================
echo -e "${YELLOW}=== RECEIPTS API TESTS ===${NC}"
echo ""

# GET all receipts
echo "GET /api/receipts"
curl -s -X GET "$BASE_URL/api/receipts" -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

# POST create receipt
echo "POST /api/receipts"
RECEIPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/receipts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"vendor\":\"Test Vendor\",\"warehouse_id\":\"$WAREHOUSE_ID\",\"responsible\":\"Jane Doe\",\"contact\":\"+0987654321\"}")

RECEIPT_ID=$(echo $RECEIPT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "$RECEIPT_RESPONSE"
echo "Receipt ID: $RECEIPT_ID"
echo ""

# GET receipt by ID
echo "GET /api/receipts/:id"
curl -s -X GET "$BASE_URL/api/receipts/$RECEIPT_ID" -H "Authorization: Bearer $TOKEN" | head -c 300
echo ""
echo ""

# PUT update receipt
echo "PUT /api/receipts/:id"
curl -s -X PUT "$BASE_URL/api/receipts/$RECEIPT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"vendor":"Updated Vendor"}' | head -c 200
echo ""
echo ""

# POST add item to receipt
echo "POST /api/receipts/:id/items"
curl -s -X POST "$BASE_URL/api/receipts/$RECEIPT_ID/items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"product_id":"507f1f77bcf86cd799439011","quantity":5,"unit_cost":100}' | head -c 200
echo ""
echo ""

# POST validate receipt
echo "POST /api/receipts/:id/validate"
curl -s -X POST "$BASE_URL/api/receipts/$RECEIPT_ID/validate" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# POST complete receipt
echo "POST /api/receipts/:id/complete"
curl -s -X POST "$BASE_URL/api/receipts/$RECEIPT_ID/complete" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# GET print receipt
echo "GET /api/receipts/:id/print"
curl -s -X GET "$BASE_URL/api/receipts/$RECEIPT_ID/print" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
echo ""
echo ""

# DELETE receipt
echo "DELETE /api/receipts/:id"
curl -s -X DELETE "$BASE_URL/api/receipts/$RECEIPT_ID" \
    -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# ============================================
# ERROR HANDLING TESTS
# ============================================
echo -e "${YELLOW}=== ERROR HANDLING TESTS ===${NC}"
echo ""

# Test without auth
echo "GET /api/deliveries (without auth)"
curl -s -X GET "$BASE_URL/api/deliveries"
echo ""
echo ""

# Test invalid ID
echo "GET /api/deliveries/invalid-id"
curl -s -X GET "$BASE_URL/api/deliveries/invalid-id" -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# Test create without required fields
echo "POST /api/deliveries (missing required fields)"
curl -s -X POST "$BASE_URL/api/deliveries" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{}'
echo ""
echo ""

echo -e "${GREEN}=== Tests Complete ===${NC}"