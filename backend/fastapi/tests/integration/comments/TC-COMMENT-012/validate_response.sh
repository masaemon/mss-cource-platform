#!/bin/bash
# TC-COMMENT-012: Validate successful comment creation

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:201" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 201 confirmed"
    
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
required_fields = ['id', 'course_id', 'user_id', 'content', 'is_instructor_reply']
for field in required_fields:
    if field not in data:
        print(f"✗ Missing field: {field}")
        exit(1)
print("✓ Comment created successfully")
PYEOF
else
    echo "✗ Expected HTTP status 201"
    exit 1
fi
