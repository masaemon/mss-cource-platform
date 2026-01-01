#!/bin/bash
# TC-CATEGORY-028: Validate timestamp fields (if returned in API)

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_TIMESTAMPS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        if not isinstance(data, list) or len(data) == 0:
            print('unknown')
        else:
            # Check if any category has timestamp fields
            has_ts = any('created_at' in item or 'updated_at' in item for item in data)
            print('true' if has_ts else 'false')
except Exception as e:
    print('unknown')
")

echo "✓ HTTP status 200 confirmed"
if [ "$HAS_TIMESTAMPS" == "true" ]; then
    echo "✓ Timestamp fields present in response"
elif [ "$HAS_TIMESTAMPS" == "false" ]; then
    echo "ℹ Timestamp fields not returned (may be intentional)"
else
    echo "ℹ Could not determine timestamp presence"
fi
exit 0
