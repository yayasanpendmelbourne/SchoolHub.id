// Database Kredensial Valid
const VALID_USERS = {
    'admin': { pass: 'admin123', role: 'admin', name: 'Administrator Staff', avatar: 'Admin' },
    'gurutk': { pass: 'tk123', role: 'guru_tk', name: 'Siti Rahma, S.Pd.', avatar: 'Rahma' },
    'gurusd': { pass: 'sd123', role: 'guru_sd', name: 'Budi Santoso, S.Pd.', avatar: 'Budi' }
};

let currentUser = null;

// Mock Data Awal (Default)
const defaultSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi', tingkat: 'TK', kelas: 'TK B', ortu: 'Budi Fauzi', hp: '08123456781', absensi: 'Hadir' },
    { nis: '102', nama: 'Anisa Putri', tingkat: 'TK', kelas: 'TK A', ortu: 'Hendra', hp: '08123456784', absensi: 'Hadir' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 2', ortu: 'Rahmat', hp: '08123456782', absensi: 'Hadir' },
    { nis: '202', nama: 'Doni Pratama', tingkat: 'SD', kelas: 'SD Kelas 5', ortu: 'Eko', hp: '08123456785', absensi: 'Izin' }
];

const defaultGuru = [
    { id: 1, nip: 'G-TK-01', nama: 'Siti Rahma, S.Pd.', tingkat: 'TK', jabatan: 'Guru Kelompok B', mapel: 'Tematik TK', hp: '081987654321' },
    { id: 2, nip: 'G-SD-01', nama: 'Budi Santoso, S.Pd.', tingkat: 'SD', jabatan: 'Guru Wali Kelas 2', mapel: 'Matematika', hp: '081987654322' }
];

const defaultBukuKerja = [
    { id: 1, template: 'RPP / Modul Ajar', mapel: 'Tematik SD Kelas 2', tanggal: '2026-09-10', status: 'Tervalidasi' },
    { id: 2, template: 'Program Tahunan (PROTA)', mapel: 'Seni & Kebudayaan TK B', tanggal: '2026-09-12', status: 'Menunggu' }
];

// FUNGSI MEMBACA DATA DARI LOCALSTORAGE
function loadDataFromStorage() {
    dataSiswa = JSON.parse(localStorage.getItem('educore_siswa')) || defaultSiswa;
    dataGuru = JSON.parse(localStorage.getItem('educore_guru')) || defaultGuru;
    dataBukuKerja = JSON.parse(localStorage.getItem('educore_bukukerja')) || defaultBukuKerja;
}

// FUNGSI MENYIMPAN DATA KE LOCALSTORAGE
function saveDataToStorage() {
    localStorage.setItem('educore_siswa', JSON.stringify(dataSiswa));
    localStorage.setItem('educore_guru', JSON.stringify(dataGuru));
    localStorage.setItem('educore_bukukerja', JSON.stringify(dataBukuKerja));
}

// Inisialisasi Data Variable
let dataSiswa = [];
let dataGuru = [];
let dataBukuKerja = [];

loadDataFromStorage();

// Notification Toast
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Handler Auth Login
function handleLogin(e) {
    e.preventDefault();
    const uInput = document.getElementById('loginUser').value.trim();
    const pInput = document.getElementById('loginPass').value.trim();
    const rInput = document.getElementById('loginRole').value;
    const authCard = document.querySelector('.auth-card');

    const userObj = VALID_USERS[uInput];

    if (userObj && userObj.pass === pInput && userObj.role === rInput) {
        currentUser = { username: uInput, ...userObj };
        
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        document.getElementById('userNameDisplay').innerText = currentUser.name;
        document.getElementById('userRoleBadge').innerText = currentUser.role.replace('_', ' ');
        document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatar}`;

        applyRolePermissions(currentUser.role);
        renderAllData();
        showToast(`Selamat datang kembali, ${currentUser.name}!`);
    } else {
        authCard.classList.add('shake');
        setTimeout(() => authCard.classList.remove('shake'), 400);
        showToast('Username, Password, atau Role tidak cocok!', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    showToast('Berhasil keluar dari portal.');
}

function showResetPage() {
    document.getElementById('formLogin').classList.add('hidden');
    document.getElementById('formReset').classList.remove('hidden');
}

function showLoginPage() {
    document.getElementById('formReset').classList.add('hidden');
    document.getElementById('formLogin').classList.remove('hidden');
}

function handleReset(e) {
    e.preventDefault();
    showToast('Link instruksi reset password telah dikirim ke email!');
    showLoginPage();
}

// Strict Role-Based Access Control
function applyRolePermissions(role) {
    document.querySelectorAll('.sidebar-menu li').forEach(el => {
        const isAllowed = Array.from(el.classList).some(c => c === `role-${role}` || c === 'menu-divider');
        el.classList.toggle('hidden', !isAllowed);
    });

    document.querySelectorAll('.role-admin-only').forEach(el => {
        el.classList.toggle('hidden', role !== 'admin');
    });

    switchTab('dashboard');
}

// Tab Switcher Smooth
function switchTab(tabName, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    if (event) event.target.classList.add('active');

    if (tabName === 'absensi') renderAbsensi();
}

// Render Data Tables
function renderAllData() {
    const tbodyTK = document.getElementById('tbodySiswaTK');
    const tbodySD = document.getElementById('tbodySiswaSD');
    tbodyTK.innerHTML = ''; tbodySD.innerHTML = '';

    dataSiswa.forEach(s => {
        const deleteBtn = (currentUser && currentUser.role === 'admin')
            ? `<button class="btn btn-danger" onclick="deleteSiswa('${s.nis}')">🗑️ Hapus</button>`
            : `-`;

        const row = `<tr>
            <td>${s.nis}</td>
            <td><strong>${s.nama}</strong></td>
            <td>${s.kelas}</td>
            <td>${s.ortu}</td>
            <td>${s.hp}</td>
            <td>${deleteBtn}</td>
        </tr>`;

        if (s.tingkat === 'TK') tbodyTK.innerHTML += row;
        else tbodySD.innerHTML += row;
    });

    renderGuruTables();
    renderBukuKerja();

    document.getElementById('statSiswaTK').innerText = dataSiswa.filter(s => s.tingkat === 'TK').length;
    document.getElementById('statSiswaSD').innerText = dataSiswa.filter(s => s.tingkat === 'SD').length;
    document.getElementById('statGuru').innerText = dataGuru.length;
}

function renderGuruTables() {
    const tbodyGTK = document.getElementById('tbodyGuruTK');
    const tbodyGSD = document.getElementById('tbodyGuruSD');
    tbodyGTK.innerHTML = ''; tbodyGSD.innerHTML = '';

    dataGuru.forEach(g => {
        const deleteBtn = (currentUser && currentUser.role === 'admin') 
            ? `<button class="btn btn-danger" onclick="deleteGuru(${g.id})">🗑️ Hapus</button>` 
            : `-`;
            
        const row = `<tr>
            <td>${g.nip}</td>
            <td><strong>${g.nama}</strong></td>
            <td>${g.jabatan}</td>
            <td>${g.mapel}</td>
            <td>${g.hp}</td>
            <td>${deleteBtn}</td>
        </tr>`;
        
        if (g.tingkat === 'TK') tbodyGTK.innerHTML += row;
        else tbodyGSD.innerHTML += row;
    });
}

// Render Absensi Berdasarkan Peran Login
function renderAbsensi() {
    const tbody = document.getElementById('tbodyAbsensi');
    const subtitle = document.getElementById('absensiSubtitle');
    tbody.innerHTML = '';

    let filteredSiswa = dataSiswa;

    if (currentUser.role === 'guru_tk') {
        filteredSiswa = dataSiswa.filter(s => s.tingkat === 'TK');
        subtitle.innerText = "Pencatatan Kehadiran Harian Murid Taman Kanak-Kanak (TK).";
    } else if (currentUser.role === 'guru_sd') {
        filteredSiswa = dataSiswa.filter(s => s.tingkat === 'SD');
        subtitle.innerText = "Pencatatan Kehadiran Harian Murid Sekolah Dasar (SD).";
    } else {
        subtitle.innerText = "Pencatatan Kehadiran Seluruh Siswa Sekolah.";
    }

    filteredSiswa.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.nis}</td>
                <td><strong>${s.nama}</strong></td>
                <td><span class="badge-role">${s.tingkat}</span></td>
                <td>${s.kelas}</td>
                <td>
                    <select class="select-absensi" onchange="updateAbsensi('${s.nis}', this.value)">
                        <option value="Hadir" ${s.absensi === 'Hadir' ? 'selected' : ''}>✅ Hadir</option>
                        <option value="Izin" ${s.absensi === 'Izin' ? 'selected' : ''}>📩 Izin</option>
                        <option value="Sakit" ${s.absensi === 'Sakit' ? 'selected' : ''}>🏥 Sakit</option>
                        <option value="Alpa" ${s.absensi === 'Alpa' ? 'selected' : ''}>❌ Alpa</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

function updateAbsensi(nis, status) {
    const target = dataSiswa.find(s => s.nis === nis);
    if (target) {
        target.absensi = status;
        saveDataToStorage();
        showToast(`Absensi ${target.nama} diperbarui: ${status}`);
    }
}

// Hapus Siswa (Khusus Admin)
function deleteSiswa(nis) {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
        dataSiswa = dataSiswa.filter(s => s.nis !== nis);
        saveDataToStorage();
        renderAllData();
        showToast("Data Murid berhasil dihapus!", "error");
    }
}

// Hapus Guru (Khusus Admin)
function deleteGuru(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
        dataGuru = dataGuru.filter(g => g.id !== id);
        saveDataToStorage();
        renderGuruTables();
        document.getElementById('statGuru').innerText = dataGuru.length;
        showToast("Data Guru berhasil dihapus!", "error");
    }
}

function renderBukuKerja() {
    const tbody = document.getElementById('tbodyBukuKerja');
    tbody.innerHTML = '';

    dataBukuKerja.forEach((doc, index) => {
        const isVerified = doc.status === 'Tervalidasi';
        const actionBtn = (currentUser.role === 'admin' && !isVerified) 
            ? `<button class="btn btn-success" onclick="validasiDokumen(${index})">Validasi</button>` 
            : `<span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${doc.template}</strong></td>
                <td>${doc.mapel}</td>
                <td>${doc.tanggal}</td>
                <td><span class="badge-status ${doc.status.toLowerCase()}">${doc.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

// Modal Siswa Operations
function openModalSiswa(tingkat) {
    document.getElementById('siswaTingkat').value = tingkat;
    document.getElementById('modalSiswaTitle').innerText = `Tambah Murid Baru (${tingkat})`;
    document.getElementById('modalSiswa').classList.remove('hidden');
}
function closeModalSiswa() { 
    document.getElementById('modalSiswa').classList.add('hidden'); 
    document.getElementById('formSiswa').reset();
}

function saveSiswa(e) {
    e.preventDefault();
    dataSiswa.push({
        nis: document.getElementById('siswaNis').value,
        nama: document.getElementById('siswaNama').value,
        tingkat: document.getElementById('siswaTingkat').value,
        kelas: document.getElementById('siswaKelas').value,
        ortu: document.getElementById('siswaOrtu').value,
        hp: document.getElementById('siswaHp').value,
        absensi: 'Hadir'
    });
    saveDataToStorage();
    renderAllData();
    closeModalSiswa();
    showToast('Data Siswa berhasil ditambahkan!');
}

// Modal Guru Operations (Khusus Admin)
function openModalGuru(tingkat) {
    document.getElementById('guruTingkat').value = tingkat;
    document.getElementById('modalGuruTitle').innerText = `Tambah Staff Guru (${tingkat})`;
    document.getElementById('modalGuru').classList.remove('hidden');
}
function closeModalGuru() { 
    document.getElementById('modalGuru').classList.add('hidden'); 
    document.getElementById('formGuru').reset();
}

function saveGuru(e) {
    e.preventDefault();
    dataGuru.push({
        id: Date.now(),
        nip: document.getElementById('guruNip').value,
        nama: document.getElementById('guruNama').value,
        tingkat: document.getElementById('guruTingkat').value,
        jabatan: document.getElementById('guruJabatan').value,
        mapel: document.getElementById('guruMapel').value,
        hp: document.getElementById('guruHp').value
    });
    saveDataToStorage();
    renderAllData();
    closeModalGuru();
    showToast('Data Guru baru berhasil disimpan!');
}

// Modal Buku Kerja Operations
function openModalBukuKerja() { document.getElementById('modalBukuKerja').classList.remove('hidden'); }
function closeModalBukuKerja() { 
    document.getElementById('modalBukuKerja').classList.add('hidden'); 
    document.getElementById('formBukuKerja').reset();
}

function saveBukuKerja(e) {
    e.preventDefault();
    dataBukuKerja.push({
        id: Date.now(),
        template: document.getElementById('docTemplate').value,
        mapel: document.getElementById('docMapel').value,
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Menunggu'
    });
    saveDataToStorage();
    renderBukuKerja();
    closeModalBukuKerja();
    showToast('Dokumen Buku Kerja berhasil dikirim!');
}

function validasiDokumen(index) {
    dataBukuKerja[index].status = 'Tervalidasi';
    saveDataToStorage();
    renderBukuKerja();
    showToast('Dokumen berhasil divalidasi oleh Admin!');
}
