document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const img = document.getElementById('user-photo');
    const photoData = localStorage.getItem('photo');
    if (photoData) {
        img.src = photoData;
    }

    const username = document.getElementById('user-name');
    const nameData = localStorage.getItem('name');
    if (nameData) {
        username.innerHTML = nameData;
    }

    const rights = localStorage.getItem('rights');
    const menuItems = document.querySelectorAll('.nav-menu > ul > li');
    let kelas = null;

    try {
        const response = await fetch('http://localhost:9871/api/v1/users/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('authToken') // Menggunakan token dari localStorage
            },
        });

        if (response.ok) {
            const data = await response.json(); // Menunggu parsing JSON
            kelas = data.class; // Mengambil array kelas dari response
        } else {
            const errorData = await response.json();
            console.log("error: ", errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Hide all dropdown menus initially
    menuItems.forEach(item => item.style.display = 'none');

    // Show menu items based on rights
    if (rights.includes('buatCPL') || rights.includes('editCPL')) {
        menuItems[0].style.display = 'block'; // Penetapan CPL CPMK
    }

    if (rights.includes('rancangKurikulum') || rights.includes('editKurikulum')) {
        menuItems[1].style.display = 'block'; // Kurikulum
    }

    if (rights.includes('cetakLaporan')) {
        const laporanMenu = menuItems[2].querySelector('.dropdown-content');
        laporanMenu.innerHTML = ''; // Clear existing menu items
        laporanMenu.innerHTML = '<li><a href="#">Nilai Matakuliah</a></li><li><a href="#">Nilai CPL CPMK</a></li>';
        menuItems[2].style.display = 'block'; // Laporan (Mata Kuliah & Organisasi)
    }

    if (rights.includes('cetakRekap')) {
        const laporanMenu = menuItems[2].querySelector('.dropdown-content');
        
        // Menambahkan item tanpa menghapus yang sudah ada
        if (!laporanMenu.innerHTML.includes('<li><a href="#">Mata Kuliah</a></li>')) {
            const newItem = document.createElement('li');
            newItem.innerHTML = '<a href="#">Mata Kuliah</a>';
            laporanMenu.appendChild(newItem);
        }

        if (!laporanMenu.innerHTML.includes('<li><a href="#">Organisasi</a></li>')) {
            const newItem1 = document.createElement('li');
            newItem1.innerHTML = '<a href="#">Organisasi</a>';
            laporanMenu.appendChild(newItem1);
        }

        menuItems[2].style.display = 'block'; // Laporan (Mata Kuliah & Organisasi)
    }

    if(rights.includes('buatRPS') || rights.includes('editRPS')){
        const laporanMenu = menuItems[3].querySelector('.dropdown-content');
        
        const newItem = document.createElement('li');
        newItem.innerHTML = '<a href="#">Analisis Pembelajaran</a>';
        laporanMenu.appendChild(newItem);
        
        const newItem1 = document.createElement('li');
        newItem1.innerHTML = '<a href="#">RPS</a>';
        laporanMenu.appendChild(newItem1);
        
        menuItems[3].style.display = 'block';
    }

    if(rights.includes('buatBasisEvaluasi')){
        const laporanMenu = menuItems[3].querySelector('.dropdown-content');
        
        const newItem = document.createElement('li');
        newItem.innerHTML = '<a href="#">Basis Evaluasi</a>';
        laporanMenu.appendChild(newItem);
        
        if(!(rights.includes('buatRPS') || rights.includes('editRPS'))){
            const newItem1 = document.createElement('li');
            newItem1.innerHTML = '<a href="#">RPS</a>';
            laporanMenu.appendChild(newItem1);
        }

        menuItems[3].style.display = 'block';
    }

    // Tambahkan dropdown untuk "Kelas Mengajar" dan tampilkan data kelas
    if(rights.includes('inputNilai')){
        const kelasMengajarMenu = menuItems[4].querySelector('.dropdown-content');

        // Kosongkan menu dropdown sebelum menambahkan kelas
        kelasMengajarMenu.innerHTML = ''; 

        if (kelas && kelas.length > 0) {
            kelas.forEach(kelasItem => {
                const newItem = document.createElement('li');
                newItem.innerHTML = `<a href="#">${kelasItem}</a>`;
                kelasMengajarMenu.appendChild(newItem);
            });
        } else {
            const newItem = document.createElement('li');
            newItem.innerHTML = '<a href="#">Tidak ada kelas</a>';
            kelasMengajarMenu.appendChild(newItem);
        }

        menuItems[4].style.display = 'block'; // Menampilkan dropdown "Kelas Mengajar"
    }
    
    console.log(kelas);

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
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            console.log(errorData);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error').innerText = 'An error occurred';
    }
});
