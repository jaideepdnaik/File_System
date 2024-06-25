window.onload = function() {
    fetch('/frontend')
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('fileList');
            data.forEach(file => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `/frontend/${file}`;
                link.textContent = file;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteFile(`/frontend/${file}`);
                listItem.appendChild(link);
                listItem.appendChild(deleteButton);
                fileList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching file list:', error));
};

function deleteFile(filePath) {
    fetch('/delete', {
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