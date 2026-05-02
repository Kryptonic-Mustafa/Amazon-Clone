import os
import re

def global_strictness_override():
    print("🚀 Initiating Global TypeScript Strictness Override...")
    
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
                    
                    # 1. Strip the old, half-measure null checks I gave you
                    content = content.replace("p.stock_qty !== null && ", "")
                    
                    # 2. Globally wrap ALL stock_qty math comparisons in a safe fallback
                    # Turns `p.stock_qty <= 20` into `(p.stock_qty ?? 0) <= 20`
                    content = re.sub(
                        r'([a-zA-Z0-9_]+)\.stock_qty\s*(<=|>=|<|>|===|!==|==|!=)\s*(\d+)', 
                        r'(\1.stock_qty ?? 0) \2 \3', 
                        content
                    )

                    # 3. Pre-emptively do the exact same thing for discount_percent 
                    # so it doesn't crash the build on the shop pages
                    content = re.sub(
                        r'([a-zA-Z0-9_]+)\.discount_percent\s*(<=|>=|<|>|===|!==|==|!=)\s*(\d+)', 
                        r'(\1.discount_percent ?? 0) \2 \3', 
                        content
                    )

                    if content != original:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(f"✅ Bulletproofed: {filepath}")
                        fixed_count += 1
                        
    print(f"\n🎉 DONE! {fixed_count} files heavily armored against null-math compiler errors.")

if __name__ == "__main__":
    global_strictness_override()