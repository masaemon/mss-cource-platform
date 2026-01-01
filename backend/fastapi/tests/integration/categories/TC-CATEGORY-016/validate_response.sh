#!/bin/bash
# TC-CATEGORY-016: Validate fields for breadcrumb

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_BREADCRUMB_FIELDS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        # Check all categories have slug and name for breadcrumb
        all_valid = all(
            'slug' in item and item['slug'] and
            ('name_ja' in item or 'name_en' in item)
            for item in data
        )
        print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_BREADCRUMB_FIELDS" != "true" ]; then
    echo "✗ Categories missing fields for breadcrumb"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Categories have fields for breadcrumb navigation"
exit 0
