#!/bin/bash
# TC-COURSE-020: Validate successful course creation

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:201" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 201 confirmed"
    
    # Validate response has id and instructor_id
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
if 'id' not in data:
    print("✗ Missing id field")
    exit(1)
if 'instructor_id' not in data:
    print("✗ Missing instructor_id field")
    exit(1)
print("✓ Course created successfully")
PYEOF
else
    echo "✗ Expected HTTP status 201"
    exit 1
fi
