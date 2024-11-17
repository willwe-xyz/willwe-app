#!/bin/bash

# Create temp directory for processing
mkdir -p .context-temp

# Output file
CONTEXT_FILE=".context-temp/frontend-context.tsx"

# Colors for logging
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[Context Generator]${NC} $1"
}

error() {
    echo -e "${RED}[Error]${NC} $1"
}

# Smart content appender that removes duplicate exports and combines similar declarations
append_smart() {
    local file=$1

    # Skip if file doesn't exist
    [[ ! -f "$file" ]] && return

    echo "// File: $file" >> "$CONTEXT_FILE"

    # Process file content to remove duplicates and combine similar declarations
    awk '
    {
        if ($0 ~ /^export/) {
            match($0, /export[[:space:]]+(type|interface|const|function|class)[[:space:]]+([a-zA-Z0-9_]+)/)
            if (RSTART) {
                name = substr($0, RSTART+length(RLENGTH), RLENGTH)
                if (!(name in seen)) {
                    seen[name] = 1
                    print $0
                }
            } else {
                print $0
            }
        } else {
            print $0
        }
    }' "$file" >> "$CONTEXT_FILE"

    echo -e "\n\n" >> "$CONTEXT_FILE"
}

# Initialize context file with XML wrapper
{
    echo "<documents><document index=\"1\">"
    echo "<source>frontend-context.tsx</source>"
    echo "<document_content>"
} > "$CONTEXT_FILE"

# Core configuration files
log "Processing configuration files..."
for config in package.json next.config.js tsconfig.json; do
    [[ -f $config ]] && append_smart "$config"
done

# Process directories recursively, including all files in components/Node/
DIRECTORIES=("pages" "components" "config" "hooks" "contexts" "utils" "types" "const")

for dir in "${DIRECTORIES[@]}"; do
    [[ ! -d "./$dir" ]] && continue
    
    log "Processing $dir directory..."
    
    # Find all TypeScript/JavaScript files
    find "./$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.next/*" \
        ! -name "*.test.*" \
        ! -name "*.spec.*" | \
    while read -r file; do
        append_smart "$file"
    done
done

# Smart type extraction - avoid duplicates
log "Extracting types and utilities..."
{
    echo -e "\n// Extracted Types and Utilities\n"
    
    # Process type files with deduplication
    find . \( -path './types/*' -o -path './utils/*' \) \
        -type f \
        \( -name '*.ts' -o -name '*.tsx' \) \
        ! -path '*/node_modules/*' | \
    while read -r file; do
        awk '
        BEGIN { in_block = 0 }
        /^export (type|interface|class|function|const)/ {
            if (!seen[$0]++) {
                in_block = 1
                print "\n" $0
            }
        }
        in_block && /^}/ {
            print $0
            in_block = 0
        }
        in_block { print $0 }
        ' "$file" >> "$CONTEXT_FILE"
    done
}

# Close XML wrapper
{
    echo "</document_content>"
    echo "</document></documents>"
} >> "$CONTEXT_FILE"

# Move to final location and cleanup
mv "$CONTEXT_FILE" "./frontend-context.tsx"
rm -rf .context-temp

log "Context generation complete!"

# Output statistics
size_kb=$(du -k frontend-context.tsx | cut -f1)
log "Generated context file size: ${size_kb}KB"
