#!/bin/bash
# TC-CATEGORY-009: Validate Programming category exists

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_PROGRAMMING=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        has_it = any(
            item.get('slug') == 'programming' and
            item.get('name_ja') == 'プログラミング' and
            item.get('name_en') == 'Programming'
            for item in data
        )
        print('true' if has_it else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_PROGRAMMING" != "true" ]; then
    echo "✗ Programming category not found or incorrect"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Programming category exists with correct data"
exit 0
