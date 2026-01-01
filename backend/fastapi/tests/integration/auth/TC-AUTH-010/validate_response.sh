#!/bin/bash
# TC-AUTH-010: Validate duplicate email error

RESPONSE_FILE="actual_response.json"

# Check HTTP status
if ! grep -q "HTTP_STATUS:400" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 400"
    exit 1
fi

# Extract error detail (remove HTTP_STATUS line first)
ERROR_DETAIL=$(python3 -c "
import json
with open('$RESPONSE_FILE', 'r') as f:
    content = f.read()
    # Remove HTTP_STATUS line
    json_content = content.split('HTTP_STATUS:')[0].strip()
    data = json.loads(json_content)
    print(data.get('detail', ''))
" 2>/dev/null)

if echo "$ERROR_DETAIL" | grep -qi "already registered\|already exists"; then
    echo "✓ HTTP status 400 confirmed"
    echo "✓ Duplicate email error confirmed"
    exit 0
else
    echo "✗ Expected duplicate email error message, got: $ERROR_DETAIL"
    exit 1
fi
