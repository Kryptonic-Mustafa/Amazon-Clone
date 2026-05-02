import os
import re

def fix_password_schema_mismatch():
    print("🚀 Fixing 'password' vs 'password_hash' schema mismatch...")
    
    filepath = "app/api/admin/users/customers/route.ts"
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        original = content
        
        # Replace the incorrect 'password:' key with the correct 'password_hash:' key
        content = re.sub(r'\bpassword\s*:\s*\'AdminCreatedPassword123!\'', "password_hash: 'AdminCreatedPassword123!'", content)
        
        # Just in case it's mapped dynamically instead
        content = re.sub(r'\bpassword\s*:\s*data\.password', "password_hash: data.password", content)

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Patched: {filepath} (Swapped 'password' to 'password_hash')")
        else:
            print(f"⚠️ Could not find the exact string to replace, please check {filepath} manually.")
                            
    print("\n🎉 DONE!")

if __name__ == "__main__":
    fix_password_schema_mismatch()