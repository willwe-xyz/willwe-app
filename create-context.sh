#!/bin/bash

# Create the context-files directory if it doesn't exist
mkdir -p context-files

# Remove the existing frontend-context.tsx if it exists
rm -f context-files/frontend-context.tsx

# First add package.json contents to the context file
echo "// File: package.json" >> context-files/frontend-context.tsx
if [ -f "package.json" ]; then
    cat package.json >> context-files/frontend-context.tsx
    echo -e "\n\n" >> context-files/frontend-context.tsx
else
    echo "// Warning: package.json not found" >> context-files/frontend-context.tsx
    echo -e "\n\n" >> context-files/frontend-context.tsx
fi

# Add configuration files if they exist
for config_file in "next.config.js" "tsconfig.json" ".eslintrc"; do
    if [ -f "$config_file" ]; then
        echo "// File: $config_file" >> context-files/frontend-context.tsx
        cat "$config_file" >> context-files/frontend-context.tsx
        echo -e "\n\n" >> context-files/frontend-context.tsx
    fi
done

# Step 1: Full files for core behavior directories (pages, components, config, hooks)
find ./pages ./components ./config ./hooks \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) | \
while read -r file; do
    # Append full file content
    echo "// File: $file" >> context-files/frontend-context.tsx
    cat "$file" >> context-files/frontend-context.tsx
    echo -e "\n\n" >> context-files/frontend-context.tsx
done

# Step 2: Collect types for imported libraries only
declare -A types_to_import
find . \( -path './lib/*' -o -path './utils/*' -o -path './const/*' -o -path './types/*' -o -path './styles/*' \) \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' \) \
     -not -path '*/node_modules/*' | \
while read -r file; do
    # Extract imported types with their library paths
    while read -r type_name lib_path; do
        types_to_import["$type_name"]=$lib_path
    done < <(grep -Po 'import\s+\{\s*\K(\w+)(?=.*?from\s+"(@?[^"]+)")' "$file" | awk '{print $1, $2}')
done

# Step 3: Type and utility extraction from other project files
find . \( -path './lib/*' -o -path './utils/*' -o -path './const/*' -o -path './types/*' -o -path './styles/*' \) \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' \) | \
while read -r file; do
    echo "// File: $file" >> context-files/frontend-context.tsx
    
    # Extract function signatures, utility functions, and JSDoc comments only
    awk '/\/\*\*/,/\*\// {print} /^export function|^export const|^export async function|^async function|^function/ {print}' "$file" >> context-files/frontend-context.tsx
    echo -e "\n\n" >> context-files/frontend-context.tsx
done

# Step 4: Locate and copy relevant type definitions from node_modules
for type_name in "${!types_to_import[@]}"; do
    lib_path="${types_to_import[$type_name]}"
    
    # Look for the primary .d.ts file in the library package
    find "./node_modules/$lib_path" -type f -name "*.d.ts" | \
    while read -r type_file; do
        # Check if the type is defined in the file
        if grep -qw "$type_name" "$type_file"; then
            echo "// File: $type_file (Type: $type_name)" >> context-files/frontend-context.tsx
            
            # Try to match complex type definitions, including multiline interfaces/types
            awk "/export (type|interface) $type_name /,/^}/" "$type_file" >> context-files/frontend-context.tsx
            
            # Additional check for single-line types, as some definitions might be inline
            grep -Pzo "(export\s+(const|type|interface)\s+$type_name\s+=.*?;)" "$type_file" >> context-files/frontend-context.tsx
            
            echo -e "\n\n" >> context-files/frontend-context.tsx
        fi
    done
done

# Remove all files in context-files except frontend-context.tsx
find context-files -type f ! -name 'frontend-context.tsx' -delete

echo "Context file created at context-files/frontend-context.tsx"
