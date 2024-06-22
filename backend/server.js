const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Custom middleware to serve directory listings for /frontend
app.use('/frontend', (req, res) => {
    const dirPath = path.join(__dirname, '../frontend', req.path);
    fs.stat(dirPath, (err, stats) => {
        if (err) {
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

// Custom middleware to serve directory listings for /backend
app.use('/backend', (req, res) => {
    const dirPath = path.join(__dirname, '../backend', req.path); // Note the corrected path here
    fs.stat(dirPath, (err, stats) => {
        if (err) {
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
    if (!req.path.startsWith('/backend') && !req.path.startsWith('/frontend')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});