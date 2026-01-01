#!/bin/bash
# TC-COMMENT-023: Validate successful instructor reply

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:201" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 201 confirmed"
    
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
if data.get('is_instructor_reply') != True:
    print("✗ is_instructor_reply should be true")
    exit(1)
print("✓ Instructor reply created successfully")
PYEOF
else
    echo "✗ Expected HTTP status 201"
    exit 1
fi
