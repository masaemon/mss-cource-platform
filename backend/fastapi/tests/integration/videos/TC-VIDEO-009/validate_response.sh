#!/bin/bash
# TC-VIDEO-009: Validate successful video creation

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:201" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 201 confirmed"
    
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
if 'id' not in data:
    print("✗ Missing id field")
    exit(1)
if 'course_id' not in data:
    print("✗ Missing course_id field")
    exit(1)
print("✓ Video created successfully")
PYEOF
else
    echo "✗ Expected HTTP status 201"
    exit 1
fi
