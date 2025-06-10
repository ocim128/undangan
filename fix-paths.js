const fs = require('fs');
const path = require('path');

function fixPaths(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/\.\/publish\//g, './');
        content = content.replace(/\/publish\//g, '/');
        content = content.replace(/<base href="\/undangan\/publish\/">/g, '');
        fs.writeFileSync(filePath, content);
        console.log(`Fixed paths in: ${filePath}`);
    }
}

// Fix HTML files
fixPaths('index.html');
if (fs.existsSync('dashboard.html')) {
    fixPaths('dashboard.html');
}

// Fix JS files in guest directory
const guestDir = 'js/app/guest/';
if (fs.existsSync(guestDir)) {
    fs.readdirSync(guestDir).forEach(file => {
        if (file.endsWith('.js')) {
            fixPaths(path.join(guestDir, file));
        }
    });
}

// Also fix public folder if it exists
if (fs.existsSync('public/index.html')) {
    fixPaths('public/index.html');
}

console.log('✅ All paths fixed!');