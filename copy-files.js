const fs = require('fs-extra');

async function copyFiles() {
    try {
        await fs.ensureDir('public');
        const filesToCopy = ['assets/images', 'css', 'index.html', 'dashboard.html'];
        const jsFiles = ['dist/guest.js', 'dist/admin.js'];
        await Promise.all(filesToCopy.map(file => fs.copy(file, `public/${file}`)));
        await Promise.all(jsFiles.map(file => fs.copy(file, `public/dist/${file.replace('dist/', '')}`)));
        console.log('✅ Successfully copied files to public/');
    } catch (err) {
        console.error('❌ Error copying files:', err);
        process.exit(1);
    }
}

copyFiles();