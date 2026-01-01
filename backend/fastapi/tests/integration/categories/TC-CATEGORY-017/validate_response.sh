#!/bin/bash
# TC-CATEGORY-017: Validate slug format (lowercase, hyphens)

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

VALID_SLUGS=$(python3 -c "
import json
import re
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        # Check slug format: lowercase letters, numbers, hyphens only
        slug_pattern = re.compile(r'^[a-z0-9\-]+$')
        all_valid = all(
            'slug' in item and slug_pattern.match(item['slug'])
            for item in data
        )
        print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$VALID_SLUGS" != "true" ]; then
    echo "✗ Some slugs have invalid format"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ All slugs have valid SEO-friendly format"
exit 0
