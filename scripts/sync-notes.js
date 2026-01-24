import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import scanConfig from '../scan.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.join(__dirname, '..', '..');
const TARGET_NOTES_DIR = path.join(__dirname, '..', 'public', 'notes');
const TREE_JSON_PATH = path.join(__dirname, '..', 'public', 'directory-tree.json');
const PROFILE_PHOTO_SRC = path.join(__dirname, '..', 'author_profile', 'profile-photo.jpg');
const PROFILE_PHOTO_DEST = path.join(__dirname, '..', 'public', 'profile-photo.jpg');
const PROFILE_JSON_SRC = path.join(__dirname, '..', 'author_profile', 'profile.json');
const PROFILE_JSON_DEST = path.join(__dirname, '..', 'public', 'profile.json');

// Helper to normalize paths for regex testing (force forward slashes)
function normalizePath(p) {
    return p.split(path.sep).join('/');
}

// Check if a path should be completely ignored (Blacklist)
function isExcluded(relativePath) {
    const normPath = normalizePath(relativePath);
    return scanConfig.exclude.some(regex => regex.test(normPath));
}

// Check if a file should be included (Whitelist)
function isIncluded(relativePath) {
    const normPath = normalizePath(relativePath);
    return scanConfig.include.some(regex => regex.test(normPath));
}

async function sync() {
    console.log('🚀 Starting sync-notes process (Config-based)...');
    
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

    // 1. Clean target
    await fs.emptyDir(TARGET_NOTES_DIR);
    console.log('✅ Cleaned public/notes directory.');

    const tree = {
        name: 'WikiExplorer',
        type: 'directory',
        children: []
    };

    // 2. Start scanning
    console.log(`📦 Scanning Workspace Root: ${WORKSPACE_ROOT}`);
    const rootNode = await processDirectory(WORKSPACE_ROOT, '');
    
    if (rootNode && rootNode.children) {
        tree.children = rootNode.children;
    }

    // 3. Write Index
    await fs.writeJson(TREE_JSON_PATH, tree, { spaces: 2 });
    console.log(`✨ Generated index: ${TREE_JSON_PATH}`);
    console.log('🎉 Sync complete!');
}

async function processDirectory(currentPath, relativePath) {
    // 1. Check Blacklist first (Efficiency & Safety)
    // Avoid checking empty root path against strict regexes if not needed, but here we check everything.
    if (relativePath && isExcluded(relativePath)) {
        // console.log(`Ignored (Exclude): ${relativePath}`);
        return null;
    }

    let stats;
    try {
        stats = await fs.stat(currentPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            try {
                // If lstat works but stat failed, it's a broken symlink
                const linkStats = await fs.lstat(currentPath);
                if (linkStats.isSymbolicLink()) {
                    // console.warn(`⚠️ Skipping broken link: ${name}`);
                    return null;
                }
            } catch (e) {
                // Really doesn't exist
            }
        }
        console.warn(`⚠️ Cannot access ${currentPath}: ${error.message}`);
        return null;
    }

    const name = path.basename(currentPath);
    const mtime = stats.mtime.toISOString(); 

    if (stats.isDirectory()) {
        let children;
        try {
            children = await fs.readdir(currentPath);
        } catch (e) {
            console.warn(`⚠️ Cannot read dir ${currentPath}: ${e.message}`);
            return null;
        }

        const node = {
            name: name || 'Root',
            type: 'directory',
            path: normalizePath(relativePath), 
            mtime, 
            children: []
        };

        for (const child of children) {
            const childPath = path.join(currentPath, child);
            const childRelativePath = relativePath ? path.join(relativePath, child) : child;
            
            const childNode = await processDirectory(childPath, childRelativePath);
            if (childNode) {
                node.children.push(childNode);
            }
        }

        // 4. Prune empty directories
        // Only return this directory if it has children (meaning it contains included files)
        if (node.children.length > 0) {
            return node;
        }
        return null;
    } else {
        // File Handling
        // 2. Check Whitelist
        if (path.extname(name).toLowerCase() === '.md') {
            if (isIncluded(relativePath)) {
                // Copy file
                const destPath = path.join(TARGET_NOTES_DIR, relativePath);
                await fs.ensureDir(path.dirname(destPath));
                await fs.copy(currentPath, destPath);

                return {
                    name,
                    type: 'file',
                    path: normalizePath(relativePath),
                    mtime 
                };
            } else {
                // console.log(`Skipped (Not Included): ${relativePath}`);
            }
        }
        return null;
    }
}

sync().catch(err => {
    console.error('❌ Error during sync:', err);
    process.exit(1);
});
