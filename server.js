const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Static dosyalar için dizin

// Route to create a new activity HTML file
app.post('/create-activity', (req, res) => {
    const { id, title, description } = req.body;

    const fileName = `activity-${id}.html`;
    const filePath = path.join(__dirname, 'public', fileName);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <header>
            <h1>${title}</h1>
        </header>
        <main>
            <p>${description}</p>
        </main>
        <footer>
            <p>Activity ID: ${id}</p>
        </footer>
    </body>
    </html>
    `;

    fs.writeFile(filePath, htmlContent, (err) => {
        if (err) {
            return res.status(500).send('Error creating file.');
        }
        res.status(200).send('File created successfully.');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
