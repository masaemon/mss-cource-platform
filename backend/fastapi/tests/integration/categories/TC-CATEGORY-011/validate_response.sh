#!/bin/bash
# TC-CATEGORY-011: Validate Business category exists

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_BUSINESS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        has_it = any(
            item.get('slug') == 'business' and
            item.get('name_ja') == 'ビジネス' and
            item.get('name_en') == 'Business'
            for item in data
        )
        print('true' if has_it else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_BUSINESS" != "true" ]; then
    echo "✗ Business category not found or incorrect"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Business category exists with correct data"
exit 0
