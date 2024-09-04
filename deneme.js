const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kubilayusta-57', // Şifreyi gizli bir şekilde saklayın
    database: 'users2'
});

connection.connect();

const challengeId = 3;
const projectIds = [];

connection.query('SELECT project_id FROM projects WHERE challenge_id = ?', [challengeId], (error, results) => {
  if (error) throw error;

  results.forEach(row => {
    projectIds.push(row.project_id);
  });

  console.log(projectIds); // Burada projectIds dizisinde tüm project_id'ler depolanmış olacak
  projectIds.forEach(projectId => {
    const button = document.createElement('button');
    button.textContent = `Project ${projectId}`;
    button.id = `project-button-${projectId}`;
    button.className = 'project-button';

    // Butona tıklama olayı ekle
    button.addEventListener('click', () => {
        console.log(`Project ${projectId} button clicked`);
        // Buraya tıklandığında yapılacak işlemi ekle
    });

    buttonsContainer.appendChild(button);
});
});

connection.end();


