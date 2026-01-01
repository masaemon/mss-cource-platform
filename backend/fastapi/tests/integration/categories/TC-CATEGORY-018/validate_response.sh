#!/bin/bash
# TC-CATEGORY-018: Validate JSON structure

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

VALID_JSON=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        # Check it's a list and each item is a dict with expected fields
        if not isinstance(data, list):
            print('false')
        else:
            all_valid = all(
                isinstance(item, dict) and
                'id' in item and
                'name_ja' in item and
                'name_en' in item and
                'slug' in item
                for item in data
            )
            print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$VALID_JSON" != "true" ]; then
    echo "✗ Invalid JSON structure"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Valid JSON structure with expected fields"
exit 0
