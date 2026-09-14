// --- DATA INITIALIZATION ---
const defaultUsers = {
    'admin': { pass: 'admin123', role: 'admin', name: 'Administrator Staff', avatar: 'Admin' },
    'gurutk': { pass: 'tk123', role: 'guru_tk', name: 'Siti Rahma, S.Pd.', avatar: 'Rahma' },
    'gurusd': { pass: 'sd123', role: 'guru_sd', name: 'Budi Santoso, S.Pd.', avatar: 'Budi' }
};

const defaultEmployees = [
    { nip: 'KAY-2026-001', nama: 'Budi Santoso, S.Pd.', dept: 'Guru SD', status: 'Tetap', gaji: 5000000, hp: '081234567801' },
    { nip: 'KAY-2026-002', nama: 'Siti Rahma, S.Pd.', dept: 'Guru TK', status: 'Tetap', gaji: 4800000, hp: '081234567802' },
    { nip: 'KAY-2026-003', nama: 'Dewi Lestari, A.Md.', dept: 'Administrasi', status: 'Kontrak', gaji: 3800000, hp: '081234567803' }
];

const defaultSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi', tingkat: 'TK', kelas: 'TK B', ortu: 'Budi Fauzi', hp: '08123456781' },
    { nis: '102', nama: 'Anisa Putri', tingkat: 'TK', kelas: 'TK B', ortu: 'Hendra', hp: '08123456784' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Rahmat', hp: '08123456782' },
    { nis: '202', nama: 'Doni Pratama', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Eko', hp: '08123456785' }
];

const defaultMapel = [
    { kode: 'TK-MTR', nama: 'Motorik & Seni', role: 'guru_tk' },
    { kode: 'TK-BHS', nama: 'Mengenal Huruf & Bahasa', role: 'guru_tk' },
    { kode: 'SD-MTK', nama: 'Matematika Dasar', role: 'guru_sd' },
    { kode: 'SD-IPA', nama: 'IPAS Integrasi', role: 'guru_sd' }
];

const defaultNilai = [
    { id: '1', nis: '101', mapelKode: 'TK-MTR', nilai: 'BSB', catatan: 'Perkembangan halus sangat baik', role: 'guru_tk' },
    { id: '2', nis: '201', mapelKode: 'SD-MTK', nilai: '90', catatan: 'Sangat paham perkalian dasar', role: 'guru_sd' }
];

// LocalStorage State
let usersList = JSON.parse(localStorage.getItem('educore_users')) || defaultUsers;
let employeesList = JSON.parse(localStorage.getItem('educore_employees')) || defaultEmployees;
let dataSiswa = JSON.parse(localStorage.getItem('educore_siswa')) || defaultSiswa;
let dataMapel = JSON.parse(localStorage.getItem('educore_mapel')) || defaultMapel;
let dataNilai = JSON.parse(localStorage.getItem('educore_nilai')) || defaultNilai;
let absensiRecords = JSON.parse(localStorage.getItem('educore_absensi')) || {};

let currentUser = null;
let attendanceChartInstance = null;
let clockInterval = null;
let pendingConfirmCallback = null;

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzTziMYccKpqpum3QRAgsY6fET9UOTVIIohcI5PVphoUGEa_TMIOiLFUaR3SQ_wNWlM10WEQ36XA0V/pub?output=csv';

function saveDataToStorage() {
    localStorage.setItem('educore_users', JSON.stringify(usersList));
    localStorage.setItem('educore_employees', JSON.stringify(employeesList));
    localStorage.setItem('educore_siswa', JSON.stringify(dataSiswa));
    localStorage.setItem('educore_mapel', JSON.stringify(dataMapel));
    localStorage.setItem('educore_nilai', JSON.stringify(dataNilai));
    localStorage.setItem('educore_absensi', JSON.stringify(absensiRecords));
}

// Custom Toast System
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <div>${msg}</div>`;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Custom Confirmation Dialog
function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    pendingConfirmCallback = onConfirm;
    document.getElementById('modalConfirm').classList.remove('hidden');
}

function closeConfirmModal(isConfirmed) {
    document.getElementById('modalConfirm').classList.add('hidden');
    if (isConfirmed && pendingConfirmCallback) {
        pendingConfirmCallback();
    }
    pendingConfirmCallback = null;
}

// Helper Empty State Table Generator
function getEmptyStateHTML(message = "Belum ada data tersedia") {
    return `
        <tr>
            <td colspan="100%" class="empty-state">
                <div class="empty-state-icon">📂</div>
                <h4>Data Tidak Ditemukan</h4>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// --- DOM INIT ---
document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById('filterTanggalAbsensi');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const loginForm = document.getElementById('formLogin');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
});

// --- LOGIN & PORTAL ---
function handleLogin(e) {
    if (e) e.preventDefault();

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
        document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatar || currentUser.name}`;

        applyRolePermissions(currentUser.role);
        startRealtimeClock();
        renderNotifications();
        renderAllData();
        showToast('Login berhasil! Selamat datang kembali.');
    } else {
        showToast('Username, Password, atau Role salah!', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    if (clockInterval) clearInterval(clockInterval);

    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    showToast('Berhasil keluar dari akun.');
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

    const sectionEl = document.getElementById(`section-${tabName}`);
    if (sectionEl) sectionEl.classList.remove('hidden');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabName === 'manajemen-hr') renderEmployees();
    if (tabName === 'absensi') renderAbsensi();
    if (tabName === 'manajemen-user') renderUsers();
    if (tabName === 'manajemen-pembelajaran') renderPembelajaran();
    if (tabName === 'dashboard') renderDashboardAcademic();
    if (tabName === 'rekap-absensi-gas') fetchGoogleSheetAttendance();
}

// --- CLOCK ---
function startRealtimeClock() {
    if (clockInterval) clearInterval(clockInterval);

    function updateClock() {
        const now = new Date();
        const hrs = now.getHours();

        let greeting = "Selamat Malam";
        if (hrs >= 3 && hrs < 11) greeting = "Selamat Pagi";
        else if (hrs >= 11 && hrs < 15) greeting = "Selamat Siang";
        else if (hrs >= 15 && hrs < 18) greeting = "Selamat Sore";

        const greetingTitle = document.getElementById('greetingTitle');
        if (greetingTitle && currentUser) {
            greetingTitle.innerText = `${greeting}, ${currentUser.name}! 👋`;
        }

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('id-ID', options);
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const realtimeClock = document.getElementById('realtimeClock');
        if (realtimeClock) realtimeClock.innerText = `${dateStr} • Pukul ${timeStr} WIB`;
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function toggleNotifDropdown() {
    document.getElementById('notifDropdown').classList.toggle('hidden');
}

function renderNotifications() {
    if (!currentUser) return;
    const notifList = document.getElementById('notifList');
    const notifCount = document.getElementById('notifCount');
    const notifRoleTag = document.getElementById('notifRoleTag');

    notifRoleTag.innerText = currentUser.role.toUpperCase();
    notifList.innerHTML = '';

    let items = [
        { text: `Modul HR Aktif: ${employeesList.length} karyawan terdaftar.`, time: 'Baru saja' },
        { text: 'Sistem EduCore SMS v2.5 berjalan stabil.', time: '10 menit lalu' }
    ];

    notifCount.innerText = items.length;
    items.forEach(item => {
        notifList.innerHTML += `
            <div class="notif-item">
                <div>${item.text}</div>
                <small>${item.time}</small>
            </div>
        `;
    });
}

function renderAllData() {
    renderEmployees();
    renderSiswaTables(dataSiswa);
    renderUsers();
    renderPembelajaran();
    renderDashboardAcademic();
}

/* HR MODUL */
function filterEmployeeTable(query) {
    const q = query.toLowerCase();
    const filtered = employeesList.filter(e => 
        e.nama.toLowerCase().includes(q) || e.nip.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q)
    );
    renderEmployees(filtered);
}

function renderEmployees(list = employeesList) {
    const tbody = document.getElementById('tbodyHR');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = getEmptyStateHTML("Tidak ada data karyawan terdaftar.");
        return;
    }

    list.forEach(emp => {
        const formatGaji = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(emp.gaji);
        tbody.innerHTML += `
            <tr>
                <td><b>${emp.nip}</b></td>
                <td>👤 ${emp.nama}</td>
                <td><span class="badge-role">${emp.dept}</span></td>
                <td>${emp.status}</td>
                <td><b>${formatGaji}</b></td>
                <td>${emp.hp}</td>
                <td><button class="btn btn-danger" onclick="confirmDeleteEmployee('${emp.nip}')">Hapus</button></td>
            </tr>
        `;
    });
}

function openModalHR() { document.getElementById('modalHR').classList.remove('hidden'); }
function closeModalHR() { document.getElementById('modalHR').classList.add('hidden'); document.getElementById('formHR').reset(); }

function saveEmployee(e) {
    e.preventDefault();
    const nip = document.getElementById('hrNip').value.trim();

    if (employeesList.some(emp => emp.nip === nip)) {
        showToast('NIP karyawan sudah terdaftar!', 'error');
        return;
    }

    employeesList.push({
        nip: nip,
        nama: document.getElementById('hrNama').value.trim(),
        dept: document.getElementById('hrDept').value,
        status: document.getElementById('hrStatus').value,
        gaji: parseFloat(document.getElementById('hrGaji').value) || 0,
        hp: document.getElementById('hrHp').value.trim()
    });

    saveDataToStorage();
    renderEmployees();
    closeModalHR();
    showToast('Data karyawan berhasil disimpan!');
}

function confirmDeleteEmployee(nip) {
    showConfirmDialog('Hapus Data Karyawan', `Apakah Anda yakin ingin menghapus karyawan NIP: ${nip}?`, () => {
        employeesList = employeesList.filter(emp => emp.nip !== nip);
        saveDataToStorage();
        renderEmployees();
        showToast('Data karyawan berhasil dihapus.', 'error');
    });
}

/* SISWA */
function filterSiswaTable(tingkat, query) {
    const q = query.toLowerCase();
    const filtered = dataSiswa.filter(s => 
        s.tingkat === tingkat && (s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q))
    );
    renderSiswaTables(filtered, tingkat);
}

function renderSiswaTables(listSiswa, specificTingkat = null) {
    const tbodyTK = document.getElementById('tbodySiswaTK');
    const tbodySD = document.getElementById('tbodySiswaSD');

    if (!specificTingkat || specificTingkat === 'TK') if (tbodyTK) tbodyTK.innerHTML = '';
    if (!specificTingkat || specificTingkat === 'SD') if (tbodySD) tbodySD.innerHTML = '';

    const listTK = listSiswa.filter(s => s.tingkat === 'TK');
    const listSD = listSiswa.filter(s => s.tingkat === 'SD');

    if ((!specificTingkat || specificTingkat === 'TK') && tbodyTK) {
        if (listTK.length === 0) tbodyTK.innerHTML = getEmptyStateHTML("Belum ada data murid TK.");
        else listTK.forEach(s => tbodyTK.innerHTML += createSiswaRowHTML(s));
    }

    if ((!specificTingkat || specificTingkat === 'SD') && tbodySD) {
        if (listSD.length === 0) tbodySD.innerHTML = getEmptyStateHTML("Belum ada data murid SD.");
        else listSD.forEach(s => tbodySD.innerHTML += createSiswaRowHTML(s));
    }
}

function createSiswaRowHTML(s) {
    return `<tr>
        <td>${s.nis}</td>
        <td><a class="student-link" onclick="openModalStudentProfile('${s.nis}')">👤 ${s.nama}</a></td>
        <td>${s.kelas}</td>
        <td>${s.ortu}</td>
        <td>${s.hp}</td>
        <td><button class="btn btn-danger" onclick="confirmDeleteSiswa('${s.nis}')">Hapus</button></td>
    </tr>`;
}

function openModalStudentProfile(nis) {
    const s = dataSiswa.find(item => item.nis === nis);
    if (!s) return;

    document.getElementById('profileNama').innerText = s.nama;
    document.getElementById('profileNis').innerText = s.nis;
    document.getElementById('profileTingkatKelas').innerText = `${s.tingkat} - ${s.kelas}`;
    document.getElementById('profileOrtu').innerText = s.ortu;
    document.getElementById('profileHp').innerText = s.hp;
    document.getElementById('profileAvatar').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.nama}`;

    const profileTbody = document.getElementById('profileTbodyNilai');
    profileTbody.innerHTML = '';
    const studentGrades = dataNilai.filter(n => n.nis === nis);

    if (studentGrades.length === 0) {
        profileTbody.innerHTML = getEmptyStateHTML("Belum ada nilai terrekam.");
    } else {
        studentGrades.forEach(n => {
            const mObj = dataMapel.find(m => m.kode === n.mapelKode);
            profileTbody.innerHTML += `
                <tr>
                    <td>${mObj ? mObj.nama : n.mapelKode}</td>
                    <td><b>${n.nilai}</b></td>
                    <td><small>${n.catatan}</small></td>
                </tr>
            `;
        });
    }

    document.getElementById('modalStudentProfile').classList.remove('hidden');
}

function closeModalStudentProfile() {
    document.getElementById('modalStudentProfile').classList.add('hidden');
}

function confirmDeleteSiswa(nis) {
    showConfirmDialog('Hapus Murid', `Hapus murid dengan NIS ${nis}?`, () => {
        dataSiswa = dataSiswa.filter(s => s.nis !== nis);
        saveDataToStorage();
        renderAllData();
        showToast('Siswa berhasil dihapus.', 'error');
    });
}

/* DASHBOARD & CHARTS */
function renderDashboardAcademic() {
    if (!currentUser) return;

    const role = currentUser.role;
    document.getElementById('dashRoleTitle').innerText = role === 'admin' ? 'Administrator' : (role === 'guru_tk' ? 'Guru TK' : 'Guru SD');

    const filteredMapel = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);
    const filteredNilai = role === 'admin' ? dataNilai : dataNilai.filter(n => n.role === role);

    document.getElementById('dashTotalMapel').innerText = filteredMapel.length;
    document.getElementById('dashTotalNilai').innerText = filteredNilai.length;

    const trendCard = document.getElementById('attendanceTrendCard');
    if (role === 'admin') {
        trendCard.classList.add('hidden');
    } else {
        trendCard.classList.remove('hidden');
        renderAttendanceChart();
    }

    const mapelListEl = document.getElementById('dashMapelList');
    mapelListEl.innerHTML = '';
    if (filteredMapel.length === 0) {
        mapelListEl.innerHTML = `<p class="text-muted" style="font-size:0.85rem;">Tidak ada jadwal mapel.</p>`;
    } else {
        filteredMapel.forEach(m => {
            mapelListEl.innerHTML += `
                <div class="schedule-item">
                    <span class="badge-time">${m.kode}</span>
                    <div><strong>${m.nama}</strong></div>
                </div>
            `;
        });
    }

    const tbodyNilaiDash = document.getElementById('dashTbodyNilai');
    tbodyNilaiDash.innerHTML = '';
    if (filteredNilai.length === 0) {
        tbodyNilaiDash.innerHTML = getEmptyStateHTML("Belum ada evaluasi nilai.");
    } else {
        filteredNilai.forEach(n => {
            const sObj = dataSiswa.find(s => s.nis === n.nis);
            const mObj = dataMapel.find(m => m.kode === n.mapelKode);
            tbodyNilaiDash.innerHTML += `
                <tr>
                    <td><a class="student-link" onclick="openModalStudentProfile('${n.nis}')">${sObj ? sObj.nama : n.nis}</a></td>
                    <td>${mObj ? mObj.nama : n.mapelKode}</td>
                    <td><span class="badge-role">${n.nilai}</span></td>
                    <td><small>${n.catatan}</small></td>
                </tr>
            `;
        });
    }
}

function renderAttendanceChart() {
    const canvas = document.getElementById('attendanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (attendanceChartInstance) attendanceChartInstance.destroy();

    attendanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            datasets: [{
                label: 'Kehadiran (%)',
                data: [95, 98, 92, 97],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 80, max: 100 } }
        }
    });
}

function renderPembelajaran() {
    if (!currentUser) return;
    const role = currentUser.role;

    const mapelFiltered = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);
    const nilaiFiltered = role === 'admin' ? dataNilai : dataNilai.filter(n => n.role === role);

    const tbodyMapel = document.getElementById('tbodyMapel');
    tbodyMapel.innerHTML = mapelFiltered.length === 0 ? getEmptyStateHTML("Tidak ada mapel.") : '';
    if (mapelFiltered.length > 0) {
        mapelFiltered.forEach(m => {
            tbodyMapel.innerHTML += `<tr><td><b>${m.kode}</b></td><td>${m.nama}</td><td>${m.role.replace('_', ' ')}</td></tr>`;
        });
    }

    const tbodyNilai = document.getElementById('tbodyNilai');
    tbodyNilai.innerHTML = nilaiFiltered.length === 0 ? getEmptyStateHTML("Tidak ada data nilai.") : '';
    if (nilaiFiltered.length > 0) {
        nilaiFiltered.forEach(n => {
            const sObj = dataSiswa.find(s => s.nis === n.nis);
            const mObj = dataMapel.find(m => m.kode === n.mapelKode);
            tbodyNilai.innerHTML += `
                <tr>
                    <td><a class="student-link" onclick="openModalStudentProfile('${n.nis}')">${sObj ? sObj.nama : n.nis}</a></td>
                    <td>${mObj ? mObj.nama : n.mapelKode}</td>
                    <td><b>${n.nilai}</b></td>
                    <td><button class="btn btn-danger" onclick="confirmDeleteNilai('${n.id}')">Hapus</button></td>
                </tr>
            `;
        });
    }
}

function openModalMapel() { document.getElementById('modalMapel').classList.remove('hidden'); }
function closeModalMapel() { document.getElementById('modalMapel').classList.add('hidden'); document.getElementById('formMapel').reset(); }

function saveMapel(e) {
    e.preventDefault();
    dataMapel.push({
        kode: document.getElementById('mapelKode').value.trim().toUpperCase(),
        nama: document.getElementById('mapelNama').value.trim(),
        role: currentUser.role === 'admin' ? 'guru_sd' : currentUser.role
    });
    saveDataToStorage();
    renderPembelajaran();
    renderDashboardAcademic();
    closeModalMapel();
    showToast('Mata Pelajaran Ditambahkan!');
}

function openModalNilai() {
    const sSelect = document.getElementById('nilaiSiswaSelect');
    const mSelect = document.getElementById('nilaiMapelSelect');
    sSelect.innerHTML = ''; mSelect.innerHTML = '';

    const role = currentUser.role;
    const listSiswa = role === 'guru_tk' ? dataSiswa.filter(s => s.tingkat === 'TK') : dataSiswa.filter(s => s.tingkat === 'SD');
    const listMapel = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);

    listSiswa.forEach(s => sSelect.innerHTML += `<option value="${s.nis}">${s.nama} (${s.kelas})</option>`);
    listMapel.forEach(m => mSelect.innerHTML += `<option value="${m.kode}">${m.nama}</option>`);

    document.getElementById('modalNilai').classList.remove('hidden');
}
function closeModalNilai() { document.getElementById('modalNilai').classList.add('hidden'); document.getElementById('formNilai').reset(); }

function saveNilai(e) {
    e.preventDefault();
    dataNilai.push({
        id: Date.now().toString(),
        nis: document.getElementById('nilaiSiswaSelect').value,
        mapelKode: document.getElementById('nilaiMapelSelect').value,
        nilai: document.getElementById('nilaiAngka').value,
        catatan: document.getElementById('nilaiCatatan').value,
        role: currentUser.role === 'admin' ? 'guru_sd' : currentUser.role
    });
    saveDataToStorage();
    renderPembelajaran();
    renderDashboardAcademic();
    closeModalNilai();
    showToast('Nilai Siswa Berhasil Disimpan!');
}

function confirmDeleteNilai(id) {
    showConfirmDialog('Hapus Nilai', 'Hapus rekam nilai ini?', () => {
        dataNilai = dataNilai.filter(n => n.id !== id);
        saveDataToStorage();
        renderPembelajaran();
        renderDashboardAcademic();
        showToast('Nilai berhasil dihapus.');
    });
}

function renderAbsensi() {
    const tbody = document.getElementById('tbodyAbsensi');
    const selectedDate = document.getElementById('filterTanggalAbsensi').value;
    tbody.innerHTML = '';

    if (!absensiRecords[selectedDate]) absensiRecords[selectedDate] = {};

    let filteredSiswa = dataSiswa;
    if (currentUser.role === 'guru_tk') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'TK');
    if (currentUser.role === 'guru_sd') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'SD');

    if (filteredSiswa.length === 0) {
        tbody.innerHTML = getEmptyStateHTML("Belum ada data murid untuk diabsensi.");
        return;
    }

    filteredSiswa.forEach(s => {
        const currentStatus = absensiRecords[selectedDate][s.nis] || 'Hadir';
        tbody.innerHTML += `
            <tr>
                <td>${s.nis}</td>
                <td><a class="student-link" onclick="openModalStudentProfile('${s.nis}')">${s.nama}</a></td>
                <td><span class="badge-role">${s.tingkat}</span></td>
                <td>${s.kelas}</td>
                <td>
                    <select onchange="updateAbsensi('${selectedDate}', '${s.nis}', this.value)" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
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
    showToast('Absensi diperbarui.');
}

async function fetchGoogleSheetAttendance() {
    const loadingEl = document.getElementById('loadingSheet');
    const theadEl = document.getElementById('theadGAS');
    const tbodyEl = document.getElementById('tbodyGAS');

    loadingEl.classList.remove('hidden');
    tbodyEl.innerHTML = '';
    theadEl.innerHTML = '';

    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(GOOGLE_SHEET_CSV_URL));

        if (!response.ok) throw new Error("Gagal mengambil spreadsheet.");

        const dataText = await response.text();
        const rows = parseCSV(dataText);

        if (!rows || rows.length <= 1) {
            tbodyEl.innerHTML = getEmptyStateHTML("Data di spreadsheet Google Sheets masih kosong.");
            return;
        }

        let headerHTML = '<tr>';
        rows[0].forEach(header => { headerHTML += `<th>${header}</th>`; });
        headerHTML += '</tr>';
        theadEl.innerHTML = headerHTML;

        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length <= 1 && rows[i][0] === '') continue;
            let rowHTML = '<tr>';
            rows[i].forEach(cell => { rowHTML += `<td>${cell}</td>`; });
            rowHTML += '</tr>';
            tbodyEl.innerHTML += rowHTML;
        }

        showToast('Sinkronisasi data Google Sheets berhasil!');
    } catch (error) {
        tbodyEl.innerHTML = getEmptyStateHTML("Gagal memuat data dari Google Sheets. Pastikan akses publik aktif.");
        showToast('Gagal memuat spreadsheet.', 'error');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const row = [];
        let inQuotes = false;
        let currentCell = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentCell.trim().replace(/^"|"$/g, ''));
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        row.push(currentCell.trim().replace(/^"|"$/g, ''));
        return row;
    });
}

function renderUsers() {
    const tbody = document.getElementById('tbodyUsers');
    tbody.innerHTML = '';

    Object.keys(usersList).forEach(uKey => {
        const u = usersList[uKey];
        const delBtn = (uKey !== 'admin') 
            ? `<button class="btn btn-danger" onclick="confirmDeleteUser('${uKey}')">🗑️ Hapus</button>`
            : `<small class="text-muted">Superadmin</small>`;

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
        showToast('Username sudah digunakan!', 'error');
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
    showToast('Akses akun baru berhasil dibuat!');
}

function confirmDeleteUser(username) {
    showConfirmDialog('Hapus Akun', `Hapus akses pengguna "${username}"?`, () => {
        delete usersList[username];
        saveDataToStorage();
        renderUsers();
        showToast('Pengguna dihapus.', 'error');
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
    showToast('Data siswa berhasil disimpan!');
}
