const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve files and directories
app.use((req, res, next) => {
    let dirPath;

    if (req.path.startsWith('/backend')) {
        dirPath = path.join(__dirname, '../backend', req.path.replace('/backend', ''));
    } else if (req.path.startsWith('/frontend')) {
        dirPath = path.join(__dirname, '../frontend', req.path.replace('/frontend', ''));
    } else {
        dirPath = path.join(__dirname, '../', req.path);
    }

    fs.stat(dirPath, (err, stats) => {
        if (err) {
            if (req.path === '/') {
                // Serve the root directory listing
                const rootDirs = ['frontend', 'backend'];
                const fileLinks = rootDirs.map(dir => `<li><a href="/${dir}">${dir}</a></li>`).join('');
                return res.send(`<ul>${fileLinks}</ul>`);
            }
            return res.status(404).send('Not Found');
        }
        if (stats.isDirectory()) {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    return res.status(500).send('Server Error');
                }
                const fileLinks = files.map(file => {
                    const filePath = path.join(req.path, file);
                    return `<li><a href="${filePath}">${file}</a></li>`;
                }).join('');
                res.send(`<ul>${fileLinks}</ul>`);
            });
        } else {
            res.sendFile(dirPath);
        }
    });
});

// Fallback to index.html for single-page applications (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});