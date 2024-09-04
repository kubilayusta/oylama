const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const app = express();

const saltRounds = 10;
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hamza123sena.', // Şifreyi gizli bir şekilde saklayın
    database: 'users2'
});
const fs = require('fs');

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




app.get('/api/current-user', (req, res) => {
    // Assuming you have user data stored in req.user from your authentication middleware
   if (req.user) {
        res.json(req.user);
   } else {
        res.status(401).send('Unauthorized');
    }
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






// Ana sayfa yönlendirmesi

app.get('/', (_req, res) => {
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

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { first_name, last_name, mail, password } = req.body;

    // Geçerli ENUM değerlerini kontrol edin

    // Şifreyi hash'le
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Hashleme hatası:', err);
            return res.status(500).json({ success: false });

        }


        // Kullanıcıyı veritabanına ekle
        const query = 'INSERT INTO users (first_name, last_name, mail, password) VALUES (?, ?, ?, ?)';
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

var currentUser = null;
// Giriş işlemi
app.post('/login', (req, res) => {
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

// Aktivite Oluşturma
app.post('/create-activity', (req, res) => {
    const { id, title, date, description, rules, criteria, votingCriteria } = req.body;

    const query = 'INSERT INTO challenges (title, date, description, rules, criteria) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [title, date, description, rules, criteria], (error, results) => {
        if (error) {
            console.error('Veritabanı hatası:', error);
            return res.status(500).json({ success: false });
        }
        let htmlTemplate = `
        <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
          crossorigin="anonymous" referrerpolicy="no-referrer" />
      <link rel="stylesheet" href="style.css">
      <title>Document</title>
  </head>
  
  <body>
  
      <div class="login-panel" id="loginPanel">
          <form id="loginForm">
              <label for="email">E-posta</label>
              <input type="email" id="email" placeholder="E-posta">
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
  
              <label for="email">E-Posta:</label>
              <input type="email" id="email" name="email" required>
  
              <label for="password">Şifre:</label>
              <input type="password" id="password" name="password" required>
  
              <label for="userType">Kullanıcı Tipi:</label>
              <select id="userType" name="userType" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
              </select>
  
              <button type="submit">Kayıt Ol</button>
          </form>
  
          <div class="message" id="message"></div>
          <div class="error" id="error"></div>
      </div>
  
      <script>
          function toggleLoginPanel() {
              const loginPanel = document.getElementById('loginPanel');
              loginPanel.style.display = loginPanel.style.display === 'block' ? 'none' : 'block';
          }
  
          document.getElementById('loginForm').addEventListener('submit', function (event) {
              event.preventDefault(); // Formun varsayılan davranışını engelle
  
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
  
              fetch('/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password })
              })
                  .then(response => response.json())
                  .then(data => {
                      if (data.success) {
                          // Kullanıcı bilgilerini localStorage'a kaydet
                          localStorage.setItem('loggedInUser', JSON.stringify(data.user));
  
                          // Dashboard'a yönlendir
                          window.location.href = 'dashboard.html';
                      } else {
                          // Giriş başarısız, hata mesajı göster
                          alert('Giriş başarısız.');
                      }
                  })
                  .catch(error => {
                      console.error('Error:', error);
                  });
          });
  
          document.addEventListener('click', function (event) {
              const loginPanel = document.getElementById('loginPanel');
              const loginButton = document.getElementById('login');
  
              if (!loginPanel.contains(event.target) && !loginButton.contains(event.target)) {
                  // Login panelinin dışına tıklandıysa paneli gizle
                  loginPanel.style.display = 'none';
              }
          });
          function toggleRegisterPanel() {
              const registerPanel = document.getElementById('registerPanel');
              registerPanel.style.display = registerPanel.style.display === 'block' ? 'none' : 'block';
          }
  
          document.getElementById('registerForm').addEventListener('submit', function (event) {
              event.preventDefault();
  
              const formData = new FormData(this);
              const jsonData = {};
  
              formData.forEach((value, key) => {
                  jsonData[key] = value;
              });
  
              fetch('/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(jsonData)
              })
                  .then(response => response.json())
                  .then(data => {
                      const messageDiv = document.getElementById('message');
                      const errorDiv = document.getElementById('error');
  
                      if (data.success) {
                          messageDiv.textContent = 'Hesap başarıyla oluşturuldu!';
                          errorDiv.textContent = ''; // Hata mesajını temizle
                      }
                      else {
                          errorDiv.textContent = 'Kayıt başarısız oldu. Lütfen tekrar deneyin.';
                      }
                  })
                  .catch(error => {
                      console.error('Error:', error);
                      document.getElementById('error').textContent = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
                  });
          });
  
          document.addEventListener('click', function (event) {
              const registerPanel = document.getElementById('registerPanel');
              const registerButton = document.getElementById('register');
  
              if (!registerPanel.contains(event.target) && !registerButton.contains(event.target)) {
                  // Register panelinin dışına tıklandıysa paneli gizle
                  registerPanel.style.display = 'none';
              }
          });
  
      </script>
      <header class="header">
          <a href="https://www.havelsan.com.tr" class="logo" target="_blank">
              <img src="images/havelsan.png" alt="logo" />
          </a>
          <nav class="navbar">
              <a href="/">Ana Sayfa</a>
              <a href="dashboard-program.html">Program</a>
              <a href="dashboard-oylama.html" class="active">Yarışmalar</a>
              <a href="dashboard-kullanıcılar.html">Kullanıcılar</a>
          </nav>
          <div class="buttons">
              <button class="profile-btn" style="display:none;" onclick="toggleProfileMenu()">
                  <i class="fas fa-user"></i>
              </button>
              <div class="profile-menu" id="profileMenu"></div>
  
              <!-- Login ve Register Butonları -->
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
                      <img src="images/" alt="Yarışma Fotoğrafı" class="competition-image">
                      <div class="competition-info">
                          <div class="competition-name">${title}</div>
                          <div class="competition-dates">${date}</div>
                      </div>
                  </div>
                  <div class="competition-actions">
                      <button class="add-project-btn">Proje Ekle</button>
                      <button class="copy-link-btn">linki kopyala</button>
                  </div>
              </div>
              <div class="tanım">
                  <h2>Tanım</h2>
                  <p>${description}</p>
              </div>
  
              <div class="kurallar">
                  <h2>Kurallar</h2>
                  <p>${rules}</p>
              </div>
  
              <div class="oylama-kriterleri">
                  <h2>Oylama Kriterleri</h2>
                  <p>${criteria}</p>
              </div>
  
              <div class="katılımcılar">
                  <div class="search-filter-container">
                      <input type="text" placeholder="Proje Ara..." class="search-box">
                      <button class="filter-btn">Filtrele</button>
                  </div>
                  <div class="project-row">
                      <button class="project-box" data-project-id="1">
                          Proje 1
                      </button>
                      <button class="project-box" data-project-id="2">
                          Proje 2
                      </button>
                  </div>
                  <div class="project-row">
                      <button class="project-box" data-project-id="3">
                          Proje 3
                      </button>
                      <button class="project-box" data-project-id="4">
                          Proje 4
                      </button>
                  </div>
                  <!-- Daha fazla proje eklenebilir -->
                  <!-- Hidden panel for project details -->
                  <div id="projectPanel" class="project-panel">
                      <button id="closePanel" class="close-btn">&times;</button>
                      <div class="panel-content">
                          <h2 id="projectTitle">Proje Başlığı</h2>
                          <p id="projectdescriptionription">Proje açıklaması burada görünecek.</p>
                          <div class="rating-grid">
                              <!-- 5x5 oylama sistemi -->
                              <div class="rating-column">
                                  <input type="radio" id="rating1-5" name="rating1" value="5"><label
                                      for="rating1-5">5</label>
                                  <input type="radio" id="rating1-4" name="rating1" value="4"><label
                                      for="rating1-4">4</label>
                                  <input type="radio" id="rating1-3" name="rating1" value="3"><label
                                      for="rating1-3">3</label>
                                  <input type="radio" id="rating1-2" name="rating1" value="2"><label
                                      for="rating1-2">2</label>
                                  <input type="radio" id="rating1-1" name="rating1" value="1"><label
                                      for="rating1-1">1</label>
                              </div>
                              <!-- Similar columns for 2 to 5 -->
                              <div class="rating-column">
                                  <input type="radio" id="rating2-5" name="rating2" value="5"><label
                                      for="rating2-5">5</label>
                                  <input type="radio" id="rating2-4" name="rating2" value="4"><label
                                      for="rating2-4">4</label>
                                  <input type="radio" id="rating2-3" name="rating2" value="3"><label
                                      for="rating2-3">3</label>
                                  <input type="radio" id="rating2-2" name="rating2" value="2"><label
                                      for="rating2-2">2</label>
                                  <input type="radio" id="rating2-1" name="rating2" value="1"><label
                                      for="rating2-1">1</label>
                              </div>
                              <!-- Continue for other columns -->
                          </div>
                          <button id="submitRating">Oylamayı Gönder</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      </div>
      </div>
      </div>
  
      <script>
          function toggleProfileMenu() {
              var menu = document.getElementById('profileMenu');
              menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
              updateProfileMenu();
          }
  
          function updateProfileMenu() {
              var menu = document.getElementById('profileMenu');
              var user = JSON.parse(localStorage.getItem('loggedInUser'));
  
              if (user) {
                  // User is logged in
                  menu.innerHTML = \`
                      < div class="profile-header" >
                          <div class="profile-info">
                              <h3>\${user.first_name} \${user.last_name} <span class="user-type">(\${user.userType})</span></h3>
                              <p>\${user.email}</p>
                          </div>
                  </div >
                  <button class="account-settings-link" onclick="window.location.href='profile-settings.html'"> Account Settings </button>
                  <button class="logout-btn" onclick="logout()"> Logout </button>
                  \`
              } else {
                  menu.innerHTML = '';
              }
          }
  
          function logout() {
              localStorage.removeItem('loggedInUser');
              window.location.href = 'dashboard.html';
          }
  
          document.addEventListener('DOMContentLoaded', function () {
              const user = JSON.parse(localStorage.getItem('loggedInUser'));
              const profileBtn = document.querySelector('.profile-btn');
              const authButtons = document.getElementById('authButtons');
  
              if (user) {
                  // Kullanıcı oturum açmışsa profil butonunu göster
                  profileBtn.style.display = 'block';
                  authButtons.style.display = 'none';
              } else {
                  // Kullanıcı oturum açmamışsa giriş ve kayıt butonlarını göster
                  profileBtn.style.display = 'none';
                  authButtons.style.display = 'flex';
              }
          });
      </script>
      <script>
          // Kapama düğmesine tıklanıldığında paneli gizleme
          document.getElementById('closePanel').addEventListener('click', function () {
              document.getElementById('projectPanel').style.display = 'none';
          });
  
          // Proje panelini gösterme
          function showProjectPanel(projectId) {
              const panel = document.getElementById('projectPanel');
              const title = document.getElementById('projectTitle');
              const descriptionription = document.getElementById('projectdescriptionription');
  
              // Örnek içerik; gerçek içerik sunucudan gelebilir
              title.textContent = 'Proje ${id} Başlığı';
              descriptionription.textContent = 'Proje ${id} açıklaması.';
  
              panel.style.display = 'flex'; // Flex kullanarak ortala
          }
  
          // Proje butonlarına tıklama olayları
          document.querySelectorAll('.project-box').forEach(button => {
              button.addEventListener('click', function () {
                  const projectId = this.getAttribute('data-project-id');
                  showProjectPanel(projectId);
              });
          });
  
          // Panel dışına tıklanırsa paneli kapatma
          document.addEventListener('click', function (event) {
              const panel = document.getElementById('projectPanel');
              if (panel.style.display === 'flex' && !panel.contains(event.target) && !event.target.classList.contains('project-box')) {
                  panel.style.display = 'none';
              }
          });
      </script>
  </body>
  
  </html>
    `
        htmlTemplate = htmlTemplate
            .replace(/\\\$/g, '$') // \${} içindeki $ işaretlerini $
            .replace(/\\`/g, '`'); // \ işaretlerini ` işaretlerine dönüştür

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




// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});





