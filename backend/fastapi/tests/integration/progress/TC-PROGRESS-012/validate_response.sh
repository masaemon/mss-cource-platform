#!/bin/bash
# TC-PROGRESS-012: Validate course progress response

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 200 confirmed"
    
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
required_fields = ['course_id', 'total_videos', 'completed_videos', 'progress_percentage', 'videos']
for field in required_fields:
    if field not in data:
        print(f"✗ Missing field: {field}")
        exit(1)
if not isinstance(data.get('videos'), list):
    print("✗ videos is not an array")
    exit(1)
print("✓ All required fields present")
PYEOF
else
    echo "✗ Expected HTTP status 200"
    exit 1
fi
