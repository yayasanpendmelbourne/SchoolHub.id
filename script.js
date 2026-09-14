// State Data & Auth
let currentUser = null;

let dataSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi', tingkat: 'TK', kelas: 'TK B', ortu: 'Budi Fauzi', hp: '08123456781', status: 'Aktif' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 2', ortu: 'Rahmat', hp: '08123456782', status: 'Aktif' }
];

let dataGuru = [
    { nip: 'G-TK-01', nama: 'Siti Rahma, S.Pd.', tingkat: 'TK', jabatan: 'Guru Kelas TK', mapel: 'Tematik TK', hp: '081987654321' },
    { nip: 'G-SD-01', nama: 'Budi Santoso, S.Pd.', tingkat: 'SD', jabatan: 'Guru Mapel SD', mapel: 'Matematika', hp: '081987654322' }
];

let dataBukuKerja = [
    { id: 1, template: 'RPP / Modul Ajar', mapel: 'Tematik SD Kelas 2', tanggal: '2026-09-10', status: 'Tervalidasi' },
    { id: 2, template: 'Program Tahunan (PROTA)', mapel: 'Seni & Kebudayaan TK B', tanggal: '2026-09-12', status: 'Menunggu' }
];

// Switch Page Login & Reset Password
function showResetPage() {
    document.getElementById('formLogin').classList.add('hidden');
    document.getElementById('formReset').classList.remove('hidden');
}

function showLoginPage() {
    document.getElementById('formReset').classList.add('hidden');
    document.getElementById('formLogin').classList.remove('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const role = document.getElementById('loginRole').value;

    currentUser = { username, role };
    
    // Tampilkan Aplikasi utama
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update Badge & Menu Sesuai Role
    document.getElementById('userNameDisplay').innerText = username;
    document.getElementById('userRoleBadge').innerText = role.replace('_', ' ');

    applyRolePermissions(role);
    renderAllData();
}

function handleReset(e) {
    e.preventDefault();
    alert('Link instruksi reset password telah dikirim ke email Anda.');
    showLoginPage();
}

function handleLogout() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Pengaturan Akses Menu Berdasarkan Role
function applyRolePermissions(role) {
    // Sembunyikan semua item navigasi berbasis role
    document.querySelectorAll('.sidebar li').forEach(el => {
        if (!el.classList.contains(`role-${role}`)) {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });

    // Batasi kontrol tombol aksi untuk Non-Admin
    document.querySelectorAll('.role-admin').forEach(el => {
        if (role !== 'admin') {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });
}

// Switch Navigation Tab
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    event.target.classList.add('active');
}

// Render Data
function renderAllData() {
    // Render Siswa TK & SD
    const tbodyTK = document.getElementById('tbodySiswaTK');
    const tbodySD = document.getElementById('tbodySiswaSD');
    tbodyTK.innerHTML = ''; tbodySD.innerHTML = '';

    dataSiswa.forEach(s => {
        const row = `<tr><td>${s.nis}</td><td>${s.nama}</td><td>${s.kelas}</td><td>${s.ortu}</td><td>${s.hp}</td><td>${s.status}</td></tr>`;
        if (s.tingkat === 'TK') tbodyTK.innerHTML += row;
        else tbodySD.innerHTML += row;
    });

    // Render Guru TK & SD
    const tbodyGTK = document.getElementById('tbodyGuruTK');
    const tbodyGSD = document.getElementById('tbodyGuruSD');
    tbodyGTK.innerHTML = ''; tbodyGSD.innerHTML = '';

    dataGuru.forEach(g => {
        if (g.tingkat === 'TK') {
            tbodyGTK.innerHTML += `<tr><td>${g.nip}</td><td>${g.nama}</td><td>${g.jabatan}</td><td>${g.mapel}</td><td>${g.hp}</td></tr>`;
        } else {
            tbodyGSD.innerHTML += `<tr><td>${g.nip}</td><td>${g.nama}</td><td>${g.jabatan}</td><td>${g.mapel}</td><td>${g.hp}</td></tr>`;
        }
    });

    // Render Buku Kerja Guru
    renderBukuKerja();

    // Stats
    document.getElementById('statSiswaTK').innerText = dataSiswa.filter(s => s.tingkat === 'TK').length;
    document.getElementById('statSiswaSD').innerText = dataSiswa.filter(s => s.tingkat === 'SD').length;
    document.getElementById('statGuru').innerText = dataGuru.length;
}

function renderBukuKerja() {
    const tbody = document.getElementById('tbodyBukuKerja');
    tbody.innerHTML = '';

    dataBukuKerja.forEach((doc, index) => {
        const isVerified = doc.status === 'Tervalidasi';
        const actionBtn = (currentUser.role === 'admin' && !isVerified) 
            ? `<button class="btn btn-success" onclick="validasiDokumen(${index})">Validasi Dokumen</button>` 
            : `<span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${doc.template}</strong></td>
                <td>${doc.mapel}</td>
                <td>2026/2027</td>
                <td>${doc.tanggal}</td>
                <td><span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

// Operations Buku Kerja
function openModalBukuKerja() { document.getElementById('modalBukuKerja').classList.remove('hidden'); }
function closeModalBukuKerja() { document.getElementById('modalBukuKerja').classList.add('hidden'); }

function saveBukuKerja(e) {
    e.preventDefault();
    const newDoc = {
        id: Date.now(),
        template: document.getElementById('docTemplate').value,
        mapel: document.getElementById('docMapel').value,
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Menunggu'
    };

    dataBukuKerja.push(newDoc);
    renderBukuKerja();
    closeModalBukuKerja();
    document.getElementById('formBukuKerja').reset();
}

function validasiDokumen(index) {
    dataBukuKerja[index].status = 'Tervalidasi';
    renderBukuKerja();
}
