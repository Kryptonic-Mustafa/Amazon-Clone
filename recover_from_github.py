import urllib.request
import urllib.error

# The files you want to recover from your GitHub repository
FILES_TO_RECOVER = {
    "app/page.tsx": "Original_Home_Backup.tsx",
    "components/shop/HeroSection.tsx": "Original_Hero_Backup.tsx",
    "components/shop/Header.tsx": "Original_Header_Backup.tsx",
    "app/(shop)/layout.tsx": "Original_ShopLayout_Backup.tsx"
}

def download_from_github(repo_path, save_as):
    # Try the 'main' branch first, then fallback to 'master' if needed
    url_main = f"https://raw.githubusercontent.com/Kryptonic-Mustafa/Amazon-Clone/main/{repo_path}"
    url_master = f"https://raw.githubusercontent.com/Kryptonic-Mustafa/Amazon-Clone/master/{repo_path}"
    
    try:
        urllib.request.urlretrieve(url_main, save_as)
        print(f"✅ Found on 'main' branch: Saved to {save_as}")
    except urllib.error.HTTPError:
        try:
            urllib.request.urlretrieve(url_master, save_as)
            print(f"✅ Found on 'master' branch: Saved to {save_as}")
        except Exception:
            print(f"❌ Could not find {repo_path} on GitHub. (Check if the file path is correct).")

if __name__ == "__main__":
    print("Fetching your original UI files directly from your GitHub...\n")
    
    for repo_path, local_name in FILES_TO_RECOVER.items():
        download_from_github(repo_path, local_name)
        
    print("\n🎉 Recovery complete! Your original files are now sitting in your main folder.")
    print("You can now safely open 'Original_Home_Backup.tsx' and copy your old UI back into 'app/page.tsx'.")