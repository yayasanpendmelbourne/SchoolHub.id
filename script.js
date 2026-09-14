const defaultUsers = {
    'admin': { pass: 'admin123', role: 'admin', name: 'Administrator Staff', avatar: 'Admin' },
    'gurutk': { pass: 'tk123', role: 'guru_tk', name: 'Siti Rahma, S.Pd.', avatar: 'Rahma' },
    'gurusd': { pass: 'sd123', role: 'guru_sd', name: 'Budi Santoso, S.Pd.', avatar: 'Budi' }
};

const defaultSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi', tingkat: 'TK', kelas: 'TK B', ortu: 'Budi Fauzi', hp: '08123456781' },
    { nis: '102', nama: 'Anisa Putri', tingkat: 'TK', kelas: 'TK B', ortu: 'Hendra', hp: '08123456784' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Rahmat', hp: '08123456782' },
    { nis: '202', nama: 'Doni Pratama', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Eko', hp: '08123456785' }
];

let usersList = JSON.parse(localStorage.getItem('educore_users')) || defaultUsers;
let dataSiswa = JSON.parse(localStorage.getItem('educore_siswa')) || defaultSiswa;
let absensiRecords = JSON.parse(localStorage.getItem('educore_absensi')) || {};
let dataBukuKerja = JSON.parse(localStorage.getItem('educore_bukukerja')) || [];
let currentUser = null;

function saveDataToStorage() {
    localStorage.setItem('educore_users', JSON.stringify(usersList));
    localStorage.setItem('educore_siswa', JSON.stringify(dataSiswa));
    localStorage.setItem('educore_absensi', JSON.stringify(absensiRecords));
    localStorage.setItem('educore_bukukerja', JSON.stringify(dataBukuKerja));
}

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById('filterTanggalAbsensi');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
});

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function handleLogin(e) {
    e.preventDefault();
    const uInput = document.getElementById('loginUser').value.trim();
    const pInput = document.getElementById('loginPass').value.trim();
    const rInput = document.getElementById('loginRole').value;

    const userObj = usersList[uInput];

    if (userObj && userObj.pass === pInput && userObj.role === rInput) {
        currentUser = { username: uInput, ...userObj };
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        document.getElementById('userNameDisplay').innerText = currentUser.name;
        document.getElementById('userRoleBadge').innerText = currentUser.role.replace('_', ' ');
        document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatar}`;

        applyRolePermissions(currentUser.role);
        renderAllData();
        showToast(`Selamat datang, ${currentUser.name}!`);
    } else {
        showToast('Kredensial atau Role tidak valid!', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

function applyRolePermissions(role) {
    document.querySelectorAll('.sidebar-menu li').forEach(el => {
        const isAllowed = Array.from(el.classList).some(c => c === `role-${role}` || c === 'menu-divider');
        el.classList.toggle('hidden', !isAllowed);
    });

    switchTab('dashboard');
}

function switchTab(tabName, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    if (event) event.target.classList.add('active');

    if (tabName === 'absensi') renderAbsensi();
    if (tabName === 'manajemen-user') renderUsers();
}

function renderAllData() {
    const tbodyTK = document.getElementById('tbodySiswaTK');
    const tbodySD = document.getElementById('tbodySiswaSD');
    tbodyTK.innerHTML = ''; tbodySD.innerHTML = '';

    dataSiswa.forEach(s => {
        const row = `<tr>
            <td>${s.nis}</td>
            <td><strong>${s.nama}</strong></td>
            <td>${s.kelas}</td>
            <td>${s.ortu}</td>
            <td>${s.hp}</td>
            <td><button class="btn btn-danger" onclick="deleteSiswa('${s.nis}')">Hapus</button></td>
        </tr>`;

        if (s.tingkat === 'TK') tbodyTK.innerHTML += row;
        else tbodySD.innerHTML += row;
    });

    renderUsers();
    renderQuickDashboard();
}

function renderQuickDashboard() {
    const totalHadirEl = document.getElementById('dashTotalHadir');
    const previewEl = document.getElementById('quickAbsensiPreview');
    const today = new Date().toISOString().split('T')[0];

    let countHadir = 0;
    let html = '<table><thead><tr><th>Nama</th><th>Status</th></tr></thead><tbody>';

    let list = (currentUser && currentUser.role === 'guru_tk') 
        ? dataSiswa.filter(s => s.tingkat === 'TK') 
        : dataSiswa.filter(s => s.tingkat === 'SD');

    list.forEach(s => {
        const st = (absensiRecords[today] && absensiRecords[today][s.nis]) ? absensiRecords[today][s.nis] : 'Hadir';
        if (st === 'Hadir') countHadir++;
        html += `<tr><td><b>${s.nama}</b></td><td>✅ ${st}</td></tr>`;
    });

    html += '</tbody></table>';
    if (totalHadirEl) totalHadirEl.innerText = countHadir;
    if (previewEl) previewEl.innerHTML = html;
}

// Fitur Manajemen Pengguna (Bisa diakses Admin, Guru TK, Guru SD)
function renderUsers() {
    const tbody = document.getElementById('tbodyUsers');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(usersList).forEach(uKey => {
        const u = usersList[uKey];
        const delBtn = (uKey !== 'admin') 
            ? `<button class="btn btn-danger" onclick="deleteUser('${uKey}')">🗑️ Hapus</button>`
            : `<small>Sistem Utama</small>`;

        tbody.innerHTML += `
            <tr>
                <td><b>${uKey}</b></td>
                <td>${u.name}</td>
                <td><span class="badge-role">${u.role.replace('_', ' ')}</span></td>
                <td>${delBtn}</td>
            </tr>
        `;
    });
}

function openModalUser() { document.getElementById('modalUser').classList.remove('hidden'); }
function closeModalUser() { document.getElementById('modalUser').classList.add('hidden'); document.getElementById('formUser').reset(); }

function saveUser(e) {
    e.preventDefault();
    const username = document.getElementById('userInputUsername').value.trim().toLowerCase();
    
    if (usersList[username]) {
        showToast('Username sudah ada!', 'error');
        return;
    }

    usersList[username] = {
        pass: document.getElementById('userInputPassword').value,
        name: document.getElementById('userInputNama').value,
        role: document.getElementById('userInputRole').value,
        avatar: document.getElementById('userInputNama').value
    };

    saveDataToStorage();
    renderUsers();
    closeModalUser();
    showToast('User berhasil dibuat!');
}

function deleteUser(username) {
    if (confirm(`Hapus pengguna "${username}"?`)) {
        delete usersList[username];
        saveDataToStorage();
        renderUsers();
        showToast('User dihapus.', 'error');
    }
}

// Absensi Harian & PDF
function renderAbsensi() {
    const tbody = document.getElementById('tbodyAbsensi');
    const selectedDate = document.getElementById('filterTanggalAbsensi').value;
    tbody.innerHTML = '';

    if (!absensiRecords[selectedDate]) absensiRecords[selectedDate] = {};

    let filteredSiswa = dataSiswa;
    if (currentUser.role === 'guru_tk') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'TK');
    if (currentUser.role === 'guru_sd') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'SD');

    filteredSiswa.forEach(s => {
        const currentStatus = absensiRecords[selectedDate][s.nis] || 'Hadir';
        
        tbody.innerHTML += `
            <tr>
                <td>${s.nis}</td>
                <td><strong>${s.nama}</strong></td>
                <td><span class="badge-role">${s.tingkat}</span></td>
                <td>${s.kelas}</td>
                <td>
                    <select onchange="updateAbsensi('${selectedDate}', '${s.nis}', this.value)">
                        <option value="Hadir" ${currentStatus === 'Hadir' ? 'selected' : ''}>✅ Hadir</option>
                        <option value="Izin" ${currentStatus === 'Izin' ? 'selected' : ''}>📩 Izin</option>
                        <option value="Sakit" ${currentStatus === 'Sakit' ? 'selected' : ''}>🏥 Sakit</option>
                        <option value="Alpa" ${currentStatus === 'Alpa' ? 'selected' : ''}>❌ Alpa</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

function updateAbsensi(date, nis, status) {
    if (!absensiRecords[date]) absensiRecords[date] = {};
    absensiRecords[date][nis] = status;
    saveDataToStorage();
    renderQuickDashboard();
    showToast('Status absensi diperbarui.');
}

function downloadAbsensiPDF() {
    const selectedDate = document.getElementById('filterTanggalAbsensi').value;
    const pdfTbody = document.getElementById('pdfTbodyAbsensi');
    pdfTbody.innerHTML = '';

    let filteredSiswa = (currentUser.role === 'guru_tk') 
        ? dataSiswa.filter(s => s.tingkat === 'TK') 
        : dataSiswa.filter(s => s.tingkat === 'SD');

    document.getElementById('pdfTanggal').innerText = selectedDate;
    document.getElementById('pdfGuru').innerText = currentUser.name;
    document.getElementById('pdfNamaGuruSign').innerText = currentUser.name;

    filteredSiswa.forEach((s, idx) => {
        const status = (absensiRecords[selectedDate] && absensiRecords[selectedDate][s.nis]) 
            ? absensiRecords[selectedDate][s.nis] 
            : 'Hadir';

        pdfTbody.innerHTML += `
            <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${s.nis}</td>
                <td><b>${s.nama}</b></td>
                <td>${s.kelas}</td>
                <td style="text-align:center;"><b>${status}</b></td>
            </tr>
        `;
    });

    const element = document.getElementById('pdfExportContainer');

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Laporan_Absensi_${selectedDate}.pdf`);
        showToast('PDF Kop Surat berhasil diunduh!');
    });
}

function openModalSiswa(tingkat) {
    document.getElementById('siswaTingkat').value = tingkat;
    document.getElementById('modalSiswaTitle').innerText = `Tambah Murid Baru (${tingkat})`;
    document.getElementById('modalSiswa').classList.remove('hidden');
}
function closeModalSiswa() { document.getElementById('modalSiswa').classList.add('hidden'); document.getElementById('formSiswa').reset(); }

function saveSiswa(e) {
    e.preventDefault();
    dataSiswa.push({
        nis: document.getElementById('siswaNis').value,
        nama: document.getElementById('siswaNama').value,
        tingkat: document.getElementById('siswaTingkat').value,
        kelas: document.getElementById('siswaKelas').value,
        ortu: document.getElementById('siswaOrtu').value,
        hp: document.getElementById('siswaHp').value
    });
    saveDataToStorage();
    renderAllData();
    closeModalSiswa();
    showToast('Siswa ditambahkan!');
}

function deleteSiswa(nis) {
    if (confirm("Hapus murid ini?")) {
        dataSiswa = dataSiswa.filter(s => s.nis !== nis);
        saveDataToStorage();
        renderAllData();
        showToast("Siswa dihapus.", "error");
    }
}

function openModalBukuKerja() { document.getElementById('modalBukuKerja').classList.remove('hidden'); }
function closeModalBukuKerja() { document.getElementById('modalBukuKerja').classList.add('hidden'); }

function saveBukuKerja(e) {
    e.preventDefault();
    dataBukuKerja.push({
        template: document.getElementById('docTemplate').value,
        mapel: document.getElementById('docMapel').value,
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Tervalidasi'
    });
    saveDataToStorage();
    closeModalBukuKerja();
    showToast('Dokumen berhasil diunggah.');
}
