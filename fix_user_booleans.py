import os

def fix_user_active_status():
    print("🚀 Swapping booleans to integers for the Users API...")
    
    # We target the specific directories handling the 'users' table
    target_dirs = [
        "app/api/admin/users/customers",
        "app/api/admin/users"
    ]
    
    fixed_count = 0
    
    for directory in target_dirs:
        if os.path.exists(directory):
            for root, _, files in os.walk(directory):
                for file in files:
                    if file.endswith((".ts", ".tsx")):
                        filepath = os.path.join(root, file)
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()

                        original = content
                        
                        # Swap strict booleans to database integers
                        content = content.replace("is_active: true", "is_active: 1")
                        content = content.replace("is_active: false", "is_active: 0")

                        if content != original:
                            with open(filepath, "w", encoding="utf-8") as f:
                                f.write(content)
                            print(f"✅ Patched: {filepath}")
                            fixed_count += 1
                            
    print(f"\n🎉 DONE! {fixed_count} files fixed.")

if __name__ == "__main__":
    fix_user_active_status()