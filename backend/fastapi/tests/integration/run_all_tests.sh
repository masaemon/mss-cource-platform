#!/bin/bash
# Run all integration tests
# Usage: ./run_all_tests.sh [api_name]
# Example: ./run_all_tests.sh auth (run only auth tests)
#          ./run_all_tests.sh (run all tests)

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TARGET_API=$1

if [ -n "$TARGET_API" ]; then
    echo "========================================="
    echo "Running Integration Tests for: $TARGET_API"
    echo "========================================="
else
    echo "========================================="
    echo "Running All Integration Tests"
    echo "========================================="
fi

# Function to run a single test
run_single_test() {
    local api_name=$1
    local test_case=$2

    echo ""
    echo "Running: ${api_name}/${test_case}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if "$BASE_DIR/run_test.sh" "$api_name" "$test_case" > /dev/null 2>&1; then
        echo "✓ PASS: ${api_name}/${test_case}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "✗ FAIL: ${api_name}/${test_case}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Run common setup
echo "[Setup] Running common setup SQL..."
if [ -f "$BASE_DIR/common_setup.sql" ]; then
    docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < "$BASE_DIR/common_setup.sql"
fi

# Find and run all tests
for api_dir in "$BASE_DIR"/*/; do
    api_name=$(basename "$api_dir")

    # Skip non-API directories
    if [[ "$api_name" == "." || "$api_name" == ".." || ! -d "$api_dir" ]]; then
        continue
    fi

    # Skip if it's a file, not a directory
    if [ ! -d "$api_dir" ]; then
        continue
    fi

    # If TARGET_API is set, skip other APIs
    if [ -n "$TARGET_API" ] && [ "$api_name" != "$TARGET_API" ]; then
        continue
    fi

    echo ""
    echo "========================================="
    echo "API: $api_name"
    echo "========================================="

    # Run API setup
    if [ -f "${api_dir}setup.sql" ]; then
        echo "[Setup] Running ${api_name} setup SQL..."
        docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < "${api_dir}setup.sql"
    fi

    # Find all test cases
    for test_dir in "$api_dir"TC-*/; do
        if [ -d "$test_dir" ]; then
            test_case=$(basename "$test_dir")
            run_single_test "$api_name" "$test_case"

            # Add delay between tests to avoid rate limiting
            sleep 0.5
        fi
    done
done

# Summary
echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "Total:  $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "========================================="

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✓ All tests passed!"
    exit 0
else
    echo "✗ Some tests failed"
    exit 1
fi
