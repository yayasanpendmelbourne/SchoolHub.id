// --- DATA DEFAULT INITIALIZATION ---
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

// Load State dari LocalStorage / Default
let usersList = JSON.parse(localStorage.getItem('educore_users')) || defaultUsers;
let employeesList = JSON.parse(localStorage.getItem('educore_employees')) || defaultEmployees;
let dataSiswa = JSON.parse(localStorage.getItem('educore_siswa')) || defaultSiswa;
let dataMapel = JSON.parse(localStorage.getItem('educore_mapel')) || defaultMapel;
let dataNilai = JSON.parse(localStorage.getItem('educore_nilai')) || defaultNilai;
let absensiRecords = JSON.parse(localStorage.getItem('educore_absensi')) || {};

let currentUser = null;
let attendanceChartInstance = null;
let clockInterval = null;

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzTziMYccKpqpum3QRAgsY6fET9UOTVIIohcI5PVphoUGEa_TMIOiLFUaR3SQ_wNWlM10WEQ36XA0V/pub?output=csv';

function saveDataToStorage() {
    localStorage.setItem('educore_users', JSON.stringify(usersList));
    localStorage.setItem('educore_employees', JSON.stringify(employeesList));
    localStorage.setItem('educore_siswa', JSON.stringify(dataSiswa));
    localStorage.setItem('educore_mapel', JSON.stringify(dataMapel));
    localStorage.setItem('educore_nilai', JSON.stringify(dataNilai));
    localStorage.setItem('educore_absensi', JSON.stringify(absensiRecords));
}

// Event Listener Utama
document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById('filterTanggalAbsensi');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const loginForm = document.getElementById('formLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// --- FUNGSI LOGIN & PORTAL NAVIGASI ---
function handleLogin(e) {
    if (e) e.preventDefault();

    const uInputEl = document.getElementById('loginUser');
    const pInputEl = document.getElementById('loginPass');
    const rInputEl = document.getElementById('loginRole');

    if (!uInputEl || !pInputEl || !rInputEl) return;

    const uInput = uInputEl.value.trim();
    const pInput = pInputEl.value.trim();
    const rInput = rInputEl.value;

    const userObj = usersList[uInput];

    if (userObj && userObj.pass === pInput && userObj.role === rInput) {
        currentUser = { username: uInput, ...userObj };

        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        if (loginPage) loginPage.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleBadge = document.getElementById('userRoleBadge');
        const userAvatar = document.getElementById('userAvatar');

        if (userNameDisplay) userNameDisplay.innerText = currentUser.name;
        if (userRoleBadge) userRoleBadge.innerText = currentUser.role.replace('_', ' ');
        if (userAvatar) userAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatar || currentUser.name}`;

        applyRolePermissions(currentUser.role);
        startRealtimeClock();
        renderNotifications();
        renderAllData();
        showToast('Login berhasil! Selamat datang.');
    } else {
        showToast('Username, Password, atau Role salah!', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    if (clockInterval) clearInterval(clockInterval);

    const mainApp = document.getElementById('mainApp');
    const loginPage = document.getElementById('loginPage');

    if (mainApp) mainApp.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
    showToast('Berhasil keluar dari portal.');
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

// --- HELPER PARSER CSV & GOOGLE SHEETS ---
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

async function fetchGoogleSheetAttendance() {
    const loadingEl = document.getElementById('loadingSheet');
    const theadEl = document.getElementById('theadGAS');
    const tbodyEl = document.getElementById('tbodyGAS');

    if (!theadEl || !tbodyEl) return;

    if (loadingEl) loadingEl.classList.remove('hidden');
    tbodyEl.innerHTML = '';
    theadEl.innerHTML = '';

    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(GOOGLE_SHEET_CSV_URL));

        if (!response.ok) throw new Error("Gagal terhubung ke Google Sheets.");

        const dataText = await response.text();
        const rows = parseCSV(dataText);

        if (!rows || rows.length === 0 || (rows.length === 1 && rows[0][0] === '')) {
            tbodyEl.innerHTML = '<tr><td colspan="10" style="text-align:center;">Data kosong.</td></tr>';
            if (loadingEl) loadingEl.classList.add('hidden');
            return;
        }

        const headers = rows[0];
        let headerHTML = '<tr>';
        headers.forEach(header => { headerHTML += `<th>${header}</th>`; });
        headerHTML += '</tr>';
        theadEl.innerHTML = headerHTML;

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i];
            if (rowData.length <= 1 && rowData[0] === '') continue;

            let rowHTML = '<tr>';
            rowData.forEach(cell => { rowHTML += `<td>${cell}</td>`; });
            rowHTML += '</tr>';
            tbodyEl.innerHTML += rowHTML;
        }

        showToast('Data absensi spreadsheet berhasil dimuat!');
    } catch (error) {
        console.error('Gagal mengambil data dari Google Sheets:', error);
        showToast('Gagal memuat spreadsheet.', 'error');
        tbodyEl.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Gagal memuat data. Pastikan Google Sheets dipublikasikan sebagai CSV.</td></tr>';
    } finally {
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}

// --- JAM REALTIME & UCAPAN ---
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
        if (realtimeClock) {
            realtimeClock.innerText = `${dateStr} • Pukul ${timeStr} WIB`;
        }
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function toggleNotifDropdown() {
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifDropdown) notifDropdown.classList.toggle('hidden');
}

function renderNotifications() {
    if (!currentUser) return;
    const notifList = document.getElementById('notifList');
    const notifCount = document.getElementById('notifCount');
    const notifRoleTag = document.getElementById('notifRoleTag');

    if (!notifList || !notifCount || !notifRoleTag) return;

    notifRoleTag.innerText = currentUser.role.toUpperCase();
    notifList.innerHTML = '';

    let items = [];
    if (currentUser.role === 'admin') {
        items = [
            { text: `Modul HR Aktif: ${employeesList.length} karyawan terdaftar.`, time: 'Baru saja' },
            { text: 'Sistem EduCore v2.5 berjalan lancar.', time: '10 menit lalu' }
        ];
    } else if (currentUser.role === 'guru_tk') {
        items = [
            { text: 'Pengingat: Input nilai perkembangan motorik TK.', time: '30 menit lalu' }
        ];
    } else if (currentUser.role === 'guru_sd') {
        items = [
            { text: 'Jadwal penilaian evaluasi SD telah dibuka.', time: '15 menit lalu' }
        ];
    }

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

/* MODUL HR */
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
                <td><button class="btn btn-danger" onclick="deleteEmployee('${emp.nip}')">Hapus</button></td>
            </tr>
        `;
    });
}

function openModalHR() { const modal = document.getElementById('modalHR'); if (modal) modal.classList.remove('hidden'); }
function closeModalHR() { const modal = document.getElementById('modalHR'); if (modal) { modal.classList.add('hidden'); document.getElementById('formHR').reset(); } }

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
    showToast('Karyawan Baru Berhasil Disimpan!');
}

function deleteEmployee(nip) {
    if (confirm(`Hapus data karyawan NIP: ${nip}?`)) {
        employeesList = employeesList.filter(emp => emp.nip !== nip);
        saveDataToStorage();
        renderEmployees();
        showToast('Data karyawan dihapus.', 'error');
    }
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

    listSiswa.forEach(s => {
        const row = `<tr>
            <td>${s.nis}</td>
            <td><a class="student-link" onclick="openModalStudentProfile('${s.nis}')">👤 ${s.nama}</a></td>
            <td>${s.kelas}</td>
            <td>${s.ortu}</td>
            <td>${s.hp}</td>
            <td><button class="btn btn-danger" onclick="deleteSiswa('${s.nis}')">Hapus</button></td>
        </tr>`;

        if (s.tingkat === 'TK' && (!specificTingkat || specificTingkat === 'TK') && tbodyTK) tbodyTK.innerHTML += row;
        if (s.tingkat === 'SD' && (!specificTingkat || specificTingkat === 'SD') && tbodySD) tbodySD.innerHTML += row;
    });
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
        profileTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Belum ada nilai terrekam.</td></tr>`;
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

/* DASHBOARD AKADEMIK */
function renderDashboardAcademic() {
    if (!currentUser) return;

    const role = currentUser.role;
    const dashRoleTitle = document.getElementById('dashRoleTitle');
    if (dashRoleTitle) dashRoleTitle.innerText = role === 'admin' ? 'Administrator' : (role === 'guru_tk' ? 'Guru TK' : 'Guru SD');

    const filteredMapel = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);
    const filteredNilai = role === 'admin' ? dataNilai : dataNilai.filter(n => n.role === role);

    const totalMapelEl = document.getElementById('dashTotalMapel');
    const totalNilaiEl = document.getElementById('dashTotalNilai');

    if (totalMapelEl) totalMapelEl.innerText = filteredMapel.length;
    if (totalNilaiEl) totalNilaiEl.innerText = filteredNilai.length;

    const trendCard = document.getElementById('attendanceTrendCard');
    if (trendCard) {
        if (role === 'admin') {
            trendCard.classList.add('hidden');
        } else {
            trendCard.classList.remove('hidden');
            renderAttendanceChart();
        }
    }

    const mapelListEl = document.getElementById('dashMapelList');
    if (mapelListEl) {
        mapelListEl.innerHTML = '';
        filteredMapel.forEach(m => {
            mapelListEl.innerHTML += `
                <div class="schedule-item">
                    <span class="badge-time">${m.kode}</span>
                    <div class="sched-info">
                        <strong>${m.nama}</strong>
                    </div>
                </div>
            `;
        });
    }

    const tbodyNilaiDash = document.getElementById('dashTbodyNilai');
    if (tbodyNilaiDash) {
        tbodyNilaiDash.innerHTML = '';
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
    
    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }

    attendanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            datasets: [{
                label: 'Persentase Kehadiran Murid (%)',
                data: [95, 98, 92, 97],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 80, max: 100 }
            }
        }
    });
}

function renderPembelajaran() {
    if (!currentUser) return;
    const role = currentUser.role;

    const mapelFiltered = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);
    const nilaiFiltered = role === 'admin' ? dataNilai : dataNilai.filter(n => n.role === role);

    const tbodyMapel = document.getElementById('tbodyMapel');
    if (tbodyMapel) {
        tbodyMapel.innerHTML = '';
        mapelFiltered.forEach(m => {
            tbodyMapel.innerHTML += `<tr><td><b>${m.kode}</b></td><td>${m.nama}</td><td>${m.role.replace('_', ' ')}</td></tr>`;
        });
    }

    const tbodyNilai = document.getElementById('tbodyNilai');
    if (tbodyNilai) {
        tbodyNilai.innerHTML = '';
        nilaiFiltered.forEach(n => {
            const sObj = dataSiswa.find(s => s.nis === n.nis);
            const mObj = dataMapel.find(m => m.kode === n.mapelKode);
            tbodyNilai.innerHTML += `
                <tr>
                    <td><a class="student-link" onclick="openModalStudentProfile('${n.nis}')">${sObj ? sObj.nama : n.nis}</a></td>
                    <td>${mObj ? mObj.nama : n.mapelKode}</td>
                    <td><b>${n.nilai}</b></td>
                    <td><button class="btn btn-danger" onclick="deleteNilai('${n.id}')">Hapus</button></td>
                </tr>
            `;
        });
    }
}

function openModalMapel() { const m = document.getElementById('modalMapel'); if(m) m.classList.remove('hidden'); }
function closeModalMapel() { const m = document.getElementById('modalMapel'); if(m) { m.classList.add('hidden'); document.getElementById('formMapel').reset(); } }

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
    if (!sSelect || !mSelect) return;
    sSelect.innerHTML = ''; mSelect.innerHTML = '';

    const role = currentUser.role;
    const listSiswa = role === 'guru_tk' ? dataSiswa.filter(s => s.tingkat === 'TK') : dataSiswa.filter(s => s.tingkat === 'SD');
    const listMapel = role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === role);

    listSiswa.forEach(s => sSelect.innerHTML += `<option value="${s.nis}">${s.nama} (${s.kelas})</option>`);
    listMapel.forEach(m => mSelect.innerHTML += `<option value="${m.kode}">${m.nama}</option>`);

    document.getElementById('modalNilai').classList.remove('hidden');
}
function closeModalNilai() { const m = document.getElementById('modalNilai'); if(m) { m.classList.add('hidden'); document.getElementById('formNilai').reset(); } }

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

function deleteNilai(id) {
    if (confirm('Hapus record nilai ini?')) {
        dataNilai = dataNilai.filter(n => n.id !== id);
        saveDataToStorage();
        renderPembelajaran();
        renderDashboardAcademic();
        showToast('Nilai dihapus.');
    }
}

function renderAbsensi() {
    const tbody = document.getElementById('tbodyAbsensi');
    const selectedDateEl = document.getElementById('filterTanggalAbsensi');
    if (!tbody || !selectedDateEl) return;
    
    const selectedDate = selectedDateEl.value;
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
                <td><a class="student-link" onclick="openModalStudentProfile('${s.nis}')">${s.nama}</a></td>
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
    showToast('Absensi diperbarui.');
}

function downloadAbsensiPDF() {
    const { jsPDF } = window.jspdf;
    const selectedDate = document.getElementById('filterTanggalAbsensi').value;
    
    document.getElementById('pdfTanggal').innerText = selectedDate;
    document.getElementById('pdfGuru').innerText = currentUser ? currentUser.name : 'Guru';
    document.getElementById('pdfNamaGuruSign').innerText = currentUser ? currentUser.name : 'Guru Pengampu';

    const pdfTbody = document.getElementById('pdfTbodyAbsensi');
    pdfTbody.innerHTML = '';

    let filteredSiswa = dataSiswa;
    if (currentUser.role === 'guru_tk') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'TK');
    if (currentUser.role === 'guru_sd') filteredSiswa = dataSiswa.filter(s => s.tingkat === 'SD');

    filteredSiswa.forEach((s, index) => {
        const status = (absensiRecords[selectedDate] && absensiRecords[selectedDate][s.nis]) || 'Hadir';
        pdfTbody.innerHTML += `
            <tr>
                <td style="text-align:center;">${index + 1}</td>
                <td>${s.nis}</td>
                <td>${s.nama}</td>
                <td>${s.kelas}</td>
                <td>${status}</td>
            </tr>
        `;
    });

    const element = document.getElementById('pdfExportContainer');
    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Laporan_Absensi_${selectedDate}.pdf`);
        showToast('PDF Absensi Berhasil Diunduh!');
    });
}

function renderUsers() {
    const tbody = document.getElementById('tbodyUsers');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(usersList).forEach(uKey => {
        const u = usersList[uKey];
        const delBtn = (uKey !== 'admin') 
            ? `<button class="btn btn-danger" onclick="deleteUser('${uKey}')">🗑️ Hapus</button>`
            : `<small>Superadmin</small>`;

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

function openModalUser() { const m = document.getElementById('modalUser'); if(m) m.classList.remove('hidden'); }
function closeModalUser() { const m = document.getElementById('modalUser'); if(m) { m.classList.add('hidden'); document.getElementById('formUser').reset(); } }

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
    showToast('User berhasil disimpan!');
}

function deleteUser(username) {
    if (confirm(`Hapus pengguna "${username}"?`)) {
        delete usersList[username];
        saveDataToStorage();
        renderUsers();
        showToast('User dihapus.', 'error');
    }
}

function openModalSiswa(tingkat) {
    document.getElementById('siswaTingkat').value = tingkat;
    document.getElementById('modalSiswaTitle').innerText = `Tambah Murid Baru (${tingkat})`;
    document.getElementById('modalSiswa').classList.remove('hidden');
}
function closeModalSiswa() { const m = document.getElementById('modalSiswa'); if(m) { m.classList.add('hidden'); document.getElementById('formSiswa').reset(); } }

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
    showToast('Siswa berhasil disimpan!');
}

function deleteSiswa(nis) {
    if (confirm("Hapus murid ini?")) {
        dataSiswa = dataSiswa.filter(s => s.nis !== nis);
        saveDataToStorage();
        renderAllData();
        showToast("Siswa dihapus.", "error");
    }
}
