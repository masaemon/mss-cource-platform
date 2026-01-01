#!/bin/bash
# TC-COURSE-004: Validate response

RESPONSE_FILE="actual_response.json"

# Check if response has required fields
python3 << 'PYEOF'
import json
try:
    data = json.load(open('actual_response.json'))
    if 'data' not in data:
        print("✗ Missing 'data' field")
        exit(1)
    if 'total' not in data:
        print("✗ Missing 'total' field")
        exit(1)
    print("✓ Response structure valid")
except Exception as e:
    print(f"✗ Error: {e}")
    exit(1)
PYEOF
