import os

# Configuration
OUTPUT_FILE = "project_scope.txt"

# Folders to completely ignore
IGNORE_DIRS = {
    '.git', 'node_modules', '.next', '__pycache__', 
    'build', 'out', 'coverage', '.vercel'
}

# File extensions to ignore (images, fonts, binaries, etc.)
IGNORE_EXTS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
    '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.wav',
    '.sqlite', '.db', '.exe', '.dll', '.pyc', '.tsbuildinfo', 
    '.ttf', '.woff', '.woff2'
}

def generate_tree(dir_path, prefix=""):
    tree_str = ""
    try:
        entries = os.listdir(dir_path)
    except PermissionError:
        return ""

    # Sort entries: directories first, then files
    entries.sort(key=lambda x: (not os.path.isdir(os.path.join(dir_path, x)), x.lower()))

    # Filter out ignored directories
    entries = [e for e in entries if not (os.path.isdir(os.path.join(dir_path, e)) and e in IGNORE_DIRS)]

    for i, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        is_last = (i == len(entries) - 1)
        
        if os.path.isdir(path):
            tree_str += f"{prefix}📂 {entry}/\n"
            extension = "    " if is_last else "│   "
            tree_str += generate_tree(path, prefix + extension)
        else:
            tree_str += f"{prefix}📄 {entry}\n"
            
    return tree_str

def extract_contents(start_path):
    content_str = ""
    for root, dirs, files in os.walk(start_path):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            # Skip based on extension
            if any(file.lower().endswith(ext) for ext in IGNORE_EXTS):
                continue
                
            # Skip the output file itself so we don't cause an infinite loop
            if file == OUTPUT_FILE or file == "project_scope.py":
                continue
                
            file_path = os.path.join(root, file)
            # Use forward slashes for clean paths
            rel_path = os.path.relpath(file_path, start_path).replace("\\", "/")
            
            try:
                # Attempt to read as text
                with open(file_path, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                    
                content_str += f"\n{'='*70}\n"
                content_str += f"--- FILE: {rel_path} ---\n"
                content_str += f"{'='*70}\n\n"
                content_str += file_content + "\n"
            except UnicodeDecodeError:
                # Silently skip binary files that slipped through the extension check
                pass
            except Exception as e:
                content_str += f"\n[Could not read {rel_path}: {str(e)}]\n"
                
    return content_str

def main():
    print(f"🚀 Generating {OUTPUT_FILE}...")
    
    # 1. Generate Tree
    print("⏳ Building directory tree...")
    tree = "📂 ./\n" + generate_tree(".")
    
    # 2. Extract Contents
    print("⏳ Extracting file contents...")
    contents = extract_contents(".")
    
    # 3. Write to Output
    print("⏳ Writing to file...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("==================================================\n")
        f.write("PROJECT DIRECTORY STRUCTURE\n")
        f.write("==================================================\n\n")
        f.write(tree)
        f.write("\n\n")
        f.write("==================================================\n")
        f.write("FILE CONTENTS\n")
        f.write("==================================================\n\n")
        f.write(contents)
        
    print(f"✅ Successfully created {OUTPUT_FILE}!")
    print(f"You can now upload or paste the contents of {OUTPUT_FILE} here.")

if __name__ == "__main__":
    main()