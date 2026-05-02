import os
import re

def wrap_with_suspense():
    print("🚀 Scanning for useSearchParams to wrap in Suspense...")
    target_dir = "app"
    fixed_count = 0
    
    if os.path.exists(target_dir):
        for root, _, files in os.walk(target_dir):
            for file in files:
                if file.endswith(".tsx"):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Find files using useSearchParams that are exported as default
                    if "useSearchParams" in content and "Suspense" not in content and "export default function" in content:
                        match = re.search(r'export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(', content)
                        if match:
                            comp_name = match.group(1)
                            
                            # 1. Rename the original component to 'ComponentContent'
                            content = content.replace(match.group(0), f"function {comp_name}Content(")
                            
                            # 2. Append the new Suspense wrapper at the bottom
                            wrapper = f"\n\nimport React, {{ Suspense }} from 'react';\n"
                            wrapper += f"export default function {comp_name}() {{\n"
                            wrapper += f"  return (\n"
                            wrapper += f"    <Suspense fallback={{<div className=\"p-8 text-center text-blue-600 font-bold\">Loading...</div>}}>\n"
                            wrapper += f"      <{comp_name}Content />\n"
                            wrapper += f"    </Suspense>\n"
                            wrapper += f"  );\n"
                            wrapper += f"}}\n"
                            
                            content += wrapper

                            with open(filepath, "w", encoding="utf-8") as f:
                                f.write(content)
                            print(f"✅ Wrapped {comp_name} in Suspense: {filepath}")
                            fixed_count += 1
                            
    print(f"\n🎉 DONE! {fixed_count} files safely wrapped for Next.js prerendering.")

if __name__ == "__main__":
    wrap_with_suspense()