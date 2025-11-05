# Repository Snapshot Scripts

Generate LLM-optimized snapshots of your code repositories for efficient sharing with AI assistants.

## 🎯 Purpose & Context Engineering

These scripts implement **practical context engineering** for AI-assisted software development, directly addressing the research question from ["Context Engineering 2.0"](https://arxiv.org/abs/2510.26493): *"How can machines better understand our situations and purposes?"*

### Why Context Engineering Matters

In the evolving landscape of human-AI interaction, **context engineering** is the practice of structuring information to enable machines to better understand human situations, intentions, and environments. Our scripts apply this principle to software development by:

- **Transforming raw repositories** into AI-optimized context
- **Preserving essential information** while removing noise
- **Enabling efficient human-AI collaboration** on complex codebases
- **Bridging the gap** between unstructured development artifacts and AI comprehension

### Practical Utility

**Time Savings**: Instead of sharing entire repositories or manually copying files, developers get single, optimized files ready for LLM consumption.

**Enhanced AI Assistance**: Clean, structured context leads to better code reviews, debugging help, documentation generation, and architectural guidance.

**Workflow Integration**: Scripts can be integrated into CI/CD pipelines, pre-commit hooks, or VS Code tasks for seamless operation.

**Security-Conscious**: Automatic redaction protects sensitive information while maintaining context utility.

**Framework Agnostic**: Works across JavaScript, Python, Java, and other tech stacks.

## 🔬 Research Context

These scripts represent **Phase 2 context engineering** (human-agent interaction) as outlined in the context engineering research:

- **Phase 1 (1990s)**: Basic human-computer interaction frameworks
- **Phase 2 (Current)**: Human-agent interaction paradigms ← *Our scripts fit here*
- **Phase 3 (Future)**: Human-level/superhuman intelligence

By optimizing how developers share project context with AI agents, these scripts contribute to the broader field of context engineering in AI systems.

## 🚀 Future Directions

The context engineering field suggests expanding beyond static snapshots toward:

- **Dynamic Context**: AI agents requesting specific additional context
- **Context Memory**: Building on previous interaction history
- **Multi-modal Context**: Including diagrams, architecture docs, and visual elements
- **Interactive Context Engineering**: Real-time context adaptation based on AI needs

## 🎯 Purpose

These scripts create consolidated text files containing all relevant code, documentation, and configuration from your project. Instead of sharing entire repositories or multiple files, you get a single, well-formatted file that Large Language Models (LLMs) can easily process for:

- **Code reviews and analysis**
- **Architecture discussions**
- **Debugging assistance**
- **Documentation generation**
- **Refactoring suggestions**
- **Learning and onboarding**

## 📋 What's Included

The scripts intelligently capture:
- **Source code** (`.js`, `.ts`, `.py`, `.java`, etc.)
- **Documentation** (`.md`, README files)
- **Configuration** (`.json`, `.yaml`, `.toml`, `package.json`, etc.)
- **Schemas** (`.sql` database files)
- **Notebooks** (`.ipynb` Jupyter files, formatted as JSON)
- **Scripts** (`.sh`, deployment scripts)

## 🚫 What's Excluded

To keep snapshots focused and secure:
- **Dependencies** (`node_modules/`, lock files)
- **Build artifacts** (`dist/`, `.next/`, etc.)
- **Secrets** (`.env` files, API keys automatically redacted)
- **Large data** (`data/`, `models/` directories)
- **Git history** (`.git/`)
- **IDE files** (`.vscode/`, `.idea/`)
- **OS files** (`.DS_Store`, thumbnails)

## 🔧 Available Scripts

### JavaScript Version (`capture_repo_snapshot.mjs`)
**Recommended for most projects**

```bash
node capture_repo_snapshot.mjs
```

**Features:**
- ✅ Advanced security redaction
- ✅ Comprehensive framework support
- ✅ Modern ES modules
- ✅ Fallback token counting
- ✅ Special `.env.example` handling

**Output:** `repo_snapshot_llm_distilled.txt`

### Python Version (`create_llm_snapshot.py`)
**Great for Python-focused projects**

```bash
python create_llm_snapshot.py
```

**Features:**
- ✅ Precise token counting with tiktoken
- ✅ Clean Python implementation
- ✅ Excellent notebook support
- ✅ pathlib-based file handling

**Output:** `knowledge_weaver_snapshot.txt`

## 🚀 Quick Start

### Option 1: JavaScript (Recommended)

1. **Download the script:**
   ```bash
   curl -O https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/capture_repo_snapshot.mjs
   ```

2. **Make it executable:**
   ```bash
   chmod +x capture_repo_snapshot.mjs
   ```

3. **Run it:**
   ```bash
   node capture_repo_snapshot.mjs
   ```

4. **Share the generated file:**
   - `repo_snapshot_llm_distilled.txt` will be created
   - Upload to your LLM conversation or share via pastebin/git gist

### Option 2: Python

1. **Install dependencies:**
   ```bash
   pip install tiktoken
   ```

2. **Download the script:**
   ```bash
   curl -O https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/create_llm_snapshot.py
   ```

3. **Run it:**
   ```bash
   python create_llm_snapshot.py
   ```

4. **Share the generated file:**
   - `knowledge_weaver_snapshot.txt` will be created

## 📁 Output Format

Both scripts generate files with this structure:

```
# Repository Snapshot (LLM-Optimized)

Generated On: 2025-11-05T21:21:25.433Z
# Mnemonic Weight (Token Count): ~7,818 tokens

# Directory Structure (relative to project root)
  ./README.md
  ./src/app.js
  ./config.json
  ...

--- START OF FILE ./README.md ---
[File content here]
--- END OF FILE ---

--- START OF FILE ./src/app.js ---
[File content here]
--- END OF FILE ---
```

## 🔒 Security Features

### JavaScript Version
- **Automatic redaction** of API keys, tokens, and secrets
- **Pattern matching** for common secret formats:
  - `OPENAI_API_KEY=value` → `OPENAI_API_KEY=[REDACTED]`
  - `Bearer sk-abc123...` → `Bearer [REDACTED]`
  - Long secret keys starting with `sk-`

### Python Version
- **Clean output** with no sensitive data included
- **Exclusion of** `.env` files and common secret locations

## 🎨 Customization

### Modifying File Types

Edit the `allowedExtensions` array to include/exclude file types:

```javascript
// In capture_repo_snapshot.mjs
const allowedExtensions = ['.md', '.js', '.ts', '.py', '.sql', '.json'];
```

```python
# In create_llm_snapshot.py
ALLOWED_EXTENSIONS = ['.py', '.md', '.json', '.yaml', '.sql']
```

### Adding Exclusions

Add directories or files to exclude:

```javascript
// In capture_repo_snapshot.mjs
const excludeDirNames = new Set([
    'node_modules', '.git', 'dist', 'custom_exclude_dir'
]);
```

```python
# In create_llm_snapshot.py
EXCLUDE_DIR_NAMES = {
    'node_modules', '.git', 'dist', 'custom_exclude_dir'
}
```

## 📊 Token Counting

Both scripts estimate token counts to help you understand LLM context usage:

- **JavaScript:** Estimates ~4 characters per token (fallback when `gpt-tokenizer` unavailable)
- **Python:** Precise counting using OpenAI's `tiktoken` library

## 🏗️ Integration Ideas

### GitHub Actions
Add to your CI/CD pipeline:

```yaml
# .github/workflows/snapshot.yml
name: Generate Repository Snapshot
on: [push, pull_request]

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: node capture_repo_snapshot.mjs
      - uses: actions/upload-artifact@v3
        with:
          name: repo-snapshot
          path: repo_snapshot_llm_distilled.txt
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
node capture_repo_snapshot.mjs
git add repo_snapshot_llm_distilled.txt
```

### VS Code Task
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate Snapshot",
      "type": "shell",
      "command": "node",
      "args": ["capture_repo_snapshot.mjs"],
      "group": "build"
    }
  ]
}
```

## 🔍 Use Cases

### Code Review
> "Can you review this authentication system?" (attach snapshot)

### Architecture Discussion
> "Help me understand the overall structure of this project" (attach snapshot)

### Debugging
> "I'm getting this error, can you help debug?" (attach snapshot + error)

### Documentation
> "Generate API documentation for these endpoints" (attach snapshot)

### Learning
> "Explain how this data processing pipeline works" (attach snapshot)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test with the sample project
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your own projects!

## 🙏 Acknowledgments

Inspired by the need for better context sharing with AI assistants. Special thanks to the open-source community for tokenizer libraries and file processing utilities.