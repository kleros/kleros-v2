#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

mkdir -p $SCRIPT_DIR/../src/types

# Docs: https://supabase.com/docs/guides/api/rest/generating-types#generating-types-using-supabase-cli
supabase=$SCRIPT_DIR/../../node_modules/supabase/bin/supabase
$supabase gen types typescript --project-id elokscrfhzodpgvaixfd --schema public > $SCRIPT_DIR/../src/types/supabase-notification.ts
$supabase gen types typescript --project-id pyyfdntuqbsfquzzatkz --schema public > $SCRIPT_DIR/../src/types/supabase-datalake.ts
