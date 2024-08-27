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
  password: 'kubilayusta-57', // Şifreyi gizli bir şekilde saklayın
  database: 'users'
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

// Ana sayfa yönlendirmesi

app.get('/', (_req, res) => {
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
  const { first_name, last_name, email, password, userType } = req.body;

  // Geçerli ENUM değerlerini kontrol edin
  const validUserTypes = ['admin', 'user'];
  if (!validUserTypes.includes(userType)) {
    return res.status(400).json({ success: false, message: 'Geçersiz kullanıcı türü' });
  }

  // Şifreyi hash'le
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Hashleme hatası:', err);
      return res.status(500).json({ success: false });
    }

    // Kullanıcıyı veritabanına ekle
    const query = 'INSERT INTO users (first_name, last_name, email, password, userType) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [first_name, last_name, email, hash, userType], (error, results) => {
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
          email,
          userType
        }
      });
    });
  });
});


// Giriş işlemi
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('E-posta ve şifre gereklidir.');
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
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
            email: user.email,
            userType: user.userType
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
  const { id, title, description } = req.body;
  const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link rel="stylesheet" href="style.css">
      </head>
      <body>
          <header>
              <!-- Header içeriği -->
          </header>
          <main>
              <h1>${title}</h1>
              <p>${description}</p>
              <!-- Etkinlik ile ilgili diğer içerikler -->
          </main>
          <footer>
              <!-- Footer içeriği -->
          </footer>
      </body>
      </html>
  `;

  const filePath = path.join(__dirname, 'public', `activity-${id}.html`);

  fs.writeFile(filePath, htmlTemplate, (err) => {
      if (err) {
          console.error('Error writing file:', err);
          res.status(500).send('Sunucu hatası');
      } else {
          res.status(200).send('Etkinlik oluşturuldu');
      }
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});





