import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const TARGET_NOTES_DIR = path.join(PROJECT_ROOT, 'public', 'notes');
const TREE_JSON_PATH = path.join(PROJECT_ROOT, 'public', 'directory-tree.json');
const TEST_FILE_SRC = path.join(PROJECT_ROOT, 'test_mermaid.md');
const TEST_FILE_DEST_NAME = 'test_mermaid.md';

async function syncTest() {
    console.log('🧪 Starting sync-test-mermaid process...');

    // 1. Clean and setup target directory
    await fs.emptyDir(TARGET_NOTES_DIR);
    
    if (!(await fs.pathExists(TEST_FILE_SRC))) {
        console.error(`❌ Test file not found at ${TEST_FILE_SRC}`);
        process.exit(1);
    }

    // 2. Copy the test file
    await fs.copy(TEST_FILE_SRC, path.join(TARGET_NOTES_DIR, TEST_FILE_DEST_NAME));
    console.log(`✅ Copied ${TEST_FILE_DEST_NAME} to public/notes/`);

    // 3. Generate a minimal directory tree
    const stats = await fs.stat(TEST_FILE_SRC);
    const tree = {
        name: 'WikiExplorer-Test',
        type: 'directory',
        children: [
            {
                name: TEST_FILE_DEST_NAME,
                type: 'file',
                path: TEST_FILE_DEST_NAME,
                mtime: stats.mtime.toISOString()
            }
        ]
    };

    await fs.writeJson(TREE_JSON_PATH, tree, { spaces: 2 });
    console.log(`✨ Generated test index: ${TREE_JSON_PATH}`);
    console.log('🎉 Test sync complete! Run "npm run dev" or "npm run build" to see result.');
}

syncTest().catch(err => {
    console.error('❌ Error during test sync:', err);
    process.exit(1);
});
