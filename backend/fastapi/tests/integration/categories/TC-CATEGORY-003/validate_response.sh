#!/bin/bash
# TC-CATEGORY-003: Validate multilingual fields

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_MULTILINGUAL=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        if not isinstance(data, list) or len(data) == 0:
            print('false')
        else:
            # Check all categories have name_ja and name_en
            all_have_fields = all(
                'name_ja' in item and 'name_en' in item and
                item['name_ja'] and item['name_en']
                for item in data
            )
            print('true' if all_have_fields else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_MULTILINGUAL" != "true" ]; then
    echo "✗ Not all categories have name_ja and name_en fields"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ All categories have name_ja and name_en fields"
exit 0
