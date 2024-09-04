function copyLink() {
    const pageUrl = window.location.href;
    const copyButton = document.querySelector(".copy-link-btn");
    const successIcon = document.getElementById("copy-success");

    // Kopyalama işlemi
    navigator.clipboard.writeText(pageUrl).then(function () {
        // Eğer varsa, önceki timeoutId'yi temizle
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Buton yazısını değiştir
        copyButton.textContent = "Kopyalandı ✔";
        copyButton.style.backgroundColor = '#0665ca';

        // 2 saniye sonra tik işaretini gizle ve buton yazısını geri al
        timeoutId = setTimeout(function () {
            copyButton.textContent = "Linki Kopyala";
            copyButton.style.backgroundColor = '#034182';
        }, 2000); // 2 saniye sonra yazıyı geri al ve tik işaretini gizle
    }, function (err) {
        console.error("Link kopyalanamadı.", err);
    });
}
function openVoteModal(project) {
    const voteModal = document.getElementById('voteModal');
    const modalContent = document.getElementById('modal-content'); // ID'yi güncelledim
    const saveVoteButton = document.getElementById('saveVoteButton');
    const closeVoteModalButton = document.getElementById('closeVoteModalButton');
    const criteriaContainer = document.getElementById('criteriaContainer');
    const voteForm = document.getElementById('voteForm');
    const html = document.querySelector('html'); // HTML referansını güncelledim
    const criteria_list = [1, 3, 5, 8]
    html.style.overflow = "hidden";

    // Temizle ve kriterleri dinamik olarak oluştur
    if (criteriaContainer) {
        criteriaContainer.innerHTML = '';
    }
    for (let i of criteria_list) {
        const criteriaDiv = document.createElement('div');
        criteriaDiv.className = 'criteria-item';

        const label = document.createElement('label');
        label.textContent = `Criteria ${i}:`;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `criteria${i}`;
        input.placeholder = `Oy ${i}`;

        criteriaDiv.appendChild(label);
        criteriaDiv.appendChild(input);
        criteriaContainer.appendChild(criteriaDiv);
    }

    // Paneli görünür yap
    voteModal.style.display = 'block';

    // Kaydet butonuna tıklama olay dinleyicisi ekle
    saveVoteButton.addEventListener('click', () => {
        const formData = new FormData(voteForm);
        const criteria = [];
        for (let i of criteria_list) {
            const value = formData.get(`criteria${i}`);
            criteria.push(value || '');  // Varsayılan olarak boş string
        }
        fetch('/votes/34', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectId: 34,
                criteria // Dinamik olarak oluşturulmuş kriterler nesnesi
            }),
        }).then(response => response.json())
            .then(data => {
            })
            .catch(error => {
                console.error('Fetch Error:', error);
            });
        voteModal.style.display = 'none';
        html.style.overflow = "";
    });

    // Kapatma butonuna olay dinleyici ekle
    closeVoteModalButton.addEventListener('click', () => {
        voteModal.style.display = 'none';
        html.style.overflow = "";
    });

    // Modalın dışına tıklanıldığında paneli kapat
    voteModal.addEventListener('click', (event) => {
        if (event.target === voteModal) {
            voteModal.style.display = 'none';
            html.style.overflow = "";
        }
    });
}
function openEditModal(project) {
    const editmodal = document.getElementById('editmodal')
    const html = document.querySelector('html'); // HTML referansını güncelledim
    html.style.overflow = "hidden";

    document.getElementById('edit-project-id').value = project.project_id;
    document.getElementById('edit-title').value = project.title;
    document.getElementById('edit-description').value = project.description || '';
    editmodal.style.display = 'block';
    document.getElementById('close').addEventListener('click', () => {
        editmodal.style.display = 'none';
        html.style.overflow = "";

    })
    editmodal.addEventListener('click', (event) => {
        if (event.target === editmodal) {
            editmodal.style.display = 'none';
            html.style.overflow = "";
        }
    });
}
function openProjectModal(project) {
    // Paneli seç
    const html = document.querySelector('html'); // HTML referansını güncelledim
    html.style.overflow = "hidden";
    const modal = document.getElementById('projectPanel');

    // Proje bilgilerini doldur
    document.getElementById('proje-basligi').textContent = project.title || 'Proje Adı Yok';
    document.getElementById('aciklama').textContent = project.description || 'Açıklama Yok';
    document.getElementById('universite-bolum').textContent = project.universty || 'Bilinmiyor';
    document.getElementById('ogrenci-isimleri').textContent = project.student_names || 'Bilinmiyor';
    document.getElementById('anahtar-kelimeler').textContent = project.keywords || 'Bilinmiyor';
    document.getElementById('mentor-isimleri').textContent = project.mentor_name || 'Bilinmiyor';
    document.getElementById('proje-tipi').textContent = project.project_type || 'Bilinmiyor';

    // Paneli görünür yap
    modal.style.display = 'block';

    // Kapatma butonuna olay dinleyici ekle
    document.getElementById('closeButton').addEventListener('click', () => {
        modal.style.display = 'none';
        html.style.overflow = "";
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            html.style.overflow = "";
        }
    });
}
function refreshPage() {
    window.location.reload();
}
function addproject() {
    document.getElementById('projectForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var user = JSON.parse(localStorage.getItem('loggedInUser'));
        const mail = user.mail;
        const html_id = lastSegment;
        const title = document.getElementById('proje-basligi').value;
        const description = document.getElementById('aciklama').value;
        const universty = document.getElementById('universite-bolum').value;
        const student_names = document.getElementById('ogrenci-isimleri').value;
        const keywords = document.getElementById('anahtar-kelimeler').value;
        const mentor_name = document.getElementById('mentor-isimleri').value;
        const project_type = document.getElementById('proje-tipi').value;
        const puan = 0.0;
        if (title && project_type) {
            fetch('/create-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mail, html_id, title, description, universty, student_names, keywords, mentor_name, project_type, puan })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error creating project.');
                    }
                    return response.text();
                })
                .then(message => {
                    closeModal();
                    document.getElementById('projectForm').reset();
                    refreshPage();
                })
                .catch(error => console.error('Error:', error));
        } else {
            alert('Başlık ve proje tipi gerekli.');
        }
    })
}
function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.scrollY);
}
function restoreScrollPosition() {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition !== null) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
    }
}
function openModal() {
    const html = document.querySelector('html'); // HTML referansını güncelledim
    const projectModal = document.getElementById('projectModal')
    html.style.overflow = "hidden";
    projectModal.style.display = 'block';
    projectModal.addEventListener('click', (event) => {
        if (event.target === projectModal) {
            projectModal.style.display = 'none';
            html.style.overflow = "";
        }
    });

}
function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
    closeVoteModalButton.addEventListener('click', () => {
        voteModal.style.display = 'none';
        html.style.overflow = "";
    });

    // Modalın dışına tıklanıldığında paneli kapat
    voteModal.addEventListener('click', (event) => {
        if (event.target === voteModal) {
            voteModal.style.display = 'none';
            html.style.overflow = "";
        }
    });
}
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
        menu.innerHTML = `
                  <div class="profile-info">
                      <h3>${user.first_name} ${user.last_name} <span class="user-type">(${user.user_type})</span></h3>
                      <p>${user.mail}</p>
                  </div>
          </div >
          <button class="account-settings-link" onclick="window.location.href='profile-settings.html'"> Account Settings </button>
          <button class="logout-btn" onclick="logout()"> Logout </button>
          `
    } else {
        menu.innerHTML = '';
    }
}
function logout() {
    localStorage.removeItem('loggedInUser');
    refreshPage();
}
function toggleRegisterPanel() {
    const registerPanel = document.getElementById('registerPanel');
    registerPanel.style.display = registerPanel.style.display === 'block' ? 'none' : 'block';
}
function toggleLoginPanel() {
    const loginPanel = document.getElementById('loginPanel');
    loginPanel.style.display = loginPanel.style.display === 'block' ? 'none' : 'block';
}
function qrcode(url, qrCodeDiv) {
    new QRCode(qrCodeDiv, {
        text: url,
        width: 128,
        height: 128
    });
}
function login() {
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Formun varsayılan davranışını engelle

        const mail = document.getElementById('mail').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mail, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Kullanıcı bilgilerini localStorage'a kaydet
                    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                    refreshPage()
                } else {
                    // Giriş başarısız, hata mesajı göster
                    alert('Giriş başarısız.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}
function loginpanel() {
    document.addEventListener('click', function (event) {
        const loginPanel = document.getElementById('loginPanel');
        const loginButton = document.getElementById('login');

        if (!loginPanel.contains(event.target) && !loginButton.contains(event.target)) {
            // Login panelinin dışına tıklandıysa paneli gizle
            loginPanel.style.display = 'none';
        }
    });
}
function register() {
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
}
function registerpanel() {
    document.addEventListener('click', function (event) {
        const registerPanel = document.getElementById('registerPanel');
        const registerButton = document.getElementById('register');

        if (!registerPanel.contains(event.target) && !registerButton.contains(event.target)) {
            // Register panelinin dışına tıklandıysa paneli gizle
            registerPanel.style.display = 'none';
        }
    });
}
function loggeduser() {
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
}
function projectfetch() {
    fetch(`/projects/${lastSegment}`)
        .then(response => response.json())
        .then(data => {
            const buttonContainer = document.getElementById('button-container');
            buttonContainer.innerHTML = ''; // Clear any existing content

            // Create a block for each project
            data.forEach(project => {
                const projectBlock = document.createElement('div');
                projectBlock.className = 'project-block';
                projectBlock.dataset.id = project.project_id; // Store project ID for potential use

                // Project title and description
                const title = document.createElement('h3');
                title.textContent = project.title;
                projectBlock.appendChild(title);

                // Buttons container
                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'buttons-container';

                // ShowProject button
                const ShowProjectButton = document.createElement('button');
                ShowProjectButton.className = 'show-project-button';
                ShowProjectButton.textContent = 'Projeyi Göster';
                ShowProjectButton.addEventListener('click', () => openProjectModal(project));
                buttonsContainer.appendChild(ShowProjectButton);

                // Vote button
                const VoteButton = document.createElement('button');
                VoteButton.id = 'vote-button';
                VoteButton.className = 'vote-button hidden';
                VoteButton.textContent = 'Oy Ver';
                VoteButton.addEventListener('click', () => openVoteModal(project));
                buttonsContainer.appendChild(VoteButton);

                // Edit button
                const editButton = document.createElement('button');
                editButton.id = 'edit-btn';
                editButton.className = 'edit-btn hidden';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => openEditModal(project));
                buttonsContainer.appendChild(editButton);

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.id = 'delete-btn';
                deleteButton.className = 'delete-btn hidden';
                deleteButton.textContent = 'X';
                deleteButton.addEventListener('click', () => {
                    if (confirm("Are you sure you want to delete this project?")) {

                        fetch(`/projects/${project.project_id}`, {
                            method: 'DELETE'
                        })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message);
                                projectBlock.remove(); // Remove the block from the UI
                            })
                            .catch(error => {
                                console.error('Error deleting project:', error);
                            });
                    } else {
                    }
                });
                buttonsContainer.appendChild(deleteButton);
                buttonsContainer.appendChild(editButton)
                buttonsContainer.append(VoteButton)
                buttonsContainer.append(ShowProjectButton)
                projectBlock.appendChild(buttonsContainer);
                buttonContainer.appendChild(projectBlock);
            });
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
        });
}
function savescroll() {
    window.addEventListener('beforeunload', () => {
        const scrollY = window.scrollY || window.pageYOffset;
        sessionStorage.setItem('scrollPosition', scrollY);
    });
}
function loadscroll() {
    window.addEventListener('load', () => {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition, 10));
            sessionStorage.removeItem('scrollPosition'); // Konumu bir kez yükledikten sonra temizle
        }
    });
}
function closeedit() {

}
function editproject() {
    document.getElementById('editForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const projectId = document.getElementById('edit-project-id').value;
        const title = document.getElementById('edit-title').value;
        const description = document.getElementById('edit-description').value;

        fetch(`/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description
            }),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                location.reload(); // Reload to reflect changes
            })
            .catch(error => {
                console.error('Error updating project:', error);
            });

        document.getElementById('editmodal').style.display = 'none';
    });
}
function editCompetitionName() {
    const currentName = document.getElementById('competitionNameText').textContent;
    const newName = prompt('Yeni yarışma adını girin:', currentName);

    if (newName) {
        updateCompetitionInfo('name', newName);
    }
}
function editCompetitionDates() {
    const currentDates = document.getElementById('competitionDatesText').textContent;
    const newDates = prompt('Yeni yarışma tarihlerini girin:', currentDates);

    if (newDates) {
        updateCompetitionInfo('dates', newDates);
    }
}
function updateCompetitionInfo(field, value) {
    const html_id = window.location.pathname.split('/').pop(); // Bu id'yi dinamik olarak ayarlamanız gerekebilir

    fetch(`/api/challenges/${html_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field, value })
    })
        .then(response => response.json())
        .then(data => {
            if (field === 'name') {
                document.getElementById('competitionNameText').textContent = value;
            } else if (field === 'dates') {
                document.getElementById('competitionDatesText').textContent = value;
            }
        })
        .catch(error => console.error('Error updating challenge data:', error));
}
function updateButton(mode) {
    const button = document.getElementById('observerMode');

    // Modu ve görünümü güncelle
    if (mode === '1') {
        button.textContent = 'Yönetici Modu';
        button.classList.add('admin');
        button.classList.remove('user');
    } else {
        button.textContent = 'Kullanıcı Modu';
        button.classList.add('user');
        button.classList.remove('admin');
    }
}
function documents() {
    document.addEventListener('DOMContentLoaded', () => {
        fetch(`/api/challenges/${lastSegment}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.title) {
                    document.getElementById('competitionNameText').textContent = data.title;
                }
                if (data && data.date) {
                    document.getElementById('competitionDatesText').textContent = data.date;
                } else {
                    console.error('Title bulunamadı veya yanlış veri formatı:', data);
                }
            })
            .catch(error => console.error('Veri alımında hata oluştu:', error));
    });
    document.addEventListener('DOMContentLoaded', () => {
        const button = document.getElementById('observerMode');

        // Mevcut gözlem modunu al ve butonu güncelle
        const currentMode = localStorage.getItem('observerMode') || '0';
        updateButton(currentMode);

        // Buton tıklanırsa gözlem modunu değiştir
        button.addEventListener('click', () => {
            const currentMode = localStorage.getItem('observerMode') || '0';
            const newMode = currentMode === '0' ? '1' : '0';
            localStorage.setItem('observerMode', newMode);
            updateButton(newMode);
            refreshPage()
        });
    });
    document.addEventListener('DOMContentLoaded', function () {
        fetch(`/get-challenge-id?html_id=${lastSegment}`)
            .then(response => response.json())
            .then(data => {
                if (data.challenge_id) {
                    challenge_id = data.challenge_id;
                    loadExistingContent(challenge_id);
                    document.getElementById('addTitleBtn').addEventListener('click', function () {
                        const title = prompt("Başlık girin:");

                        if (title) {
                            fetch('/add-to-database', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    type: 'title',
                                    text: title,
                                    mail: user.mail,
                                    challenge_id
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Title added:', data);
                                    addContentBlock(title, 'title', data.id);
                                })
                                .catch(error => {
                                    console.error('Error adding title:', error);
                                });
                        }

                    });

                    document.getElementById('addRowBtn').addEventListener('click', function () {
                        const rowText = prompt("Satır metnini girin:");

                        if (rowText) {
                            fetch('/add-to-database', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    type: 'paragraph',
                                    text: rowText,
                                    mail: user.mail,
                                    challenge_id
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Row added:', data);
                                    addContentBlock(rowText, 'paragraph', data.id);
                                })
                                .catch(error => {
                                    console.error('Error adding row:', error);
                                });
                        }
                    });
                } else {
                    console.error('Challenge ID not found');
                }
            })
            .catch(error => {
                console.error('Error fetching challenge ID:', error);
            });

        function addContentBlock(text, type, id) {
            const contentDiv = document.getElementById('content');
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('content-block');

            const block = document.createElement('p');
            block.textContent = text;

            if (type === 'title') {
                block.classList.add('title');
            } else if (type === 'paragraph') {
                block.classList.add('paragraph');
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.id = 'button';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => editContent(id, text, type);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.id = 'button';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteContent(id);
            const gözlem = parseInt(localStorage.getItem('observerMode'));
            if (user.user_type === 'Admin' || user.user_type === 'Editör') {
                if (gözlem === 1) {
                    buttonContainer.appendChild(editBtn);
                    buttonContainer.appendChild(deleteBtn);
                }
            }
            blockContainer.appendChild(block);
            blockContainer.appendChild(buttonContainer);

            contentDiv.appendChild(blockContainer);
        }

        function editContent(id, text, type) {
            const newText = prompt("Yeni metni girin:", text);

            if (newText) {
                fetch('/update-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id,
                        newText
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Content updated:', data);
                        location.reload(); // Reload to get updated content
                    })
                    .catch(error => {
                        console.error('Error updating content:', error);
                    });
            }
        }

        function deleteContent(id) {
            fetch('/delete-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Content deleted:', data);
                    location.reload(); // Reload to remove deleted content
                })
                .catch(error => {
                    console.error('Error deleting content:', error);
                });
        }

        function loadExistingContent(challenge_id) {
            fetch(`/get-paragraphs?challenge_id=${challenge_id}`)
                .then(response => response.json())
                .then(data => {
                    data.forEach(block => {
                        addContentBlock(block.text, block.type, block.id);
                    });
                })
                .catch(error => {
                    console.error('Error loading content:', error);
                });
        }
    });
}
function control_user_type() {
    const gözlem = parseInt(localStorage.getItem('observerMode'));
    const add_project_buttons = document.querySelectorAll('.add-project-btn');
    const edit_buttons = document.querySelectorAll('.edit-btn');
    const delete_buttons = document.querySelectorAll('.delete-btn');
    const vote_buttons = document.querySelectorAll('.vote-button');
    const title_date = document.querySelectorAll('.edit-btn');
    const add_title = document.querySelectorAll('.addTitleBtn');
    const add_row = document.querySelectorAll('.addRowBtn');
    const del_par = document.querySelectorAll('.delete-btn');
    const edit_par = document.querySelectorAll('.edit-btn')
    // Kullanıcı türünü ve gözlem modunu kontrol et
    if (user.user_type === 'Admin' || user.user_type === 'Editör') {
        if (gözlem === 1) {
            add_project_buttons.forEach(btn => btn.classList.remove('hidden'));
            edit_buttons.forEach(btn => btn.classList.remove('hidden'));
            delete_buttons.forEach(btn => btn.classList.remove('hidden'));
            title_date.forEach(btn => btn.classList.remove('hidden'));
            add_title.forEach(btn => btn.classList.remove('hidden'));
            add_row.forEach(btn => btn.classList.remove('hidden'));
            del_par.forEach(btn => btn.classList.remove('hidden'));
            edit_par.forEach(btn => btn.classList.remove('hidden'));
        }
    }

    if (user.user_type === 'Admin' || user.user_type === 'Editör' || user.user_type === 'Jüri' || user.user_type === 'Kullanıcı' || user.user_type === 'Misafir') {
        vote_buttons.forEach(btn => btn.classList.remove('hidden'));
    }
}