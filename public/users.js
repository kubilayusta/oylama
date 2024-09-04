document.addEventListener('DOMContentLoaded', function() {
    fetch('/users')
                .then(response => response.json())
                .then(data => {
                    const usersTable = document.querySelector('#usersTable tbody');
                    usersTable.innerHTML = ''; // Clear existing content
                    data.users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.user_id}</td>
                            <td>${user.first_name}</td>
                            <td>${user.last_name}</td>
                            <td>${user.mail}</td>
                            <td id = "admin-column" class="admin-column hidden">
                                <div class="btn-group">
                                    <button class="btn ${user.user_type === 'Kullanıcı' ? 'selected' : ''}" data-role="Kullanıcı" data-id="${user.user_id}">Kullanıcı</button>
                                    <button class="btn ${user.user_type === 'Jüri' ? 'selected' : ''}" data-role="Jüri" data-id="${user.user_id}">Jüri</button>
                                    <button class="btn ${user.user_type === 'Editör' ? 'selected' : ''}" data-role="Editör" data-id="${user.user_id}">Editör</button>
                                    <button class="btn ${user.user_type === 'Admin' ? 'selected' : ''}" data-role="Admin" data-id="${user.user_id}">Admin</button>
                                </div>
                            </td>
                        `;
                        usersTable.appendChild(row);
                    });

                    // Add event listener for button clicks
                    usersTable.addEventListener('click', function(event) {
                        if (event.target.classList.contains('btn')) {
                            // Remove 'selected' class from all buttons in the same row
                            const row = event.target.closest('tr');
                            const buttons = row.querySelectorAll('.btn');
                            buttons.forEach(btn => btn.classList.remove('selected'));

                            // Add 'selected' class to the clicked button
                            event.target.classList.add('selected');

                            // Get user ID and new role
                            const userId = event.target.getAttribute('data-id');
                            const newRole = event.target.getAttribute('data-role');

                            // Send update request to the server
                            updateUserRole(userId, newRole);
                        }
                    });

                    // Set column visibility after data is populated
                    setColumnVisibility(user.user_type);
                })
        })

function updateUserRole(userId, newRole) {
    console.log(`Updating user ${userId} to role ${newRole}`); // Debugging line
    fetch('/dashboard-kullanicilar/update-role', { // Update this line
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, user_type: newRole }),
    })
    .then(response => response.text()) // Get response as text
    .then(text => {
        console.log('Raw response:', text); // Log raw response text
        try {
            const data = JSON.parse(text); // Attempt to parse JSON
            if (data.success) {
                console.log('Role updated successfully');
            } else {
                console.error('Error updating role');
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    })
    .catch(error => console.error('Error updating role:', error));
}

function setColumnVisibility(user_type) {
    if (user_type === 'Admin') {
        // 'admin-column' sınıfına sahip tüm elementleri seç
        const adminColumns = document.querySelectorAll('.admin-column');
        
        // Her bir elementin 'hidden' sınıfını kaldır
        adminColumns.forEach((column) => {
            column.classList.remove('hidden');
        });
    }
}