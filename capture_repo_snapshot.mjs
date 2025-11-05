// capture_repo_snapshot.mjs (v5.0 - Consolidated Features)
// Consolidated version combining the best features from both Python and JavaScript implementations
//
// FEATURES:
// - Advanced security redaction (API keys, tokens, sensitive data)
// - Special handling for Jupyter notebooks (.ipynb) with formatted JSON
// - Support for Python files (.py) and comprehensive file extensions
// - Comprehensive directory exclusions for multiple frameworks
// - Clean function organization and improved error handling
// - Fallback token counting (uses gpt-tokenizer if available, otherwise estimates)
// - Cross-platform path handling
//
// USAGE:
//   node capture_repo_snapshot.mjs
//
// OUTPUT:
//   Generates 'repo_snapshot_llm_distilled.txt' with:
//   - Directory structure overview
//   - All relevant source code and documentation
//   - Token count estimation
//   - Redacted sensitive information

import fs from 'fs';
import path from 'path';

// Token counting function - uses gpt-tokenizer if available, otherwise basic estimation
function getTokenCount(text) {
    try {
        // Try to dynamically import gpt-tokenizer
        const { encode } = require('gpt-tokenizer');
        return encode(text).length;
    } catch (error) {
        // Fallback to basic estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }
}

const projectRoot = path.resolve();
const distilledOutputFile = path.join(projectRoot, 'repo_snapshot_llm_distilled.txt');

// --- CONFIGURATION ---
// Comprehensive directory exclusions from both versions
const excludeDirNames = new Set([
    'node_modules', '.next', '.git', '.cache', '.turbo', '.vscode', 'dist', 'build', 'coverage', 'out', 'tmp', 'temp', 'logs', '.idea', '.parcel-cache', '.storybook', '.husky', '.pnpm', '.yarn', '.svelte-kit', '.vercel', '.firebase', '.expo', '.expo-shared',
    '__pycache__', '.ipynb_checkpoints', '.tox', '.eggs', 'eggs', '.venv', 'venv', 'env',
    '.svn', '.hg', '.bzr', 'agents/feedback', 'agents/screenshots', 'playwright-report', 'test-results', 'supabase/.temp'
]);

// Exclude relative paths from the project root
const excludeRelativePaths = [
    // Data and model directories (from Python version)
    './data/',
    './models/',
    // Sensitive data files and folders
    'TargetPortfolio',
    'backend/src/data/accounts.ts',
    'backend/src/data/balances.ts',
    'backend/src/data/currentHoldings.ts',
    'backend/src/data/orders.ts',
    'backend/src/data/positions.ts',
];

const alwaysExcludeFiles = new Set([
    'repo_snapshot_llm_distilled.txt',
    'all_markdown_and_code_snapshot_llm_distilled.txt', // Legacy output file
    '.gitignore',
    '.DS_Store',
    '.env',
    'capture_repo_snapshot.js',
    'capture_repo_snapshot.mjs',
    'create_llm_snapshot.py', // Python version
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'poetry.lock'
]);

// Also exclude common repo metadata and generated/runtime files
alwaysExcludeFiles.add('package.json');
alwaysExcludeFiles.add('requirements.txt');
alwaysExcludeFiles.add('knowledge_weaver_snapshot.txt');
alwaysExcludeFiles.add('repo_snapshot_llm_distilled.txt');

// Consolidated file extensions from both versions
const allowedExtensions = ['.md', '.js', '.ts', '.tsx', '.py', '.sh', '.sql', '.cjs', '.mjs', '.json', '.toml', '.yml', '.yaml', '.txt', '.ipynb'];

// Special files to always include (overrides extension check)
const alwaysIncludeFiles = new Set([
    '.env.example'  // Common pattern for environment variable templates
]);
// --- END CONFIGURATION ---

const fileSeparatorStart = '--- START OF FILE';
const fileSeparatorEnd = '--- END OF FILE';

/**
 * Handles special file types like Jupyter notebooks
 * @param {string} filePath - Path to the file
 * @returns {string} Processed file content
 */
function handleSpecialFileTypes(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.ipynb') {
        try {
            const notebookData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Format notebook JSON nicely like the Python version
            return JSON.stringify(notebookData, null, 2);
        } catch (error) {
            return `[Error reading notebook ${filePath}: ${error.message}]`;
        }
    }

    // Default: return raw content
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Processes file content with security redaction and special file handling
 * @param {string} filePath - Path to the file
 * @param {string} basePath - Base path for relative calculations
 * @returns {string} Formatted file content for the snapshot
 */
function appendFileContent(filePath, basePath) {
    // Ensure relativePath always starts with ./
    const relativePath = './' + path.relative(basePath, filePath).replace(/\\/g, '/');

    let fileContent = '';
    try {
        fileContent = handleSpecialFileTypes(filePath);
    } catch (readError) {
        fileContent = `[Content not captured due to read error: ${readError.message}.]`;
    }

    // --- Sensitive content redaction ---------------------------------
    // Configurable list of environment/key names to redact when found
    const sensitiveKeyNames = [
        'OPENAI_API_KEY',
        'GEMINI_API_KEY',
        'RESEND_API_KEY',
        'RESEND_FROM_EMAIL',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_PHONE_NUMBER',
        'VITE_GOOGLE_MAPS_API_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_ANON_KEY',
        'PGPASSWORD'
    ];

    // Build a regex that matches assignments like KEY=VALUE or KEY: "value"
    const sensAlt = sensitiveKeyNames.join('|').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const keyAssignRegex = new RegExp(`\\b(${sensAlt})\\b\\s*[:=]\\s*['\"]?[^'\"\n\\r]*`, 'gi');

    // Redact bearer tokens and likely long-looking secret tokens (e.g., sk-...)
    const bearerRegex = /Bearer\s+[A-Za-z0-9\-_.]+/gi;
    const longKeyRegex = /\b(sk-[A-Za-z0-9\-_.]{10,})\b/gi;

    // Perform redactions on fileContent; produce sanitized copy for snapshot
    let sanitized = fileContent
        .replace(keyAssignRegex, (m, p1) => `${p1}=[REDACTED]`)
        .replace(bearerRegex, 'Bearer [REDACTED]')
        .replace(longKeyRegex, '[REDACTED_LONG_KEY]');

    // If we redacted anything, annotate the snapshot output for this file
    const redacted = sanitized !== fileContent;

    // Use the standardized relativePath with ./ prefix in the separator
    let output = `${fileSeparatorStart} ${relativePath} ---\n\n`;
    output += sanitized;
    if (redacted) {
        output += `\n\n[NOTE] Sensitive values were detected and redacted in this file.`;
    }
    output += `\n${fileSeparatorEnd} ---\n\n`;
    return output;
}

/**
 * Determines if a file or directory should be excluded from the snapshot
 * @param {string} filePath - Path to check
 * @param {string} basePath - Base path for relative calculations
 * @returns {boolean} True if the path should be excluded
 */
function shouldExclude(filePath, basePath) {
    const baseName = path.basename(filePath);
    const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');

    // Exclude specific filenames
    if (alwaysExcludeFiles.has(baseName)) {
        return true;
    }

    // Exclude directories by name
    if (fs.statSync(filePath).isDirectory() && excludeDirNames.has(baseName)) {
        return true;
    }

    // Exclude specific relative paths
    for (const excludedPath of excludeRelativePaths) {
        if (relativePath.startsWith(excludedPath)) {
            return true;
        }
    }

    // Special .env file logic (exclude all real env files, allow .env.example)
    if (baseName.startsWith('.env') && baseName !== '.env.example') {
        return true;
    }

    return false;
}

/**
 * Recursively traverses directory and collects file information
 * @param {string} currentPath - Current directory/file path
 * @param {string} basePath - Base path for relative calculations
 * @param {Array} fileTreeLines - Array to collect file tree lines
 * @param {Object} stats - Statistics object to update
 * @returns {string} Concatenated file contents
 */
function traverseAndCapture(currentPath, basePath, fileTreeLines, stats) {
    if (shouldExclude(currentPath, basePath)) {
        stats.itemsSkipped++;
        return '';
    }

    const relativePath = path.relative(basePath, currentPath).replace(/\\/g, '/');
    let content = '';

    if (fs.statSync(currentPath).isDirectory()) {
        // Add directory to tree
        if (relativePath) {
            fileTreeLines.push('./' + relativePath + '/');
        }

        // Recurse through directory contents
        const items = fs.readdirSync(currentPath).sort();
        for (const item of items) {
            content += traverseAndCapture(path.join(currentPath, item), basePath, fileTreeLines, stats);
        }
    } else if (fs.statSync(currentPath).isFile()) {
        // Check file extension OR if it's a specifically allowed file
        const fileExtension = path.extname(currentPath).toLowerCase();
        const hasAllowedExtension = allowedExtensions.includes(fileExtension);
        const isAlwaysIncluded = alwaysIncludeFiles.has(path.basename(currentPath));

        if (!hasAllowedExtension && !isAlwaysIncluded) {
            stats.itemsSkipped++;
            return '';
        }

        // Add file to tree and capture content
        if (relativePath) {
            fileTreeLines.push('./' + relativePath);
        }
        content += appendFileContent(currentPath, basePath);
        stats.filesCaptured++;
    }

    return content;
}

// --- MAIN EXECUTION ---
console.log(`[INFO] Starting consolidated repository snapshot generation`);
console.log(`[INFO] Script version: v5.0 (Consolidated Features)`);
console.log(`[INFO] Processing root: ${projectRoot}`);

try {
    const fileTreeLines = [];
    const stats = { filesCaptured: 0, itemsSkipped: 0 };
    let distilledContent = '';

    // Traverse and collect all content
    distilledContent = traverseAndCapture(projectRoot, projectRoot, fileTreeLines, stats);

    // Generate file tree content
    const fileTreeContent = '# Directory Structure (relative to project root)\n' +
        fileTreeLines.map(line => '  ' + line).join('\n') + '\n\n';

    // Create header with token count placeholder
    const header = `# Repository Snapshot (LLM-Optimized)\n\nGenerated On: ${new Date().toISOString()}\n\n{TOKEN_COUNT_PLACEHOLDER}\n\n`;
    const finalContent = header + fileTreeContent + distilledContent;

    // Calculate token count and replace placeholder
    const tokenCount = getTokenCount(finalContent);
    const finalContentWithToken = finalContent.replace(
        '{TOKEN_COUNT_PLACEHOLDER}',
        `# Mnemonic Weight (Token Count): ~${tokenCount.toLocaleString()} tokens`
    );

    // Write output file
    fs.writeFileSync(distilledOutputFile, finalContentWithToken, 'utf8');

    console.log(`\n[SUCCESS] Consolidated snapshot generated: ${distilledOutputFile}`);
    console.log(`[METRIC] Total Token Count: ~${tokenCount.toLocaleString()} tokens`);
    console.log(`[STATS] Files Captured: ${stats.filesCaptured} | Items Skipped: ${stats.itemsSkipped}`);
    console.log(`[FEATURES] Includes: Security redaction, Notebook support (.ipynb), Python files (.py)`);

} catch (err) {
    console.error(`[FATAL] An error occurred during snapshot generation: ${err.message}`);
    console.error(err.stack);
}