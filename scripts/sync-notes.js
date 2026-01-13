import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ignore from 'ignore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置：不再限制特定子目录，改为扫描整个 Workspace
// const SOURCE_DIRS = [...]; // Removed

const WORKSPACE_ROOT = path.join(__dirname, '..', '..');
const PROJECT_ROOT = path.join(__dirname, '..'); // Pages project root
const TARGET_NOTES_DIR = path.join(__dirname, '..', 'public', 'notes');
const TREE_JSON_PATH = path.join(__dirname, '..', 'public', 'directory-tree.json');
const PROFILE_PHOTO_SRC = path.join(__dirname, '..', 'author_profile', 'profile-photo.jpg');
const PROFILE_PHOTO_DEST = path.join(__dirname, '..', 'public', 'profile-photo.jpg');
const PROFILE_JSON_SRC = path.join(__dirname, '..', 'author_profile', 'profile.json');
const PROFILE_JSON_DEST = path.join(__dirname, '..', 'public', 'profile.json');

// Initialize ig with default ignores
// CRITICAL: Must ignore the output directory to prevent infinite recursion/self-copying
const ig = ignore().add([
    '.git',
    'node_modules',
    'dist',
    'build',
    '.DS_Store',
    'WikiExplorer/public', // Ignore our own output
    'WikiExplorer/dist',   // Ignore build artifacts
    'WikiExplorer/node_modules' // Ensure this is ignored
]);

async function loadGitIgnore() {
    const gitIgnorePath = path.join(PROJECT_ROOT, '.gitignore');
    if (await fs.pathExists(gitIgnorePath)) {
        const content = await fs.readFile(gitIgnorePath, 'utf8');
        ig.add(content);
        console.log('📜 Loaded .gitignore patterns.');
    } else {
        console.log('ℹ️ No .gitignore found in project root.');
    }
}

async function sync() {
    console.log('🚀 Starting sync-notes process...');
    
    // Load .gitignore
    await loadGitIgnore();

    // 0. Copy Profile Assets
    if (await fs.pathExists(PROFILE_PHOTO_SRC)) {
        await fs.copy(PROFILE_PHOTO_SRC, PROFILE_PHOTO_DEST);
        console.log('📸 Copied profile photo.');
    } else {
        console.warn('⚠️ Profile photo not found.');
    }

    if (await fs.pathExists(PROFILE_JSON_SRC)) {
        await fs.copy(PROFILE_JSON_SRC, PROFILE_JSON_DEST);
        console.log('👤 Copied profile configuration.');
    } else {
        console.warn('⚠️ Profile configuration (profile.json) not found.');
    }

    // 1. 清理并创建目标目录
    await fs.emptyDir(TARGET_NOTES_DIR);
    console.log('✅ Cleaned public/notes directory.');

    const tree = {
        name: 'Workspace',
        type: 'directory',
        children: []
    };

    // 2. Start scanning from WORKSPACE_ROOT
    console.log(`📦 Scanning Workspace Root: ${WORKSPACE_ROOT}`);
    // Passing '' as relativePath means we are at the root
    const rootNode = await processDirectory(WORKSPACE_ROOT, '');
    
    if (rootNode && rootNode.children) {
        // We might want to flatten the root children into the tree children
        tree.children = rootNode.children;
    }

    // 3. 写入索引文件
    await fs.writeJson(TREE_JSON_PATH, tree, { spaces: 2 });
    console.log(`✨ Generated index: ${TREE_JSON_PATH}`);
    console.log('🎉 Sync complete!');
}

async function processDirectory(currentPath, relativePath) {
    // Normalize path to forward slashes for 'ignore' package compatibility on Windows
    // Handle empty relativePath (root) safely
    const checkPath = relativePath ? relativePath.split(path.sep).join('/') : '';

    // Check ignore rules
    // Only check if checkPath is not empty (root is always processed, children checked)
    if (checkPath && ig.ignores(checkPath)) {
        // console.log(`🙈 Ignored: ${checkPath}`);
        return null;
    }

    let stats;
    try {
        stats = await fs.stat(currentPath);
    } catch (error) {
        console.warn(`⚠️ Cannot access ${currentPath}: ${error.message}`);
        return null;
    }

    const name = path.basename(currentPath);
    const mtime = stats.mtime.toISOString(); 

    if (stats.isDirectory()) {
        const children = await fs.readdir(currentPath);
        const node = {
            name: name || 'Root', // Handle root name
            type: 'directory',
            path: checkPath, 
            mtime, 
            children: []
        };

        for (const child of children) {
            const childPath = path.join(currentPath, child);
            // Construct new relative path
            const childRelativePath = relativePath ? path.join(relativePath, child) : child;
            
            const childNode = await processDirectory(childPath, childRelativePath);
            if (childNode) {
                node.children.push(childNode);
            }
        }

        // Return directory node if it has children
        if (node.children.length > 0) {
            return node;
        }
        return null;
    } else {
        // 只保留 Markdown 文件
        if (path.extname(name).toLowerCase() === '.md') {
            // 将文件复制到 public/notes 下对应的层级
            const destPath = path.join(TARGET_NOTES_DIR, relativePath);
            await fs.ensureDir(path.dirname(destPath));
            await fs.copy(currentPath, destPath);

            return {
                name,
                type: 'file',
                path: checkPath,
                mtime 
            };
        }
        return null;
    }
}

sync().catch(err => {
    console.error('❌ Error during sync:', err);
    process.exit(1);
});
