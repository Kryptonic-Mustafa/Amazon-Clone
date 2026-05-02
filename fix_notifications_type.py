import os

def fix_notification_type():
    filepath = "app/api/admin/notifications/route.ts"
    print("🚀 Fixing implicit 'any[]' TypeScript error...")
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Safely replace the untyped array with a typed array
        new_content = content.replace(
            "const notifications = [];", 
            "const notifications: any[] = [];"
        )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f"✅ Successfully typed 'notifications' in {filepath}")
    else:
        print(f"❌ Could not find {filepath}. Make sure you are in the root directory.")

if __name__ == "__main__":
    fix_notification_type()