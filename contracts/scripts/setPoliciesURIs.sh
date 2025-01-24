#!/bin/bash

# Check if at least one input file is provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <input_policies_file1> [input_policies_file2 ...]"
    exit 1
fi

# Process each input file
for INPUT_FILE in "$@"; do
    # Validate file extension
    if [[ ! "$INPUT_FILE" =~ \.json$ ]]; then
        echo "Error: Input file $INPUT_FILE must have a .json extension"
        continue
    fi

    echo "Processing $INPUT_FILE..."

    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    INPUT_FILE_WITHOUT_EXTENSION="${INPUT_FILE%.json}"
    POLICIES_DIR="$SCRIPT_DIR/../$INPUT_FILE_WITHOUT_EXTENSION"
    HASHES_FILE=$(mktemp)

    echo "Creating $POLICIES_DIR directory..."
    mkdir -p $POLICIES_DIR

    # Step 1: Create individual policy files and collect their hashes
    echo "Creating individual policy files..."
    echo "{" > "$HASHES_FILE"
    first=true

    jq -c '.[]' "$INPUT_FILE" | while read -r policy; do
        name=$(echo "$policy" | jq -r '.name' | tr ' ' '-')
        court=$(echo "$policy" | jq -r '.court')
        policy_filepath="$POLICIES_DIR/${name}-Policy.json"

        # Remove the uri field if it exists and save to a temporary file
        echo "$policy" | jq 'del(.uri)' > "$policy_filepath"
        
        # Get IPFS hash
        ipfs_hash=$(ipfs add -Q "$policy_filepath")
        if [ -n "$ipfs_hash" ]; then
            echo "Preparing $name Court ($court): ${name}-Policy.json"
            # Add comma for all but the first entry
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$HASHES_FILE"
            fi
            # Store the hash with court as key
            echo "\"$court\": \"$ipfs_hash\"" >> "$HASHES_FILE"
        else
            echo "Failed to get IPFS hash for ${name}-Policy.json"
            rm "$HASHES_FILE"
            continue 2
        fi
    done

    echo "}" >> "$HASHES_FILE"

    # Step 2: Update the input file with URIs
    echo "Updating URIs in $INPUT_FILE..."
    jq --slurpfile hashes "$HASHES_FILE" '
        map(. + {uri: ("/ipfs/" + ($hashes[0][.court | tostring]))})
    ' "$INPUT_FILE" > "${INPUT_FILE}.tmp" && mv "${INPUT_FILE}.tmp" "$INPUT_FILE"

    rm "$HASHES_FILE"
    echo "Done! URIs updated in $INPUT_FILE"
    echo "----------------------------------------"
done 