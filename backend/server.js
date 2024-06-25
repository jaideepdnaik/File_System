const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (for DELETE requests)
app.use(express.json());

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
                    return `<li><a href="${filePath}">${file}</a> <button onclick="deleteFile('${filePath}')">Delete</button></li>`;
                }).join('');
                res.send(`<ul>${fileLinks}</ul>
                <script>
                    function deleteFile(filePath) {
                        fetch(filePath, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ path: filePath })
                        })
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                response.text().then(text => {
                                    alert('Failed to delete file: ' + text);
                                });
                            }
                        });
                    }
                </script>`);
            });
        } else {
            res.sendFile(dirPath);
        }
    });
});

// Route to handle file deletion
app.delete('/delete', (req, res) => {
    const filePath = path.join(__dirname, '../', req.body.path.replace(/^\//, ''));
    console.log(`Attempting to delete file: ${filePath}`);

    // Check if file exists before attempting deletion
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).send('File not found');
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
            return res.status(500).send(`Server Error: ${err.message}`);
        }
        console.log(`Successfully deleted file: ${filePath}`);
        res.status(200).send('File Deleted');
    });
});

// Fallback to index.html for single-page applications (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});