#!/bin/bash
# TC-COURSE-015: Validate course detail response

RESPONSE_FILE="actual_response.json"

python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
required_fields = ['id', 'title_ja', 'category_id', 'instructor_id', 'is_published']
for field in required_fields:
    if field not in data:
        print(f"✗ Missing field: {field}")
        exit(1)
print("✓ All required fields present")
PYEOF
