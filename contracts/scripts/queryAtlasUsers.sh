#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# GraphQL endpoint
ENDPOINT="https://atlas.production.kleros.link/graphql"
# ENDPOINT="https://atlas.staging.kleros.link/graphql"

# Check if authorization token is set
if [ -z "$AUTH_TOKEN" ]; then
    echo "Error: AUTH_TOKEN environment variable is not set"
    echo "Usage: AUTH_TOKEN='your-token-here' ./query_users.sh"
    exit 1
fi

# shellcheck disable=SC1091
source "$SCRIPT_DIR/queryAtlasUsers.env"

if [ -z "${LAWYERS_EMAILS+x}" ] || [ "${#LAWYERS_EMAILS[@]}" -eq 0 ]; then
    echo "Error: LAWYERS_EMAILS is not defined or empty in the environment file."
    exit 1
fi

if [ -z "${PRACTITIONERS_EMAILS+x}" ] || [ "${#PRACTITIONERS_EMAILS[@]}" -eq 0 ]; then
    echo "Error: PRACTITIONERS_EMAILS is not defined or empty in the environment file."
    exit 1
fi

# GraphQL query
QUERY='query users {
  usersThroughAdmin {
    email
    address
    isEmailVerified
  }
}'

# Make the GraphQL request
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"query\":$(echo "$QUERY" | jq -Rs .)}")

# Check if curl was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to query the endpoint"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    echo "Install with: sudo apt-get install jq"
    exit 1
fi

# DEBUG
# echo "$RESPONSE" | jq .

function filterUsers() {
    local ROLE=$1
    shift
    local EMAILS=("$@")
    local EMAIL_FILTER=$(printf '%s\n' "${EMAILS[@]}" | jq -R . | jq -s .)
    local FILTERED_RESULT=$(echo "$RESPONSE" | jq --argjson allowed "$EMAIL_FILTER" '
        .data.usersThroughAdmin |= map(select(.email as $email | $allowed | index($email)))
    ')
    echo "$FILTERED_RESULT" | jq '{"'"$ROLE"'": .data.usersThroughAdmin}'
}

filterUsers "lawyers" "${LAWYERS_EMAILS[@]}"
filterUsers "practitioners" "${PRACTITIONERS_EMAILS[@]}"
