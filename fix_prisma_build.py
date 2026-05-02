import os

def fix_package_json():
    filepath = "package.json"
    print("🚀 Updating package.json to fix Vercel Prisma caching...")
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Update the build script to generate the Prisma client first
        # and add a postinstall hook for extra safety
        new_content = content.replace(
            '"build": "next build",', 
            '"postinstall": "prisma generate",\n    "build": "prisma generate && next build",'
        )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f"✅ Successfully updated build scripts in {filepath}")
    else:
        print(f"❌ Could not find {filepath}. Make sure you are in the root directory.")

if __name__ == "__main__":
    fix_package_json()