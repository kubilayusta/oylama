const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yapmak için zaman damgası ekleyebilirsiniz
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});


const upload = multer({ storage: storage });
const saltRounds = 10;
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kubilayusta-57', // Şifreyi gizli bir şekilde saklayın
    database: 'users2'
});
const fs = require('fs');
var currentUser = null;



connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // JSON verilerini işlemeyi sağlar
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa yönlendirmesi

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard-kullanicilar.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard-kullanicilar.html'));
});

app.get('/dashboard-program.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '/dashboard-program.html'));
});

app.get('/dashboard-oylama.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard-oylama.html'));
});

const uploadFields = upload.fields([
    { name: 'fotoğraf', maxCount: 1 },
    { name: 'proje_dosyasi', maxCount: 1 }
]);

app.post('/upload', uploadFields, (req, res) => {
    const files = req.files;
    if (!files) {
        return res.status(400).send('Hiçbir dosya yüklenmedi.');
    }
});

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { first_name, last_name, mail, password } = req.body;

    // Şifreyi hash'le
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Hashleme hatası:', err);
            return res.status(500).json({ success: false });

        }
        // Kullanıcıyı veritabanına ekle
        const query = 'INSERT INTO users (first_name, last_name, mail, password) VALUES (?, ?, ?, ?)'
        connection.query(query, [first_name, last_name, mail, hash], (error, results) => {
            if (error) {
                console.error('Veritabanı hatası:', error);
                return res.status(500).json({ success: false });
            }

            // Kayıt başarılı, yanıt olarak kullanıcıyı gönder
            res.json({
                success: true,
                user: {
                    first_name,
                    last_name,
                    mail
                }
            });
        });
    });
});

// Giriş işlemi
app.post('/login', (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(400).send('E-posta ve şifre gereklidir.');
    }

    const sql = 'SELECT * FROM users2.users WHERE mail = ?';
    connection.query(sql, [mail], (err, results) => {
        if (err) {
            return res.status(500).send('Kullanıcı bilgileri alınırken hata oluştu.');
        }
        if (results.length === 0) {
            // Kullanıcı bulunamadı
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        const user = results[0];

        // Şifreyi karşılaştır
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Şifre karşılaştırma hatası.');
            }
            if (isMatch) {
                // Giriş başarılı, kullanıcı bilgilerini JSON olarak döndür
                res.json({
                    success: true,
                    user: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        mail: user.mail,
                        user_type: user.user_type,
                        user_id: user.user_id
                    }
                });
            } else {
                // Yanlış şifre
                return res.status(401).json({ success: false, message: 'Şifre yanlış' });
            }
        });
    });
});

// Aktivite Oluşturma
app.post('/create-activity', (req, res) => {

    const { mail, id, title, date, vote_type, challenge_type, html_id } = req.body;
    const sql = 'SELECT * FROM users2.users WHERE mail = ?';
    connection.query(sql, [mail], (err, results) => {
        if (err) {
            return res.status(500).send('Kullanıcı bilgileri alınırken hata oluştu.');
        }
        if (results.length === 0) {
            // Kullanıcı bulunamadı
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        const user = results[0];
        user_id = user.user_id

        const query = 'INSERT INTO challenges (title, date, user_id, vote_type, challenge_type, html_id, data_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [title, date, user_id, vote_type, challenge_type, html_id, id], (error, results) => {
            if (error) {
                console.error('Veritabanı hatası:', error);
                return res.status(500).json({ success: false });
            }
            let htmlTemplate =
                `

                <!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
                        integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
                        crossorigin="anonymous" referrerpolicy="no-referrer" />
                    <link rel="stylesheet" href="style.css">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                    <title>Document</title>
                    <script src="functions.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>
                </head>
                
                <body>
                    <div class="login-panel" id="loginPanel">
                        <form id="loginForm">
                            <label for="mail">E-posta</label>
                            <input type="email" id="mail" placeholder="E-posta">
                            <label for="password">Şifre</label>
                            <input type="password" id="password" placeholder="Şifre">
                            <button onclick="submit">Giriş Yap</button>
                        </form>
                    </div>
                    <div class="register-panel" id="registerPanel">
                        <form id="registerForm">
                            <label for="first_name">İsim:</label>
                            <input type="text" id="first_name" name="first_name" required>
                
                            <label for="last_name">Soyad:</label>
                            <input type="text" id="last_name" name="last_name" required>
                
                            <label for="mail">E-Posta:</label>
                            <input type="email" id="mail" name="mail" required>
                
                            <label for="password">Şifre:</label>
                            <input type="password" id="password" name="password" required>
                
                            <button type="submit">Kayıt Ol</button>
                        </form>
                        <div class="message" id="message"></div>
                        <div class="error" id="error"></div>
                    </div>
                    <div id="editmodal" class="editmodal">
                        <div class="modal-content">
                            <span class="close" id="close">&times;</span>
                            <h2>Edit Project</h2>
                            <form id="editForm">
                                <input type="hidden" id="edit-project-id">
                                <label for="edit-title">Title:</label>
                                <input type="text" id="edit-title" name="title" required>
                                <br><br>
                                <label for="edit-description">Description:</label>
                                <textarea id="edit-description" name="description" rows="4" required></textarea>
                                <br><br>
                                <button type="submit" class="submit-btn">Kaydet</button>
                            </form>
                        </div>
                    </div>
                    <div id="projectModal" class="modal">
                        <div class="modal-content">            
                            <span class="close" id="close" onclick="closeModal()">&times;</span>            
                            <h2>Yeni Proje Ekle</h2>
                            <form id="projectForm" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="proje-basligi">Proje Başlığı:</label>
                                    <input type="text" id="proje-basligi" name="proje_basligi" required>
                
                                    <label for="aciklama">Açıklama:</label>
                                    <textarea id="aciklama" name="aciklama" required></textarea>
                
                                    <label for="universite-bolum">Üniversite Bölüm:</label>
                                    <input type="text" id="universite-bolum" name="universite_bolum" required>
                
                                    <label for="ogrenci-isimleri">Öğrenci İsimleri:</label>
                                    <input type="text" id="ogrenci-isimleri" name="ogrenci_isimleri" required>
                
                                    <label for="anahtar-kelimeler">Anahtar Kelimeler:</label>
                                    <input type="text" id="anahtar-kelimeler" name="anahtar_kelimeler" required>
                
                                    <label for="mentor-isimleri">Mentör İsimleri:</label>
                                    <input type="text" id="mentor-isimleri" name="mentor_isimleri" required>
                
                                    <label for="proje-tipi">Proje Tipi:</label>
                                    <select id="proje-tipi" name="proje_tipi" required>
                                        <option value="Akademik">Akademik</option>
                                        <option value="Endustriyel">Endüstriyel</option>
                                        <option value="Bilimsel">Bilimsel</option>
                                        <option value="Diger">Diğer</option>
                                    </select>
                
                                    <label for="fotoğraf">Fotoğraf (PNG Yükleyin):</label>
                                    <input type="file" id="fotoğraf" name="fotoğraf" accept="image/png">
                
                                    <label for="proje-dosyasi">Proje Dosyası (PDF Yükleyin):</label>
                                    <input type="file" id="proje-dosyasi" name="proje_dosyasi" accept="application/pdf">
                                    <button type="submit" class="submit-btn" value="Yükle">Ekle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div id="projectPanel" class="project-modal" style="display: none;">
                        <div class="modal-content">
                            <h1 id="proje-basligi">Proje Adı</h1>
                            <h2>Açıklama:</h2>
                            <p id="aciklama">Proje Açıklaması</p>
                
                            <h2>Üniversite:</h2>
                            <p id="universite-bolum">Proje Tarihi</p>
                
                            <h2>Öğrenciler:</h2>
                            <p id="ogrenci-isimleri">Proje Sahibi</p>
                
                            <h2>Anahtar Kelimeler:</h2>
                            <p id="anahtar-kelimeler">Proje Sahibi</p>
                
                            <h2>Mentör:</h2>
                            <p id="mentor-isimleri">Proje Sahibi</p>
                
                            <h2>Proje Tipi:</h2>
                            <p id="proje-tipi">Proje Sahibi</p>
                            <button id="closeButton" class="close-button">&times;</button>
                        </div>
                    </div>
                    <div id="voteModal" class="vote-modal" style="display: none;">
                        <div id="modal-content" class="modal-content">
                            <h2>Oy Ver</h2>
                            <div id="criteriaContainer"></div>
                            <form id="voteForm">
                                <!-- Form elemanları buraya eklenecek -->
                            </form>
                            <button type="button" id="saveVoteButton" class="save-vote-button">Kaydet</button>
                            <button type="button" id="closeVoteModalButton" class="close-button">&times;</button>
                        </div>
                    </div>
                    <header class="header">
                        <a href="https://www.havelsan.com.tr" class="logo" target="_blank">
                            <img src="images/LOGO.PNG" alt="logo" />
                        </a>
                        <nav class="navbar">
                            <a href="/">Ana Sayfa</a>
                            <a href="dashboard-program.html">Program</a>
                            <a href="dashboard-oylama.html" class="active">Yarışmalar</a>
                            <a href="dashboard-kullanicilar.html">Kullanıcılar</a>
                        </nav>
                        <div class="buttons">
                            <button id="observerMode">Kullanıcı Modu</button>
                            <button class="profile-btn" style="display:none;" onclick="toggleProfileMenu()">
                                <i class="fas fa-user"></i>
                            </button>
                            <div class="profile-menu" id="profileMenu"></div>
                            <div class="auth-buttons" id="authButtons">
                                <button id="login" onclick="toggleLoginPanel()">Giriş Yap</button>
                                <button id="register" onclick="toggleRegisterPanel()">Kayıt Ol</button>
                            </div>
                        </div>
                    </header>
                    <div class="main-block">
                        <div class="full-page-block">
                            <div class="competition-container">
                                <div class="competition-details">
                                    <img src="images/yarışma.png" alt="Yarışma Fotoğrafı" class="competition-image">
                                    <div class="competition-info">
                                        <div class="competition-name">
                                            <span id="competitionNameText"></span>
                                            <button class="edit-btn hidden" onclick="editCompetitionName()">Düzenle</button>
                                        </div>
                                        <div class="competition-dates">
                                            <span id="competitionDatesText"></span>
                                            <button class="edit-btn hidden" onclick="editCompetitionDates()">Düzenle</button>
                                        </div>
                                    </div>
                                    <div class="competition-actions">
                                        <div id="qrcode" style=>
                                            <button class="copy-link-btn" onclick="copyLink()">Linki Kopyala
                                                <span id="copy-success" class="copy-success-icon">✔️</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div id="content"></div>
                                <button id="addTitleBtn" class="addTitleBtn hidden">Başlık Ekle</button>
                                <button id="addRowBtn" class="addRowBtn hidden">Satır Ekle</button>
                                <div class="project-section">
                                    <h2>Projeler</h2>
                                    <button id="add-project-btn" class="add-project-btn hidden" onclick="openModal()">
                                        <i class="fa-solid fa-circle-plus" style="font-size: 300%;"></i>
                                    </button>
                                    <div class="project-section">
                                        <div id="button-container" class="button-container"></div>
                                    </div>
                                </div>
                            </div>
                            <script>
                                var user = JSON.parse(localStorage.getItem('loggedInUser'));
                                const html = document.getElementsByTagName('html');
                                const pathname = window.location.pathname;
                                const lastSegment = pathname.split('/').pop();
                                let timeoutId = null;
                                const url = window.location.href;
                                const qrCodeDiv = document.getElementById("qrcode");
                                qrcode(url, qrCodeDiv)
                                addproject()
                                login()
                                loginpanel()
                                register()
                                registerpanel()
                                loggeduser()
                                projectfetch()
                                savescroll()
                                loadscroll()
                                savescroll()
                                closeedit()
                                editproject()
                                documents()
                                window.onload = control_user_type;
                            </script>
                </body>
                <script>
                </script>
                </html>
                
`
            const filePath = path.join(__dirname, 'public', `activity-${id}.html`);

            fs.writeFile(filePath, htmlTemplate, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).send('Sunucu hatası');
                } else {
                    res.status(200).send('Etkinlik oluşturuldu');
                }
            });
            // Kayıt başarılı, yanıt olarak kullanıcıyı gönder
        });
    });

});

app.post('/create-project', (req, res) => {
    const { mail, html_id, title, description, universty, student_names, keywords, mentor_name, project_type, puan } = req.body;

    // Query to get user based on email
    const userQuery = 'SELECT * FROM users2.users WHERE mail = ?';
    connection.query(userQuery, [mail], (err, userResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error occurred while retrieving user information.');
        }
        if (userResults.length === 0) {
            // User not found
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResults[0];
        const user_id = user.user_id; // Ensure user_id is declared

        // Query to get challenge based on html_id
        const challengeQuery = 'SELECT * FROM users2.challenges WHERE html_id = ?';
        connection.query(challengeQuery, [html_id], (err, challengeResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error occurred while retrieving challenge information.');
            }
            if (challengeResults.length === 0) {
                // Challenge not found
                return res.status(404).json({ success: false, message: 'Challenge not found' });
            }

            const challenge = challengeResults[0];
            const challenge_id = challenge.challenge_id; // Ensure challenge_id is declared

            // Query to insert new project
            const insertQuery = 'INSERT INTO projects (title, description, universty, student_names, keywords, mentor_name, project_type, puan, user_id, challenge_id, html_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(insertQuery, [title, description, universty, student_names, keywords, mentor_name, project_type, puan, user_id, challenge_id, html_id], (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ success: false, message: 'Error creating project' });
                }
                // Successfully inserted, send response
                res.status(201).json({ success: true, message: 'Project created successfully' });
            });
        });
    });
});

app.get('/projects/:html_id', (req, res) => {
    const html_id = req.params.html_id;

    connection.query('SELECT * FROM projects WHERE html_id = ?', [html_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.delete('/projects/:project_id', (req, res) => {
    const projectId = req.params.project_id;

    connection.query('DELETE FROM projects WHERE project_id = ?', [projectId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json({ message: 'Project deleted successfully' });
    });
});

app.put('/projects/:project_id', (req, res) => {
    const projectId = req.params.project_id;
    const { title } = req.body;

    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    // Update project in the database
    connection.query('UPDATE projects SET title = ? WHERE project_id = ?', [title, projectId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project updated successfully' });
    });
});

app.post('/votes/:project_id', (req, res) => {
    const projectId = req.params.project_id;
    const { kriterlerStr, puanlarStr, user_id } = req.body;


    const query = `INSERT INTO votes (project_id, user_id, points, criterias) VALUES (?, ?, ?, ?);`;

    const values = [projectId, user_id, puanlarStr, kriterlerStr];

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }

        res.json({ message: 'Vote successfully recorded' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

app.put('/api/challenges/:html_id', (req, res) => {
    const html_id = req.params.html_id;
    const { field, value } = req.body;

    let query = '';
    if (field === 'name') {
        query = 'UPDATE challenges SET title = ? WHERE html_id = ?';
    } else if (field === 'dates') {
        query = 'UPDATE challenges SET date = ? WHERE html_id = ?';
    }

    connection.query(query, [value, html_id], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.send({ message: 'Güncelleme başarılı' });
    });
});

app.get('/api/challenges/:html_id', (req, res) => {
    const html_id = req.params.html_id;

    const query = 'SELECT title, date, challenge_id FROM challenges WHERE html_id = ?';
    connection.query(query, [html_id], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send('Veritabanı hatası');
        }
        if (results.length === 0) {
            return res.status(404).send('Yarışma bulunamadı');
        }

        // Başarı durumunda title'ı döndür
        res.json({ success: true, title: results[0].title, date: results[0].date, id: results[0].challenge_id });
    });
});

app.post('/add-to-database', (req, res) => {
    const { type, text, mail, challenge_id } = req.body;

    let query;
    if (type === 'title') {
        query = 'INSERT INTO paragraphs (type, text, mail, challenge_id) VALUES (?, ?, ?, ?)';
    } else if (type === 'paragraph') {
        query = 'INSERT INTO paragraphs (type, text, mail, challenge_id) VALUES (?, ?, ?, ?)';
    }

    connection.query(query, [type, text, mail, challenge_id], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json({ message: 'Data added successfully' });
        }
    });
});

app.get('/get-challenge-id', (req, res) => {
    const html_id = req.query.html_id; // Get html_id from query parameters

    const query = 'SELECT challenge_id FROM challenges WHERE html_id = ?'; // Adjust query as needed

    connection.query(query, [html_id], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json({ challenge_id: results[0].challenge_id });
        }
    });
});

app.get('/get-paragraphs', (req, res) => {
    const challenge_id = req.query.challenge_id;

    const query = 'SELECT id, type, text FROM paragraphs WHERE challenge_id = ?';

    connection.query(query, [challenge_id], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json(results);
        }
    });
});

app.post('/update-content', (req, res) => {
    const { id, newText } = req.body;

    const query = 'UPDATE paragraphs SET text = ? WHERE id = ?';

    connection.query(query, [newText, id], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json({ message: 'Content updated successfully' });
        }
    });
});

app.post('/delete-content', (req, res) => {
    const { id } = req.body;

    const query = 'DELETE FROM paragraphs WHERE id = ?';

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json({ message: 'Content deleted successfully' });
        }
    });
});

app.delete('/delete-activity/:html_id', (req, res) => {
    const html_id = req.params.html_id;

    const sql = 'DELETE FROM challenges WHERE html_id = ?';
    connection.query(sql, [html_id], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Aktivite bulunamadı' });
        }

        res.json({ success: true, message: 'Aktivite başarıyla silindi' });
    });
});

app.get('/activities', (req, res) => {
    const sql = 'SELECT * FROM challenges ORDER BY challenge_id DESC'; // your_order_column, aktiviteleri sıralamak istediğiniz sütun olabilir (örneğin `date`).

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }

        res.json(results);
    });
});
app.put('/edit-activity/:data_id', (req, res) => {
    const data_id = req.params.data_id;
    const { title, date } = req.body;

    const sql = 'UPDATE challenges SET title = ?, date = ? WHERE data_id = ?';
    connection.query(sql, [title, date, data_id], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Aktivite bulunamadı' });
        }

        res.json({ success: true, message: 'Aktivite başarıyla güncellendi' });
    });
});

app.post('/vote_tables/:challenge_id', (req, res) => {
    const challenge_id = req.params.challenge_id;
    const { kriterlerStr, puanlarStr } = req.body;

    const query = `INSERT INTO vote_tables (challenge_id, rowss, columnss) VALUES (?, ?, ?);`;

    const values = [challenge_id, puanlarStr, kriterlerStr];

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }

        res.json({ message: 'Vote successfully recorded' });
    });
});

app.get('/vote_tables/:challenge_id', (req, res) => {
    const challenge_id = req.params.challenge_id;

    connection.query('SELECT * FROM vote_tables WHERE challenge_id = ?', [challenge_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length > 0) {
            const firstResult = results[0];

            let columns, rows;
            try {
                columns = JSON.parse(firstResult.columnss);
                rows = JSON.parse(firstResult.rowss);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse JSON' });
            }

            res.json({
                vote_columns: columns,
                vote_rows: rows,
                vote_challenge_id: firstResult.challenge_id
            });
        } else {
            res.json({
                vote_columns: [],
                vote_rows: []
            });
        }
    });
});


app.put('/vote_tables/:challenge_id', (req, res) => {
    const challenge_id = req.params.challenge_id;
    const { kriterlerStr, puanlarStr } = req.body;

    const query = 'UPDATE vote_tables SET columnss = ?, rowss = ? WHERE challenge_id = ?';
    connection.query(query, [kriterlerStr, puanlarStr, challenge_id], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.send({ message: 'Güncelleme başarılı' });
    });
});

app.post('/oy_paneli/', (req, res) => {
    const { criterias, descriptions, points} = req.body;

    const query = `INSERT INTO oy_paneli (criterias, descriptions, points) VALUES (?, ?, ?);`;

    const values = [criterias, descriptions, points];

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }

        res.json({ message: 'Vote successfully recorded' });
    });
});

app.get('/api/oy_paneli', (req, res) => {
    connection.query('SELECT * FROM oy_paneli', (err, results) => {
        if (err) {
            console.error('Veri çekme hatası:', err);
            res.status(500).json({ error: 'Veri çekme hatası' });
            return;
        }
        res.json(results);
    });
});

//hamza
app.get('/user-info', (req, res) => {
    if (currentUser) {
        res.json({
            success: true,
            user_type: currentUser.user_type
        });
    } else {
        res.status(401).json({ success: false, message: 'Kullanıcı giriş yapmamış' });
    }
});

app.post('/dashboard-kullanicilar/update-role', (req, res) => {
    console.log('Request body:', req.body);  // Inspect request body
    const { user_id, user_type } = req.body;

    // Ensure the role is valid
    const validRoles = ['Admin', 'Editör', 'Jüri', 'Kullanıcı', 'Misafir'];
    if (!validRoles.includes(user_type)) {
        console.log('Invalid role:', user_type);
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const query = 'UPDATE users SET user_type = ? WHERE user_id = ?';
    connection.query(query, [user_type, user_id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        console.log('Role updated successfully for user_id:', user_id);
        res.json({ success: true });
    });
});
app.get('/dashboard-kullanicilar/current-user', (req, res) => {
    if (req.user) {
        // Ensure that user_type is included in the user data
        res.json({
            username: req.user.username,
            user_type: req.user.user_type
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.post('/login2', (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(400).send('E-posta ve şifre gereklidir.');
    }

    const sql = 'SELECT * FROM users WHERE mail = ?';
    connection.query(sql, [mail], (err, results) => {
        if (err) {
            return res.status(500).send('Kullanıcı bilgileri alınırken hata oluştu.');
        }
        if (results.length === 0) {
            // Kullanıcı bulunamadı
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        const user = results[0];

        // Şifreyi karşılaştır
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Şifre karşılaştırma hatası.');
            }
            if (isMatch) {
                // Giriş başarılı, kullanıcı bilgilerini JSON olarak döndür
                currentUser = {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    mail: user.mail,
                    user_type: user.user_type // Set the global variable
                };
                res.json({
                    success: true,
                    user: currentUser
                });
            } else {
                // Yanlış şifre
                return res.status(401).json({ success: false, message: 'Şifre yanlış' });
            }
        });
    });
});

app.get('/users', (req, res) => {
    const query = 'SELECT user_id, first_name, last_name, mail, user_type FROM users ';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ users: results });
    });
});

app.get('/data', (req, res) => {
    const query = 'SELECT criterias, descriptions, points FROM oy_paneli';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        // Responsta sonuçları döner
        res.json({ data: results });
    });
});









