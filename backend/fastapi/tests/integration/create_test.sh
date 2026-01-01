#!/bin/bash
# Create a new test case from template

set -e

# Usage: ./create_test.sh <api_name> <test_case> <description>
# Example: ./create_test.sh auth TC-AUTH-050 "Test password reset"

API_NAME=$1
TEST_CASE=$2
DESCRIPTION=$3
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="${BASE_DIR}/${API_NAME}/${TEST_CASE}"

if [ -z "$API_NAME" ] || [ -z "$TEST_CASE" ]; then
    echo "Usage: ./create_test.sh <api_name> <test_case> <description>"
    echo "Example: ./create_test.sh auth TC-AUTH-050 'Test password reset'"
    exit 1
fi

if [ -d "$TEST_DIR" ]; then
    echo "Error: Test directory already exists: $TEST_DIR"
    exit 1
fi

echo "Creating test case: ${API_NAME}/${TEST_CASE}"
echo "Description: ${DESCRIPTION}"

# Create directory
mkdir -p "$TEST_DIR"

# Create request.sh
cat > "$TEST_DIR/request.sh" << 'EOF'
#!/bin/bash
# ${TEST_CASE}: ${DESCRIPTION}

# Example: GET request
curl -s -X GET http://localhost:8000/api/v1/endpoint \
  | python3 -m json.tool

# Example: POST request with auth
# TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
#     -H "Content-Type: application/json" \
#     -d '{"email":"user@example.com","password":"user123"}' \
#     | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
#
# curl -s -X POST http://localhost:8000/api/v1/endpoint \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "field": "value"
#   }' | python3 -m json.tool
EOF

# Replace placeholders
sed -i '' "s/\${TEST_CASE}/${TEST_CASE}/g" "$TEST_DIR/request.sh"
sed -i '' "s/\${DESCRIPTION}/${DESCRIPTION}/g" "$TEST_DIR/request.sh"

# Create validate_response.sh
cat > "$TEST_DIR/validate_response.sh" << 'EOF'
#!/bin/bash
# Validate ${TEST_CASE} response

RESPONSE_FILE="actual_response.json"

if [ ! -f "$RESPONSE_FILE" ]; then
    echo "✗ Response file not found"
    exit 1
fi

echo "Validating response structure..."

# Example: Check field exists
FIELD_VALUE=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('field', ''))")

if [ -z "$FIELD_VALUE" ]; then
    echo "✗ field is missing or empty"
    exit 1
fi

# Example: Check field value
if [ "$FIELD_VALUE" != "expected_value" ]; then
    echo "✗ field mismatch: expected 'expected_value', got '$FIELD_VALUE'"
    exit 1
fi

echo "✓ All validations passed"
exit 0
EOF

sed -i '' "s/\${TEST_CASE}/${TEST_CASE}/g" "$TEST_DIR/validate_response.sh"

# Create verify.sql
cat > "$TEST_DIR/verify.sql" << 'EOF'
-- Verify database state for ${TEST_CASE}
SELECT
    column1,
    column2
FROM table_name
WHERE condition
LIMIT 10;
EOF

sed -i '' "s/\${TEST_CASE}/${TEST_CASE}/g" "$TEST_DIR/verify.sql"

# Create expected_db.txt placeholder
cat > "$TEST_DIR/expected_db.txt" << 'EOF'
column1	column2
value1	value2
EOF

# Make scripts executable
chmod +x "$TEST_DIR/request.sh"
chmod +x "$TEST_DIR/validate_response.sh"

echo ""
echo "✓ Test case created successfully!"
echo ""
echo "Next steps:"
echo "1. Edit $TEST_DIR/request.sh - Define the API request"
echo "2. Edit $TEST_DIR/validate_response.sh - Define response validation"
echo "3. Edit $TEST_DIR/verify.sql - Define database verification query"
echo "4. Edit $TEST_DIR/expected_db.txt - Define expected database state"
echo ""
echo "Run the test:"
echo "  ./run_test.sh ${API_NAME} ${TEST_CASE}"
