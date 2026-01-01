#!/bin/bash
# Helper script to run a single integration test

set -e

# Usage: ./run_test.sh <api_name> <test_case>
# Example: ./run_test.sh auth TC-AUTH-001

API_NAME=$1
TEST_CASE=$2
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="${BASE_DIR}/${API_NAME}/${TEST_CASE}"

if [ -z "$API_NAME" ] || [ -z "$TEST_CASE" ]; then
    echo "Usage: ./run_test.sh <api_name> <test_case>"
    echo "Example: ./run_test.sh auth TC-AUTH-001"
    exit 1
fi

if [ ! -d "$TEST_DIR" ]; then
    echo "Error: Test directory not found: $TEST_DIR"
    exit 1
fi

echo "========================================="
echo "Running Test: ${API_NAME}/${TEST_CASE}"
echo "========================================="

# Step 1: Run setup SQL if exists
if [ -f "${BASE_DIR}/${API_NAME}/setup.sql" ]; then
    echo "[1/6] Running setup SQL..."
    docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < "${BASE_DIR}/${API_NAME}/setup.sql"
fi

# Step 2: Run test-specific setup SQL if exists
if [ -f "${TEST_DIR}/setup.sql" ]; then
    echo "[2/6] Running test-specific setup SQL..."
    docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < "${TEST_DIR}/setup.sql"
fi

# Step 3: Execute API request
echo "[3/6] Executing API request..."
cd "$TEST_DIR"
bash request.sh > actual_response.json 2>&1 || true
cd "$BASE_DIR"

# Step 4a: Run custom validation script if exists
if [ -f "${TEST_DIR}/validate_response.sh" ]; then
    echo "[4a/6] Running validation script..."
    cd "$TEST_DIR"
    if bash validate_response.sh; then
        echo "✓ Validation passed"
    else
        echo "✗ Validation failed"
    fi
    cd "$BASE_DIR"
fi

# Step 4b: Compare response with expected
if [ -f "${TEST_DIR}/expected_response.json" ]; then
    echo "[4b/6] Comparing response..."
    if diff -u "${TEST_DIR}/expected_response.json" "${TEST_DIR}/actual_response.json" > /dev/null 2>&1; then
        echo "✓ Response matches expected"
    else
        echo "✗ Response mismatch:"
        diff -u "${TEST_DIR}/expected_response.json" "${TEST_DIR}/actual_response.json" || true
    fi
fi

# Step 5: Verify database state if verification SQL exists
if [ -f "${TEST_DIR}/verify.sql" ]; then
    echo "[5/6] Verifying database state..."
    docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < "${TEST_DIR}/verify.sql" > "${TEST_DIR}/actual_db.txt"

    if [ -f "${TEST_DIR}/expected_db.txt" ]; then
        if diff -u "${TEST_DIR}/expected_db.txt" "${TEST_DIR}/actual_db.txt" > /dev/null 2>&1; then
            echo "✓ Database state matches expected"
        else
            echo "✗ Database state mismatch:"
            diff -u "${TEST_DIR}/expected_db.txt" "${TEST_DIR}/actual_db.txt" || true
        fi
    fi
fi

echo "========================================="
echo "Test completed: ${API_NAME}/${TEST_CASE}"
echo "========================================="
