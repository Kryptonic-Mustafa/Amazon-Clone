import os, re

# Files that need the AdminLoader import + replacement
files_to_fix = {
    "app/admin/reviews/page.tsx": {
        "old": 'if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading reviews...</div>;',
        "new": 'if (loading) return <AdminLoader text="Loading Reviews..." />;',
    },
    "app/admin/users/customers/page.tsx": {
        "old": 'if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading customers...</div>;',
        "new": 'if (loading) return <AdminLoader text="Loading Customers..." />;',
    },
    "app/admin/orders/page.tsx": {
        "old": 'if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading orders...</div>;',
        "new": 'if (loading) return <AdminLoader text="Loading Orders..." />;',
    },
    "app/admin/orders/[id]/page.tsx": {
        "old": 'if (loading) return <div className="p-8 text-center font-bold text-slate-500 min-h-screen flex items-center justify-center">Loading...</div>;',
        "new": 'if (loading) return <AdminLoader text="Loading Order Details..." />;',
    },
}

IMPORT_LINE = "import AdminLoader from '@/components/admin/AdminLoader';"

def fix_file(filepath, old_text, new_text):
    if not os.path.exists(filepath):
        print(f"SKIP (not found): {filepath}")
        return
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Add import if missing
    if IMPORT_LINE not in content:
        # Find last import line and add after it
        lines = content.split('\n')
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                last_import_idx = i
        lines.insert(last_import_idx + 1, IMPORT_LINE)
        content = '\n'.join(lines)
    
    # Replace loading text
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"FIXED: {filepath}")
    else:
        # Write anyway if import was added
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"IMPORT ADDED: {filepath}")

for filepath, data in files_to_fix.items():
    fix_file(filepath, data["old"], data["new"])

print("\nDone! All admin pages now use AdminLoader.")
