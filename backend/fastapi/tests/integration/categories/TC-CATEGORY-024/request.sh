#!/bin/bash
# TC-CATEGORY-024: Large dataset performance (100+ categories)

# NOTE: This test assumes setup.sql creates 100+ categories for testing
# Current setup only has 5 categories, so this is a placeholder

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
