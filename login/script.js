document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Jika token tidak ada, arahkan pengguna kembali ke halaman login
        window.location.href = 'dashboard.html';
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userID = document.getElementById('userid').value;
    const pwd = document.getElementById('pwd').value;

    try {
        const response = await fetch('http://localhost:9871/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID, pwd })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            // Simpan token di localStorage atau cookie
            localStorage.setItem('authToken', data.userToken);
            localStorage.setItem('name', data.userName);
            localStorage.setItem('rights', data.userRights);
            localStorage.setItem('photo', data.userPhoto);
            // Redirect ke halaman dashboard
            window.location.href = 'dashboard.html';
        } else {
            const errorData = await response.json();
            console.log(errorData);
            document.getElementById('error').innerText = errorData.message[0];
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error').innerText = 'An error occurred';
    }
});
