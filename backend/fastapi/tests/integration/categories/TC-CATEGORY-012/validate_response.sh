#!/bin/bash
# TC-CATEGORY-012: Validate slug uniqueness

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

UNIQUE_SLUGS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        slugs = [item.get('slug') for item in data if 'slug' in item]
        is_unique = len(slugs) == len(set(slugs))
        print('true' if is_unique else 'false')
except Exception as e:
    print('false')
")

if [ "$UNIQUE_SLUGS" != "true" ]; then
    echo "✗ Slugs are not unique"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ All slugs are unique"
exit 0
