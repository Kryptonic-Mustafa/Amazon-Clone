import os
import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix Recharts formatter (value: number) -> (value: any)
    content = re.sub(r'formatter=\{\(value:\s*number\)', 'formatter={(value: any)', content)
    
    # 2. Fix .map(item => to .map((item: any) =>
    # Only if it doesn't already have a type
    content = re.sub(r'\.map\((?!async\s)(\w+) =>', r'.map((\1: any) =>', content)
    
    # 3. Fix .filter(item => to .filter((item: any) =>
    content = re.sub(r'\.filter\((?!async\s)(\w+) =>', r'.filter((\1: any) =>', content)
    
    # 4. Fix .find(item => to .find((item: any) =>
    content = re.sub(r'\.find\((?!async\s)(\w+) =>', r'.find((\1: any) =>', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    dirs_to_patch = ['app', 'components']
    for base_dir in dirs_to_patch:
        if not os.path.exists(base_dir): continue
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    patch_file(os.path.join(root, file))
    print("Global patching complete.")

if __name__ == "__main__":
    main()
