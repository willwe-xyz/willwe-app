#!/bin/bash

# Create the context-files directory if it doesn't exist
mkdir -p context-files

# Remove the existing frontend-context.tsx if it exists
rm -f context-files/frontend-context.tsx

# Function to append content to the context file with a section header
append_file_content() {
    local file_path=$1
    local context_file=$2

    echo "// File: $file_path" >> "$context_file"
    cat "$file_path" >> "$context_file"
    echo -e "\n\n" >> "$context_file"
}

# Append package.json contents to the context file
context_file="context-files/frontend-context.tsx"
echo "// Consolidated context file for LLM" > "$context_file"

if [ -f "package.json" ]; then
    append_file_content "package.json" "$context_file"
else
    echo "// Warning: package.json not found" >> "$context_file"
    echo -e "\n\n" >> "$context_file"
fi

# Add core configuration files if they exist
config_files=("next.config.js" "tsconfig.json" ".eslintrc")
for config_file in "${config_files[@]}"; do
    if [ -f "$config_file" ]; then
        append_file_content "$config_file" "$context_file"
    fi
done

# Append full file content from core directories (pages, components, config, hooks, contracts-source)
find ./pages ./components ./config ./hooks ./contracts-source ./contexts ./lib ./utils ./types ./const \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) | \
while read -r file; do
    append_file_content "$file" "$context_file"
done

# Extract and append only type definitions and utility functions from lib, utils, const, types, styles directories
declare -A types_to_import
find . \( -path './types/*' -o -path './styles/*' \) \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' \) \
     -not -path '*/node_modules/*' | \
while read -r file; do
    echo "// File: $file (Extracted Types and Utilities)" >> "$context_file"
    
    # Extract function signatures, utility functions, and JSDoc comments only
    awk '/\/\*\*/,/\*\// {print} /^export function|^export const|^export async function|^async function|^function/ {print}' "$file" >> "$context_file"
    echo -e "\n\n" >> "$context_file"

    # Extract types and interfaces
    grep -Pzo "(?s)^export\s+(type|interface)\s+\w+.*?\{.*?\n\}" "$file" >> "$context_file" || true
    echo -e "\n\n" >> "$context_file"
done

# Locate and copy relevant type definitions from node_modules
for type_name in "${!types_to_import[@]}"; do
    lib_path="${types_to_import[$type_name]}"
    
    # Search for .d.ts files in node_modules with depth control
    find "./node_modules/$lib_path" -type f -name "*.d.ts" -maxdepth 3 | \
    while read -r type_file; do
        if grep -qw "$type_name" "$type_file"; then
            echo "// File: $type_file (Type: $type_name)" >> "$context_file"
            awk "/export (type|interface) $type_name /,/^}/" "$type_file" >> "$context_file"
            grep -Pzo "(export\s+(const|type|interface)\s+$type_name\s+=.*?;)" "$type_file" >> "$context_file"
            echo -e "\n\n" >> "$context_file"
        fi
    done
done

# Cleanup: Remove all files in context-files except frontend-context.tsx
find context-files -type f ! -name 'frontend-context.tsx' -delete

echo "Context file created at $context_file"
