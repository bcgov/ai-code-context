#!/usr/bin/env python3
"""
File:  create_llm_snapshot.py (v1.0)
Purpose:  Generates a comprehensive, LLM-friendly snapshot of the knowledge-weaver project.
It captures all relevant source code, documentation, and configuration, while excluding
unnecessary files, secrets, and large data/model directories to create a concise
and context-rich text file for AI analysis.
"""

import os
import pathlib
import datetime
import json
import tiktoken

# --- CONFIGURATION ---
PROJECT_ROOT = pathlib.Path(__file__).parent.resolve()
OUTPUT_FILE = PROJECT_ROOT / 'knowledge_weaver_snapshot.txt'
ALLOWED_EXTENSIONS = ['.py', '.md', '.json', '.toml', '.txt', '.sh', '.ipynb']

# Directories to completely exclude from the snapshot
EXCLUDE_DIR_NAMES = {
    'node_modules', '.git', 'dist', 'build', '.vscode', '__pycache__',
    '.pytest_cache', 'venv', '.venv', 'env'
}

# Specific relative paths to exclude (e.g., for large data or models)
EXCLUDE_RELATIVE_PATHS = {
    './data/',  # Exclude all data directories (raw, processed, etc.)
    './models/'  # Exclude all model artifact directories
}

# Specific files to always exclude
ALWAYS_EXCLUDE_FILES = {
    OUTPUT_FILE.name,
    'create_llm_snapshot.py',  # This script itself
    '.gitignore', '.DS_Store', '.env', 'poetry.lock', 'package-lock.json'
}

# --- END CONFIGURATION ---
FILE_SEPARATOR_START = '--- START OF FILE'
FILE_SEPARATOR_END = '--- END OF FILE'



def handle_notebook_file(file_path):
    """Reads a .ipynb file and returns its content as a clean JSON string."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            notebook_data = json.load(f)
        # You can add more advanced filtering here if needed
        # For now, just pretty-print the JSON
        return json.dumps(notebook_data, indent=2)
    except Exception as e:
        return f"Error reading notebook {file_path}: {e}"

def get_file_content(file_path):
    """Reads a file's content, with special handling for notebooks."""
    try:
        if file_path.suffix == '.ipynb':
            return handle_notebook_file(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        return f"Could not decode file: {file_path}. It may be a binary file."
    except Exception as e:
        return f"Error reading file {file_path}: {e}"

def should_exclude(path, root_path):
    """Determines if a file or directory should be excluded."""
    base_name = path.name
    if base_name in ALWAYS_EXCLUDE_FILES:
        return True

    relative_path_str = './' + path.relative_to(root_path).as_posix()
    if path.is_dir():
        if base_name in EXCLUDE_DIR_NAMES:
            return True
        # Check if the directory path starts with any of the excluded relative paths
        if any((relative_path_str + '/').startswith(p) for p in EXCLUDE_RELATIVE_PATHS):
            return True
    return False



def generate_snapshot():
    """Traverses the project and generates the snapshot file."""
    print(f"[INFO] Starting snapshot generation for: {PROJECT_ROOT.name}")

    file_tree_lines = []
    snapshot_content_parts = []
    files_captured = 0
    items_skipped = 0

    # Using a list for stack instead of recursion to handle deep directories gracefully
    stack = [PROJECT_ROOT]

    while stack:
        current_path = stack.pop()

        if should_exclude(current_path, PROJECT_ROOT):
            items_skipped += (len(list(current_path.rglob('*'))) if current_path.is_dir() else 1)
            continue

        if current_path.is_dir():
            # Add directory to tree and items to stack (in reverse sorted order to process them sorted)
            relative_dir_path = './' + current_path.relative_to(PROJECT_ROOT).as_posix() + '/'
            if relative_dir_path != './':
                file_tree_lines.append(relative_dir_path)

            try:
                children = sorted(list(current_path.iterdir()), key=lambda p: p.name, reverse=True)
                stack.extend(children)
            except PermissionError:
                print(f"[WARN] Permission denied for directory: {current_path}")
                items_skipped += 1

        elif current_path.is_file():
            if current_path.suffix.lower() in ALLOWED_EXTENSIONS:
                relative_file_path = './' + current_path.relative_to(PROJECT_ROOT).as_posix()
                file_tree_lines.append(relative_file_path)

                file_content = get_file_content(current_path)

                content_part = (
                    f"{FILE_SEPARATOR_START} {relative_file_path} ---\n\n"
                    f"{file_content}\n"
                    f"{FILE_SEPARATOR_END} ---\n\n"
                )

                snapshot_content_parts.append(content_part)
                files_captured += 1
            else:
                items_skipped += 1

    # Assemble the final snapshot
    file_tree_content = '# Directory Structure (relative to project root)\n' + '\n'.join(' ' + line for line in sorted(file_tree_lines)) + '\n\n'
    snapshot_content = "".join(snapshot_content_parts)

    # Calculate token count
    try:
        enc = tiktoken.encoding_for_model("gpt-4")
        token_count = len(enc.encode(snapshot_content))
        token_count_str = f"~{token_count:,} tokens"
    except Exception as e:
        print(f"[WARN] Could not calculate token count: {e}")
        token_count_str = "N/A"

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    header = (
        f"# Knowledge Weaver Project Snapshot\n\n"
        f"Generated On: {timestamp}\n"
        f"# Mnemonic Weight (Token Count): {token_count_str}\n\n"
    )

    final_content = header + file_tree_content + snapshot_content

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"\n[SUCCESS] Snapshot generated: {OUTPUT_FILE}")
    print(f"[STATS] Total Token Count: {token_count_str}")
    print(f"[STATS] Files Captured: {files_captured} | Items Skipped: {items_skipped}")

if __name__ == "__main__":
    generate_snapshot()
