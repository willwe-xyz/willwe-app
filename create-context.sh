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

# Find relevant files and concatenate their contents
find . \( -path './pages/*' -o -path './config/*' -o -path './lib/*' -o -path './components/*' -o -path './utils/*' -o -path './hooks/*' -o -path './const/*' -o -path './types/*' -o -path './styles/*' \) \
     -type f \
     \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.css' \) \
     -not -path '*/node_modules/*' \
     -not -path '*/deprecated/*' | \
while read -r file; do
    echo "// File: $file" >> context-files/frontend-context.tsx
    if grep -q "export const ABIs: ABIKP = {" "$file"; then
        # If the file contains ABI definitions, remove whitespace
        sed -n '/export const ABIs: ABIKP = {/,/};/p' "$file" | tr -d '[:space:]' >> context-files/frontend-context.tsx
    else
        # Otherwise, just append the file content
        cat "$file" >> context-files/frontend-context.tsx
    fi
    echo -e "\n\n" >> context-files/frontend-context.tsx
done

# Remove all files in context-files except frontend-context.tsx
find context-files -type f ! -name 'frontend-context.tsx' -delete

echo "Context file created at context-files/frontend-context.tsx"