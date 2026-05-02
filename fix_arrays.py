import os
import re

def fix_implicit_arrays():
    print("🚀 Sweeping for implicit 'any[]' array types...")
    target_dir = "app"
    fixed_count = 0
    
    if os.path.exists(target_dir):
        for root, _, files in os.walk(target_dir):
            for file in files:
                if file.endswith((".ts", ".tsx")):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()

                    original = content
                    
                    # Target: let items = []; -> let items: any[] = [];
                    content = re.sub(r'let\s+([a-zA-Z0-9_]+)\s*=\s*\[\];', r'let \1: any[] = [];', content)
                    
                    # Target: const items = []; -> const items: any[] = [];
                    content = re.sub(r'const\s+([a-zA-Z0-9_]+)\s*=\s*\[\];', r'const \1: any[] = [];', content)

                    if content != original:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(f"✅ Typed arrays in: {filepath}")
                        fixed_count += 1
                        
    print(f"\n🎉 DONE! {fixed_count} files fixed to prevent implicit any[] array errors.")

if __name__ == "__main__":
    fix_implicit_arrays()