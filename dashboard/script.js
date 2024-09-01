document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Jika token tidak ada, arahkan pengguna kembali ke halaman login
        window.location.href = 'login.html';
        return;
    }

    const img = document.getElementById('user-photo');
    const photoData = localStorage.getItem('photo');
    if (photoData) {
        img.src = photoData; // Mengatur src gambar jika data ada
    }

    const username = document.getElementById('user-name');
    const nameData = localStorage.getItem('name');
    if (nameData) {
        username.innerHTML = nameData; // Mengatur nama pengguna jika data ada
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    try {
        const response = await fetch('http://localhost:9871/api/v1/users/logout', {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('authToken')
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            // Simpan token di localStorage atau cookie
            localStorage.removeItem('authToken', data.userToken);
            localStorage.removeItem('name', data.userName);
            localStorage.removeItem('rights', data.userRights);
            localStorage.removeItem('photo', data.userPhoto);
            // Redirect ke halaman dashboard
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            console.log(errorData);
            console.log(response);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error').innerText = 'An error occurred';
    }
});
