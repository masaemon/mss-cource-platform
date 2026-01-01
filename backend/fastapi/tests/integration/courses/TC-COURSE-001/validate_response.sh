#!/bin/bash
# TC-COURSE-001: Validate public courses response structure

RESPONSE_FILE="actual_response.json"

# Validate response structure
DATA=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('data', 'MISSING'))" 2>/dev/null)
TOTAL=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('total', 'MISSING'))" 2>/dev/null)
PAGE=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('page', 'MISSING'))" 2>/dev/null)
LIMIT=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('limit', 'MISSING'))" 2>/dev/null)

if [ "$DATA" = "MISSING" ] || [ "$TOTAL" = "MISSING" ] || [ "$PAGE" = "MISSING" ] || [ "$LIMIT" = "MISSING" ]; then
    echo "✗ Response missing required fields"
    exit 1
fi

# Check data is an array
python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
if not isinstance(data.get('data'), list):
    print("✗ data field is not an array")
    exit(1)
if data.get('total', 0) < 3:
    print(f"✗ Expected total >= 3, got {data.get('total')}")
    exit(1)
if data.get('page') != 1:
    print(f"✗ Expected page = 1, got {data.get('page')}")
    exit(1)
if data.get('limit') != 20:
    print(f"✗ Expected limit = 20, got {data.get('limit')}")
    exit(1)
print("✓ All validations passed")
PYEOF
