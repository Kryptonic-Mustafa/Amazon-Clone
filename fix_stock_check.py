import os

def fix_null_stock():
    filepath = "app/api/admin/notifications/route.ts"
    print("🚀 Fixing 'possibly null' TypeScript error...")
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Safely wrap the stock_qty in a null check
        new_content = content.replace(
            "if (p.stock_qty <= 5) {", 
            "if (p.stock_qty !== null && p.stock_qty <= 5) {"
        )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f"✅ Successfully patched null check in {filepath}")
    else:
        print(f"❌ Could not find {filepath}. Make sure you are in the root directory.")

if __name__ == "__main__":
    fix_null_stock()