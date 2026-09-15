/* ==========================================================================
   EduCore — Portal Sekolah
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. DATA AWAL
   -------------------------------------------------------------------------- */
const defaultUsers = {
    admin:  { pass: 'admin123', role: 'admin',    name: 'Administrator Sekolah', avatar: 'Admin' },
    gurutk: { pass: 'tk123',    role: 'guru_tk',  name: 'Siti Rahma, S.Pd.',     avatar: 'Rahma' },
    gurusd: { pass: 'sd123',    role: 'guru_sd',  name: 'Budi Santoso, S.Pd.',   avatar: 'Budi'  }
};

const defaultEmployees = [
    { nip: 'KAY-2026-001', nama: 'Budi Santoso, S.Pd.',  dept: 'Guru SD',       status: 'Tetap',   gaji: 5000000, hp: '081234567801' },
    { nip: 'KAY-2026-002', nama: 'Siti Rahma, S.Pd.',    dept: 'Guru TK',       status: 'Tetap',   gaji: 4800000, hp: '081234567802' },
    { nip: 'KAY-2026-003', nama: 'Dewi Lestari, A.Md.',  dept: 'Administrasi',  status: 'Kontrak', gaji: 3800000, hp: '081234567803' }
];

const defaultSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi',    tingkat: 'TK', kelas: 'TK B',       ortu: 'Budi Fauzi', hp: '08123456781' },
    { nis: '102', nama: 'Anisa Putri',    tingkat: 'TK', kelas: 'TK B',       ortu: 'Hendra',     hp: '08123456784' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Rahmat',     hp: '08123456782' },
    { nis: '202', nama: 'Doni Pratama',   tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Eko',        hp: '08123456785' }
];

const defaultMapel = [
    { kode: 'TK-MTR', nama: 'Motorik & Seni',            role: 'guru_tk' },
    { kode: 'TK-BHS', nama: 'Mengenal Huruf & Bahasa',   role: 'guru_tk' },
    { kode: 'SD-MTK', nama: 'Matematika Dasar',          role: 'guru_sd' },
    { kode: 'SD-IPA', nama: 'IPAS Integrasi',            role: 'guru_sd' }
];

const defaultNilai = [
    { id: '1', nis: '101', mapelKode: 'TK-MTR', nilai: 'BSB', catatan: 'Perkembangan motorik halus sangat baik', role: 'guru_tk' },
    { id: '2', nis: '201', mapelKode: 'SD-MTK', nilai: '90',  catatan: 'Sudah paham perkalian dasar',            role: 'guru_sd' }
];

const ROLE_LABEL   = { admin: 'Administrator', guru_tk: 'Guru TK', guru_sd: 'Guru SD' };
const ROLE_TINGKAT = { guru_tk: 'TK', guru_sd: 'SD' };

const PAGE_TITLE = {
    'dashboard':               'Ringkasan',
    'manajemen-hr':            'Data karyawan',
    'manajemen-user':          'Akun pengguna',
    'manajemen-pembelajaran':  'Mapel & nilai',
    'siswa-tk':                'Murid TK',
    'siswa-sd':                'Murid SD',
    'absensi':                 'Absensi harian',
    'rekap-absensi-gas':       'Rekap Google Sheets'
};

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzTziMYccKpqpum3QRAgsY6fET9UOTVIIohcI5PVphoUGEa_TMIOiLFUaR3SQ_wNWlM10WEQ36XA0V/pub?output=csv';

/* --------------------------------------------------------------------------
   2. STATE
   -------------------------------------------------------------------------- */
function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return structuredCloneSafe(fallback);
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object') return structuredCloneSafe(fallback);
        return parsed;
    } catch (err) {
        console.warn(`Data "${key}" rusak, memakai data bawaan.`, err);
        return structuredCloneSafe(fallback);
    }
}

function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
}

let usersList       = readStore('educore_users', defaultUsers);
let employeesList   = readStore('educore_employees', defaultEmployees);
let dataSiswa       = readStore('educore_siswa', defaultSiswa);
let dataMapel       = readStore('educore_mapel', defaultMapel);
let dataNilai       = readStore('educore_nilai', defaultNilai);
let absensiRecords  = readStore('educore_absensi', {});

let currentUser = null;
let attendanceChartInstance = null;
let clockInterval = null;
let toastTimer = null;
let pendingConfirmCallback = null;
let activeTab = 'dashboard';

function saveDataToStorage() {
    try {
        localStorage.setItem('educore_users', JSON.stringify(usersList));
        localStorage.setItem('educore_employees', JSON.stringify(employeesList));
        localStorage.setItem('educore_siswa', JSON.stringify(dataSiswa));
        localStorage.setItem('educore_mapel', JSON.stringify(dataMapel));
        localStorage.setItem('educore_nilai', JSON.stringify(dataNilai));
        localStorage.setItem('educore_absensi', JSON.stringify(absensiRecords));
    } catch (err) {
        showToast('Penyimpanan browser penuh. Data terakhir tidak tersimpan.', 'error');
    }
}

/* --------------------------------------------------------------------------
   3. UTILITAS
   -------------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

/* Mencegah tanda kutip / tag di nama murid merusak markup dan atribut onclick. */
function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* Untuk nilai yang ditaruh di dalam string JS pada atribut onclick:
   escape JS dulu, baru escape HTML, agar tanda kutip tidak memutus kode. */
function escAttr(value) {
    return esc(String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

function avatarUrl(seed) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'user')}`;
}

function rupiah(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function todayISO() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split('T')[0];
}

function tingkatTag(tingkat) {
    const cls = tingkat === 'TK' ? 'tag-tk' : 'tag-sd';
    return `<span class="badge-role ${cls}">${esc(tingkat)}</span>`;
}

function showToast(msg, type = 'success') {
    const toast = $('toast');
    if (!toast) return;
    toast.innerHTML = `<span aria-hidden="true">${type === 'success' ? '✓' : '!'}</span><span>${esc(msg)}</span>`;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

function showConfirmDialog(title, message, onConfirm, okLabel = 'Ya, lanjutkan') {
    $('confirmTitle').textContent = title;
    $('confirmMessage').textContent = message;
    $('confirmOkBtn').textContent = okLabel;
    pendingConfirmCallback = onConfirm;
    $('modalConfirm').classList.remove('hidden');
    $('confirmOkBtn').focus();
}

function closeConfirmModal(isConfirmed) {
    $('modalConfirm').classList.add('hidden');
    const cb = pendingConfirmCallback;
    pendingConfirmCallback = null;
    if (isConfirmed && cb) cb();
}

/* colspan dihitung dari jumlah kolom tabel — `colspan="100%"` bukan HTML yang sah. */
function getEmptyStateHTML(message = 'Belum ada data.', tbodyEl = null, title = 'Belum ada data') {
    let cols = 5;
    if (tbodyEl) {
        const head = tbodyEl.closest('table')?.querySelector('thead tr');
        if (head) cols = head.children.length;
    }
    return `<tr><td colspan="${cols}" class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">◌</div>
        <h4>${esc(title)}</h4>
        <p>${esc(message)}</p>
    </td></tr>`;
}

function setEmpty(tbodyEl, message, title) {
    tbodyEl.innerHTML = getEmptyStateHTML(message, tbodyEl, title);
}

/* --------------------------------------------------------------------------
   4. RUANG LINGKUP PERAN
   -------------------------------------------------------------------------- */
function scopedSiswa(list = dataSiswa) {
    if (!currentUser) return [];
    const tingkat = ROLE_TINGKAT[currentUser.role];
    return tingkat ? list.filter(s => s.tingkat === tingkat) : list;
}

function scopedMapel() {
    if (!currentUser) return [];
    return currentUser.role === 'admin' ? dataMapel : dataMapel.filter(m => m.role === currentUser.role);
}

function scopedNilai() {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return dataNilai;
    const tingkat = ROLE_TINGKAT[currentUser.role];
    const nisSet = new Set(dataSiswa.filter(s => s.tingkat === tingkat).map(s => s.nis));
    return dataNilai.filter(n => n.role === currentUser.role || nisSet.has(n.nis));
}

/* --------------------------------------------------------------------------
   5. INISIALISASI
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = $('filterTanggalAbsensi');
    if (dateInput) dateInput.value = todayISO();

    $('formLogin')?.addEventListener('submit', handleLogin);

    $('togglePass')?.addEventListener('click', () => {
        const input = $('loginPass');
        const shown = input.type === 'text';
        input.type = shown ? 'password' : 'text';
        $('togglePass').setAttribute('aria-label', shown ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi');
        input.focus();
    });

    /* Tutup dropdown notifikasi saat klik di luar. */
    document.addEventListener('click', (e) => {
        const wrapper = $('notifWrapper');
        if (wrapper && !wrapper.contains(e.target)) closeNotifDropdown();
    });

    /* Esc menutup lapisan teratas; klik latar menutup modal. */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const openModal = [...document.querySelectorAll('[data-modal]')].reverse().find(m => !m.classList.contains('hidden'));
        if (openModal) {
            if (openModal.id === 'modalConfirm') closeConfirmModal(false);
            else openModal.classList.add('hidden');
            return;
        }
        if (!$('notifDropdown')?.classList.contains('hidden')) { closeNotifDropdown(); return; }
        closeSidebar();
    });

    document.querySelectorAll('[data-modal]').forEach(modal => {
        modal.addEventListener('mousedown', (e) => {
            if (e.target !== modal) return;
            if (modal.id === 'modalConfirm') closeConfirmModal(false);
            else modal.classList.add('hidden');
        });
    });

    restoreSession();
});

/* Menyegarkan halaman tidak lagi melempar pengguna keluar. */
function restoreSession() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('educore_session') || 'null'); } catch (_) { /* abaikan */ }
    if (saved && usersList[saved.username] && usersList[saved.username].role === saved.role) {
        enterPortal(saved.username, false);
    }
}

/* --------------------------------------------------------------------------
   6. MASUK & KELUAR
   -------------------------------------------------------------------------- */
function handleLogin(e) {
    if (e) e.preventDefault();

    const username = $('loginUser').value.trim().toLowerCase();
    const password = $('loginPass').value;
    const userObj = usersList[username];

    /* Peran diambil dari akun, bukan dari pilihan pengguna — dropdown peran
       di halaman masuk hanya membuat login gagal saat salah pilih. */
    if (!userObj || userObj.pass !== password) {
        showToast('Nama pengguna atau kata sandi tidak cocok.', 'error');
        $('loginPass').value = '';
        $('loginPass').focus();
        return;
    }

    enterPortal(username, true);
}

function enterPortal(username, announce) {
    const userObj = usersList[username];
    currentUser = { username, ...userObj };

    try {
        sessionStorage.setItem('educore_session', JSON.stringify({ username, role: userObj.role }));
    } catch (_) { /* mode privat: abaikan */ }

    $('loginPage').classList.add('hidden');
    $('mainApp').classList.remove('hidden');

    $('userNameDisplay').textContent = currentUser.name;
    $('userNameDisplay').title = currentUser.name;
    $('userRoleBadge').textContent = ROLE_LABEL[currentUser.role] || currentUser.role;
    $('userAvatar').src = avatarUrl(currentUser.avatar || currentUser.name);

    applyRolePermissions(currentUser.role);
    startRealtimeClock();
    renderNotifications();

    if (announce) showToast(`Berhasil masuk sebagai ${ROLE_LABEL[currentUser.role]}.`);
}

function handleLogout() {
    showConfirmDialog('Keluar dari portal', 'Anda akan kembali ke halaman masuk.', () => {
        currentUser = null;
        clearInterval(clockInterval);
        clockInterval = null;

        if (attendanceChartInstance) { attendanceChartInstance.destroy(); attendanceChartInstance = null; }
        try { sessionStorage.removeItem('educore_session'); } catch (_) { /* abaikan */ }

        closeNotifDropdown();
        closeSidebar();
        document.querySelectorAll('[data-modal]').forEach(m => m.classList.add('hidden'));

        $('mainApp').classList.add('hidden');
        $('loginPage').classList.remove('hidden');
        $('formLogin').reset();
        $('loginPass').type = 'password';
        $('loginUser').focus();

        showToast('Anda sudah keluar.');
    }, 'Keluar');
}

/* --------------------------------------------------------------------------
   7. NAVIGASI
   -------------------------------------------------------------------------- */
function applyRolePermissions(role) {
    /* Sebelumnya judul kelompok menu selalu tampil karena kelas `menu-divider`
       ikut dianggap izin — guru SD jadi melihat judul "Peserta didik TK". */
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        const roles = (li.dataset.roles || '').split(',').map(r => r.trim()).filter(Boolean);
        li.classList.toggle('hidden', !roles.includes(role));
    });

    /* Judul kelompok tanpa menu di bawahnya ikut disembunyikan. */
    document.querySelectorAll('.sidebar-menu li.menu-divider').forEach(divider => {
        let next = divider.nextElementSibling;
        let hasVisibleChild = false;
        while (next && !next.classList.contains('menu-divider')) {
            if (!next.classList.contains('hidden')) { hasVisibleChild = true; break; }
            next = next.nextElementSibling;
        }
        if (!hasVisibleChild) divider.classList.add('hidden');
    });

    switchTab('dashboard');
}

function switchTab(tabName, event) {
    if (event) event.preventDefault();
    if (!currentUser) return;

    /* Menutup akses langsung ke tab yang bukan hak peran ini. */
    const navLink = document.querySelector(`.nav-link[data-tab="${tabName}"]`);
    if (!navLink || navLink.closest('li').classList.contains('hidden')) {
        tabName = 'dashboard';
    }

    activeTab = tabName;

    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    $(`section-${tabName}`)?.classList.remove('hidden');

    /* Status aktif kini juga benar saat tab dibuka lewat kode, bukan hanya klik. */
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tabName);
    });

    $('pageMainHeading').textContent = PAGE_TITLE[tabName] || 'Portal';
    closeSidebar();
    window.scrollTo(0, 0);

    if (tabName === 'dashboard')               renderDashboardAcademic();
    if (tabName === 'manajemen-hr')            renderEmployees();
    if (tabName === 'manajemen-user')          renderUsers();
    if (tabName === 'manajemen-pembelajaran')  renderPembelajaran();
    if (tabName === 'siswa-tk' || tabName === 'siswa-sd') renderSiswaTables(dataSiswa);
    if (tabName === 'absensi')                 renderAbsensi();
    if (tabName === 'rekap-absensi-gas')       fetchGoogleSheetAttendance();
}

function openSidebar() {
    $('sidebar').classList.add('is-open');
    $('sidebarScrim').classList.remove('hidden');
}
function closeSidebar() {
    $('sidebar')?.classList.remove('is-open');
    $('sidebarScrim')?.classList.add('hidden');
}

/* --------------------------------------------------------------------------
   8. JAM & NOTIFIKASI
   -------------------------------------------------------------------------- */
function startRealtimeClock() {
    clearInterval(clockInterval);

    function updateClock() {
        if (!currentUser) return;
        const now = new Date();
        const h = now.getHours();
        let greeting = 'Selamat malam';
        if (h >= 3 && h < 11) greeting = 'Selamat pagi';
        else if (h >= 11 && h < 15) greeting = 'Selamat siang';
        else if (h >= 15 && h < 18) greeting = 'Selamat sore';

        const namaDepan = currentUser.name.split(',')[0];
        $('greetingTitle').textContent = `${greeting}, ${namaDepan}`;

        const tanggal = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        $('realtimeClock').textContent = `${tanggal} · ${jam}`;
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function toggleNotifDropdown(event) {
    if (event) event.stopPropagation();
    const dd = $('notifDropdown');
    const open = dd.classList.toggle('hidden') === false;
    $('notifBtn').setAttribute('aria-expanded', String(open));
}

function closeNotifDropdown() {
    $('notifDropdown')?.classList.add('hidden');
    $('notifBtn')?.setAttribute('aria-expanded', 'false');
}

function renderNotifications() {
    if (!currentUser) return;
    const list = $('notifList');
    const badge = $('notifCount');

    $('notifRoleTag').textContent = ROLE_LABEL[currentUser.role];

    const items = [];
    const muridSaya = scopedSiswa();
    const belumDiabsen = muridSaya.filter(s => !(absensiRecords[todayISO()] || {})[s.nis]);

    if (belumDiabsen.length > 0) {
        items.push({ text: `${belumDiabsen.length} murid belum diabsen hari ini.`, time: 'Perlu tindakan' });
    }
    if (currentUser.role === 'admin') {
        items.push({ text: `${employeesList.length} karyawan aktif di data kepegawaian.`, time: 'Ringkasan' });
        items.push({ text: `${Object.keys(usersList).length} akun memiliki akses portal.`, time: 'Ringkasan' });
    } else {
        items.push({ text: `${scopedMapel().length} mata pelajaran tercatat atas nama Anda.`, time: 'Ringkasan' });
    }

    badge.textContent = items.length;
    badge.classList.toggle('hidden', items.length === 0);

    list.innerHTML = items.length === 0
        ? `<div class="notif-item">Tidak ada pemberitahuan.</div>`
        : items.map(i => `<div class="notif-item"><div>${esc(i.text)}</div><small>${esc(i.time)}</small></div>`).join('');
}

/* --------------------------------------------------------------------------
   9. KEPEGAWAIAN
   -------------------------------------------------------------------------- */
function filterEmployeeTable(query) {
    const q = query.trim().toLowerCase();
    const filtered = !q ? employeesList : employeesList.filter(e =>
        e.nama.toLowerCase().includes(q) || e.nip.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q)
    );
    renderEmployees(filtered, Boolean(q));
}

function renderEmployees(list = employeesList, isFiltered = false) {
    const tbody = $('tbodyHR');
    if (!tbody) return;

    if (list.length === 0) {
        setEmpty(tbody,
            isFiltered ? 'Ubah kata kunci pencarian.' : 'Tambahkan karyawan pertama lewat tombol di atas.',
            isFiltered ? 'Tidak ada yang cocok' : 'Belum ada karyawan');
        return;
    }

    tbody.innerHTML = list.map(emp => `
        <tr>
            <td class="num cell-strong">${esc(emp.nip)}</td>
            <td>${esc(emp.nama)}</td>
            <td><span class="badge-role">${esc(emp.dept)}</span></td>
            <td>${esc(emp.status)}</td>
            <td class="num">${rupiah(emp.gaji)}</td>
            <td class="num">${esc(emp.hp)}</td>
            <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteEmployee('${escAttr(emp.nip)}')">Hapus</button></div></td>
        </tr>
    `).join('');
}

function openModalHR() { $('modalHR').classList.remove('hidden'); $('hrNip').focus(); }
function closeModalHR() { $('modalHR').classList.add('hidden'); $('formHR').reset(); }

function saveEmployee(e) {
    e.preventDefault();
    const nip = $('hrNip').value.trim();

    if (employeesList.some(emp => emp.nip.toLowerCase() === nip.toLowerCase())) {
        showToast('NIP ini sudah dipakai karyawan lain.', 'error');
        $('hrNip').focus();
        return;
    }

    employeesList.push({
        nip,
        nama: $('hrNama').value.trim(),
        dept: $('hrDept').value,
        status: $('hrStatus').value,
        gaji: parseFloat($('hrGaji').value) || 0,
        hp: $('hrHp').value.trim()
    });

    saveDataToStorage();
    renderEmployees();
    renderNotifications();
    closeModalHR();
    showToast('Karyawan tersimpan.');
}

function confirmDeleteEmployee(nip) {
    const emp = employeesList.find(e => e.nip === nip);
    showConfirmDialog('Hapus karyawan', `Data ${emp ? emp.nama : nip} akan dihapus permanen.`, () => {
        employeesList = employeesList.filter(e => e.nip !== nip);
        saveDataToStorage();
        renderEmployees();
        renderNotifications();
        showToast('Karyawan dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   10. MURID
   -------------------------------------------------------------------------- */
function filterSiswaTable(tingkat, query) {
    const q = query.trim().toLowerCase();
    const filtered = dataSiswa.filter(s =>
        s.tingkat === tingkat && (!q || s.nama.toLowerCase().includes(q) || String(s.nis).toLowerCase().includes(q) || s.kelas.toLowerCase().includes(q))
    );
    renderSiswaTables(filtered, tingkat, Boolean(q));
}

function renderSiswaTables(listSiswa, specificTingkat = null, isFiltered = false) {
    const targets = [
        { tingkat: 'TK', tbody: $('tbodySiswaTK') },
        { tingkat: 'SD', tbody: $('tbodySiswaSD') }
    ];

    targets.forEach(({ tingkat, tbody }) => {
        if (!tbody) return;
        if (specificTingkat && specificTingkat !== tingkat) return;

        const rows = listSiswa.filter(s => s.tingkat === tingkat);
        if (rows.length === 0) {
            setEmpty(tbody,
                isFiltered ? 'Ubah kata kunci pencarian.' : `Tambahkan murid ${tingkat} lewat tombol di atas.`,
                isFiltered ? 'Tidak ada yang cocok' : `Belum ada murid ${tingkat}`);
            return;
        }
        tbody.innerHTML = rows.map(createSiswaRowHTML).join('');
    });
}

function createSiswaRowHTML(s) {
    return `<tr>
        <td class="num">${esc(s.nis)}</td>
        <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(s.nis)}')" onkeydown="if(event.key==='Enter')openModalStudentProfile('${escAttr(s.nis)}')">${esc(s.nama)}</a></td>
        <td>${esc(s.kelas)}</td>
        <td>${esc(s.ortu)}</td>
        <td class="num">${esc(s.hp)}</td>
        <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteSiswa('${escAttr(s.nis)}')">Hapus</button></div></td>
    </tr>`;
}

function openModalSiswa(tingkat) {
    $('siswaTingkat').value = tingkat;
    $('modalSiswaTitle').textContent = `Tambah murid ${tingkat}`;
    $('modalSiswaSub').textContent = tingkat === 'TK'
        ? 'Nomor induk harus unik. Isi kelompok dengan TK A atau TK B.'
        : 'Nomor induk harus unik. Isi kelas dengan SD Kelas 1 sampai 6.';
    $('siswaKelas').placeholder = tingkat === 'TK' ? 'TK B' : 'SD Kelas 1';
    $('modalSiswa').classList.remove('hidden');
    $('siswaNis').focus();
}
function closeModalSiswa() { $('modalSiswa').classList.add('hidden'); $('formSiswa').reset(); }

function saveSiswa(e) {
    e.preventDefault();
    const nis = $('siswaNis').value.trim();

    /* Sebelumnya NIS ganda bisa masuk, lalu profil dan nilai menempel ke murid yang salah. */
    if (dataSiswa.some(s => String(s.nis) === nis)) {
        showToast('Nomor induk ini sudah terdaftar.', 'error');
        $('siswaNis').focus();
        return;
    }

    dataSiswa.push({
        nis,
        nama: $('siswaNama').value.trim(),
        tingkat: $('siswaTingkat').value,
        kelas: $('siswaKelas').value.trim(),
        ortu: $('siswaOrtu').value.trim(),
        hp: $('siswaHp').value.trim()
    });

    saveDataToStorage();
    renderSiswaTables(dataSiswa);
    renderDashboardAcademic();
    renderNotifications();
    closeModalSiswa();
    showToast('Murid tersimpan.');
}

function confirmDeleteSiswa(nis) {
    const s = dataSiswa.find(item => String(item.nis) === String(nis));
    showConfirmDialog('Hapus murid', `${s ? s.nama : nis} beserta riwayat nilainya akan dihapus.`, () => {
        dataSiswa = dataSiswa.filter(item => String(item.nis) !== String(nis));
        dataNilai = dataNilai.filter(n => String(n.nis) !== String(nis));
        Object.keys(absensiRecords).forEach(date => { delete absensiRecords[date][nis]; });

        saveDataToStorage();
        renderSiswaTables(dataSiswa);
        renderPembelajaran();
        renderDashboardAcademic();
        renderNotifications();
        showToast('Murid dihapus.');
    }, 'Hapus');
}

function openModalStudentProfile(nis) {
    const s = dataSiswa.find(item => String(item.nis) === String(nis));
    if (!s) { showToast('Data murid tidak ditemukan.', 'error'); return; }

    $('profileNama').textContent = s.nama;
    $('profileNis').textContent = s.nis;
    $('profileTingkatKelas').textContent = `${s.tingkat} · ${s.kelas}`;
    $('profileTingkatKelas').className = `badge-role ${s.tingkat === 'TK' ? 'tag-tk' : 'tag-sd'}`;
    $('profileOrtu').textContent = s.ortu;
    $('profileHp').textContent = s.hp;
    $('profileAvatar').src = avatarUrl(s.nama);

    const tbody = $('profileTbodyNilai');
    const grades = dataNilai.filter(n => String(n.nis) === String(nis));

    if (grades.length === 0) {
        setEmpty(tbody, 'Nilai akan muncul setelah guru mengisinya.', 'Belum ada penilaian');
    } else {
        tbody.innerHTML = grades.map(n => {
            const m = dataMapel.find(mp => mp.kode === n.mapelKode);
            return `<tr>
                <td>${esc(m ? m.nama : n.mapelKode)}</td>
                <td><span class="badge-role tag-ok">${esc(n.nilai)}</span></td>
                <td class="text-muted">${esc(n.catatan)}</td>
            </tr>`;
        }).join('');
    }

    $('modalStudentProfile').classList.remove('hidden');
}

function closeModalStudentProfile() { $('modalStudentProfile').classList.add('hidden'); }

/* --------------------------------------------------------------------------
   11. RINGKASAN & GRAFIK
   -------------------------------------------------------------------------- */
function renderDashboardAcademic() {
    if (!currentUser) return;

    const role = currentUser.role;
    const muridSaya = scopedSiswa();
    const mapelSaya = scopedMapel();
    const nilaiSaya = scopedNilai();

    $('dashRoleTitle').textContent = ROLE_LABEL[role];
    $('dashLabelSiswa').textContent = role === 'admin' ? 'Total murid TK & SD' : `Murid ${ROLE_TINGKAT[role]} Anda`;
    $('dashTotalSiswa').textContent = muridSaya.length;

    const hariIni = absensiRecords[todayISO()] || {};
    const tercatat = muridSaya.filter(s => hariIni[s.nis]);
    const hadir = tercatat.filter(s => hariIni[s.nis] === 'Hadir').length;
    $('dashHadirHariIni').textContent = tercatat.length === 0 ? '—' : `${Math.round((hadir / tercatat.length) * 100)}%`;

    $('chartScopeTag').textContent = role === 'admin' ? 'Semua jenjang' : ROLE_TINGKAT[role];

    /* Mapel aktif */
    const mapelListEl = $('dashMapelList');
    mapelListEl.innerHTML = mapelSaya.length === 0
        ? `<p class="text-muted" style="font-size:.875rem;margin-top:10px;">Belum ada mata pelajaran. Tambahkan dari halaman Mapel &amp; nilai.</p>`
        : mapelSaya.map(m => `
            <div class="schedule-item">
                <span class="badge-time">${esc(m.kode)}</span>
                <strong>${esc(m.nama)}</strong>
            </div>`).join('');

    /* Penilaian terbaru — 6 terakhir saja agar ringkasan tetap ringkas. */
    const tbody = $('dashTbodyNilai');
    const terbaru = [...nilaiSaya].reverse().slice(0, 6);
    if (terbaru.length === 0) {
        setEmpty(tbody, 'Nilai yang diinput akan tampil di sini.', 'Belum ada penilaian');
    } else {
        tbody.innerHTML = terbaru.map(n => {
            const s = dataSiswa.find(x => String(x.nis) === String(n.nis));
            const m = dataMapel.find(x => x.kode === n.mapelKode);
            return `<tr>
                <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(n.nis)}')">${esc(s ? s.nama : n.nis)}</a></td>
                <td>${esc(m ? m.nama : n.mapelKode)}</td>
                <td><span class="badge-role tag-ok">${esc(n.nilai)}</span></td>
                <td class="text-muted">${esc(n.catatan)}</td>
            </tr>`;
        }).join('');
    }

    renderAttendanceChart();
}

/* Grafik memakai absensi yang benar-benar tercatat, bukan angka contoh. */
function renderAttendanceChart() {
    const canvas = $('attendanceChart');
    /* Menggambar di kanvas tersembunyi membuat ukurannya nol saat tab dibuka. */
    if (!canvas || typeof Chart === 'undefined' || activeTab !== 'dashboard') return;

    const murid = scopedSiswa();
    const labels = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        const key = d.toISOString().split('T')[0];

        labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));

        const rec = absensiRecords[key] || {};
        const tercatat = murid.filter(s => rec[s.nis]);
        values.push(tercatat.length === 0 ? null : Math.round((tercatat.filter(s => rec[s.nis] === 'Hadir').length / tercatat.length) * 100));
    }

    if (attendanceChartInstance) attendanceChartInstance.destroy();

    attendanceChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Kehadiran',
                data: values,
                borderColor: '#0e6f66',
                backgroundColor: 'rgba(14, 111, 102, .1)',
                fill: true,
                tension: .32,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#0e6f66',
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 400 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.parsed.y === null ? 'Belum diabsen' : `Hadir ${ctx.parsed.y}%`
                    }
                }
            },
            scales: {
                y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 25 }, grid: { color: '#eef1f4' } },
                x: { grid: { display: false } }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   12. MAPEL & NILAI
   -------------------------------------------------------------------------- */
function renderPembelajaran() {
    if (!currentUser) return;

    const mapelSaya = scopedMapel();
    const nilaiSaya = scopedNilai();

    $('pembelajaranScope').textContent = currentUser.role === 'admin'
        ? 'Seluruh kurikulum TK dan SD.'
        : `Kurikulum dan penilaian jenjang ${ROLE_TINGKAT[currentUser.role]}.`;

    const tbodyMapel = $('tbodyMapel');
    if (mapelSaya.length === 0) {
        setEmpty(tbodyMapel, 'Tambahkan mata pelajaran lewat tombol di atas.', 'Belum ada mapel');
    } else {
        tbodyMapel.innerHTML = mapelSaya.map(m => `
            <tr>
                <td class="cell-strong">${esc(m.kode)}</td>
                <td>${esc(m.nama)}</td>
                <td>${tingkatTag(ROLE_TINGKAT[m.role] || '—')}</td>
                <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteMapel('${escAttr(m.kode)}')">Hapus</button></div></td>
            </tr>`).join('');
    }

    const tbodyNilai = $('tbodyNilai');
    if (nilaiSaya.length === 0) {
        setEmpty(tbodyNilai, 'Penilaian yang diinput akan tampil di sini.', 'Belum ada nilai');
    } else {
        tbodyNilai.innerHTML = [...nilaiSaya].reverse().map(n => {
            const s = dataSiswa.find(x => String(x.nis) === String(n.nis));
            const m = dataMapel.find(x => x.kode === n.mapelKode);
            return `<tr>
                <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(n.nis)}')">${esc(s ? s.nama : n.nis)}</a></td>
                <td>${esc(m ? m.nama : n.mapelKode)}</td>
                <td class="cell-strong">${esc(n.nilai)}</td>
                <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteNilai('${escAttr(n.id)}')">Hapus</button></div></td>
            </tr>`;
        }).join('');
    }
}

function openModalMapel() {
    /* Admin memilih jenjang; guru terkunci ke jenjangnya sendiri.
       Sebelumnya mapel buatan admin selalu masuk ke jenjang SD. */
    const isAdmin = currentUser.role === 'admin';
    $('mapelJenjangGroup').classList.toggle('hidden', !isAdmin);
    $('mapelRole').value = isAdmin ? 'guru_sd' : currentUser.role;
    $('mapelKode').placeholder = (ROLE_TINGKAT[currentUser.role] || 'SD') + '-IPA';
    $('modalMapel').classList.remove('hidden');
    $('mapelKode').focus();
}
function closeModalMapel() { $('modalMapel').classList.add('hidden'); $('formMapel').reset(); }

function saveMapel(e) {
    e.preventDefault();
    const kode = $('mapelKode').value.trim().toUpperCase();

    if (dataMapel.some(m => m.kode === kode)) {
        showToast('Kode mapel ini sudah dipakai.', 'error');
        $('mapelKode').focus();
        return;
    }

    dataMapel.push({
        kode,
        nama: $('mapelNama').value.trim(),
        role: currentUser.role === 'admin' ? $('mapelRole').value : currentUser.role
    });

    saveDataToStorage();
    renderPembelajaran();
    renderDashboardAcademic();
    renderNotifications();
    closeModalMapel();
    showToast('Mata pelajaran tersimpan.');
}

function confirmDeleteMapel(kode) {
    const terpakai = dataNilai.filter(n => n.mapelKode === kode).length;
    const pesan = terpakai > 0
        ? `Mapel ini punya ${terpakai} rekam nilai yang ikut terhapus.`
        : 'Mata pelajaran akan dihapus dari kurikulum.';

    showConfirmDialog('Hapus mata pelajaran', pesan, () => {
        dataMapel = dataMapel.filter(m => m.kode !== kode);
        dataNilai = dataNilai.filter(n => n.mapelKode !== kode);
        saveDataToStorage();
        renderPembelajaran();
        renderDashboardAcademic();
        showToast('Mata pelajaran dihapus.');
    }, 'Hapus');
}

function openModalNilai() {
    const mapelSaya = scopedMapel();
    if (mapelSaya.length === 0) {
        showToast('Tambahkan mata pelajaran dulu sebelum input nilai.', 'error');
        return;
    }

    $('nilaiMapelSelect').innerHTML = mapelSaya
        .map(m => `<option value="${esc(m.kode)}">${esc(m.nama)} (${esc(ROLE_TINGKAT[m.role] || '-')})</option>`).join('');

    syncNilaiSiswaOptions();
    $('modalNilai').classList.remove('hidden');
}

/* Daftar murid mengikuti jenjang mapel yang dipilih.
   Sebelumnya admin selalu hanya melihat murid SD di sini. */
function syncNilaiSiswaOptions() {
    const kode = $('nilaiMapelSelect').value;
    const mapel = dataMapel.find(m => m.kode === kode);
    const tingkat = mapel ? ROLE_TINGKAT[mapel.role] : null;
    const list = tingkat ? dataSiswa.filter(s => s.tingkat === tingkat) : dataSiswa;

    const select = $('nilaiSiswaSelect');
    select.innerHTML = list.length === 0
        ? `<option value="">Belum ada murid di jenjang ini</option>`
        : list.map(s => `<option value="${esc(s.nis)}">${esc(s.nama)} — ${esc(s.kelas)}</option>`).join('');
    select.disabled = list.length === 0;
}

function closeModalNilai() { $('modalNilai').classList.add('hidden'); $('formNilai').reset(); }

function saveNilai(e) {
    e.preventDefault();
    const nis = $('nilaiSiswaSelect').value;
    if (!nis) { showToast('Tidak ada murid yang bisa dinilai di jenjang ini.', 'error'); return; }

    const kode = $('nilaiMapelSelect').value;
    const mapel = dataMapel.find(m => m.kode === kode);

    dataNilai.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nis,
        mapelKode: kode,
        nilai: $('nilaiAngka').value.trim(),
        catatan: $('nilaiCatatan').value.trim(),
        role: mapel ? mapel.role : currentUser.role   /* ikut jenjang mapel, bukan dipaksa ke guru_sd */
    });

    saveDataToStorage();
    renderPembelajaran();
    renderDashboardAcademic();
    closeModalNilai();
    showToast('Penilaian tersimpan.');
}

function confirmDeleteNilai(id) {
    showConfirmDialog('Hapus penilaian', 'Rekam nilai ini akan dihapus permanen.', () => {
        dataNilai = dataNilai.filter(n => n.id !== id);
        saveDataToStorage();
        renderPembelajaran();
        renderDashboardAcademic();
        showToast('Penilaian dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   13. ABSENSI
   -------------------------------------------------------------------------- */
const STATUS_ABSEN = ['Hadir', 'Izin', 'Sakit', 'Alpa'];

function renderAbsensi() {
    if (!currentUser) return;

    const tbody = $('tbodyAbsensi');
    const dateInput = $('filterTanggalAbsensi');

    /* Tanggal kosong sebelumnya membuat data absensi tersimpan di kunci "". */
    if (!dateInput.value) dateInput.value = todayISO();
    const tanggal = dateInput.value;

    $('absensiScope').textContent = currentUser.role === 'admin'
        ? 'Seluruh murid TK dan SD. Perubahan tersimpan otomatis.'
        : `Murid jenjang ${ROLE_TINGKAT[currentUser.role]}. Perubahan tersimpan otomatis.`;

    const murid = scopedSiswa();
    if (murid.length === 0) {
        setEmpty(tbody, 'Tambahkan murid dulu di menu peserta didik.', 'Belum ada murid');
        return;
    }

    const rec = absensiRecords[tanggal] || {};

    tbody.innerHTML = murid.map(s => {
        const status = rec[s.nis] || '';
        const options = STATUS_ABSEN
            .map(v => `<option value="${v}"${status === v ? ' selected' : ''}>${v}</option>`).join('');
        return `<tr>
            <td class="num">${esc(s.nis)}</td>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(s.nis)}')">${esc(s.nama)}</a></td>
            <td>${tingkatTag(s.tingkat)}</td>
            <td>${esc(s.kelas)}</td>
            <td>
                <select class="select-inline" onchange="updateAbsensi('${escAttr(tanggal)}','${escAttr(s.nis)}',this.value)">
                    <option value=""${status ? '' : ' selected'}>Belum diisi</option>
                    ${options}
                </select>
            </td>
        </tr>`;
    }).join('');
}

function updateAbsensi(date, nis, status) {
    if (!absensiRecords[date]) absensiRecords[date] = {};
    if (status) absensiRecords[date][nis] = status;
    else delete absensiRecords[date][nis];

    saveDataToStorage();
    renderNotifications();
    if (date === todayISO()) renderDashboardAcademic();
}

function markAllPresent() {
    const tanggal = $('filterTanggalAbsensi').value || todayISO();
    const murid = scopedSiswa();
    if (murid.length === 0) { showToast('Belum ada murid untuk diabsen.', 'error'); return; }

    showConfirmDialog('Tandai semua hadir', `${murid.length} murid akan ditandai hadir pada ${tanggal}.`, () => {
        if (!absensiRecords[tanggal]) absensiRecords[tanggal] = {};
        murid.forEach(s => { absensiRecords[tanggal][s.nis] = 'Hadir'; });
        saveDataToStorage();
        renderAbsensi();
        renderNotifications();
        renderDashboardAcademic();
        showToast('Semua murid ditandai hadir.');
    }, 'Tandai hadir');
}

/* --------------------------------------------------------------------------
   14. GOOGLE SHEETS
   -------------------------------------------------------------------------- */
async function fetchGoogleSheetAttendance() {
    const loadingEl = $('loadingSheet');
    const theadEl = $('theadGAS');
    const tbodyEl = $('tbodyGAS');
    const btn = $('btnSyncSheet');

    loadingEl.classList.remove('hidden');
    btn.disabled = true;
    theadEl.innerHTML = '';
    tbodyEl.innerHTML = '';

    try {
        const proxy = 'https://api.allorigins.win/raw?url=';
        const res = await fetch(proxy + encodeURIComponent(GOOGLE_SHEET_CSV_URL));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const rows = parseCSV(await res.text()).filter(r => r.some(cell => cell !== ''));

        if (rows.length <= 1) {
            setEmpty(tbodyEl, 'Spreadsheet terhubung tetapi belum berisi baris data.', 'Spreadsheet kosong');
            return;
        }

        theadEl.innerHTML = `<tr>${rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
        tbodyEl.innerHTML = rows.slice(1)
            .map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');

        showToast(`${rows.length - 1} baris berhasil ditarik.`);
    } catch (err) {
        theadEl.innerHTML = '';
        setEmpty(tbodyEl, 'Periksa koneksi internet dan pastikan spreadsheet dipublikasikan ke web sebagai CSV.', 'Data gagal ditarik');
        showToast('Gagal menarik data spreadsheet.', 'error');
    } finally {
        loadingEl.classList.add('hidden');
        btn.disabled = false;
    }
}

/* Menangani kutip ganda ("") dan carriage return dari CSV Google. */
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; }
                else inQuotes = false;
            } else cell += ch;
            continue;
        }

        if (ch === '"') inQuotes = true;
        else if (ch === ',') { row.push(cell.trim()); cell = ''; }
        else if (ch === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
        else if (ch !== '\r') cell += ch;
    }

    row.push(cell.trim());
    rows.push(row);
    return rows;
}

/* --------------------------------------------------------------------------
   15. AKUN PENGGUNA
   -------------------------------------------------------------------------- */
function renderUsers() {
    const tbody = $('tbodyUsers');
    if (!tbody) return;

    tbody.innerHTML = Object.keys(usersList).map(key => {
        const u = usersList[key];
        const isSelf = currentUser && currentUser.username === key;
        const action = key === 'admin'
            ? '<span class="badge-role">Tidak bisa dihapus</span>'
            : `<button class="btn btn-danger btn-sm" onclick="confirmDeleteUser('${escAttr(key)}')"${isSelf ? ' disabled title="Akun yang sedang dipakai"' : ''}>Hapus</button>`;

        return `<tr>
            <td class="cell-strong">${esc(key)}</td>
            <td>${esc(u.name)}</td>
            <td><span class="badge-role ${u.role === 'admin' ? 'tag-accent' : (u.role === 'guru_tk' ? 'tag-tk' : 'tag-sd')}">${esc(ROLE_LABEL[u.role] || u.role)}</span></td>
            <td><div class="row-actions">${action}</div></td>
        </tr>`;
    }).join('');
}

function openModalUser() { $('modalUser').classList.remove('hidden'); $('userInputUsername').focus(); }
function closeModalUser() { $('modalUser').classList.add('hidden'); $('formUser').reset(); }

function saveUser(e) {
    e.preventDefault();
    const username = $('userInputUsername').value.trim().toLowerCase();

    if (!/^[a-z0-9._-]{3,}$/.test(username)) {
        showToast('Nama pengguna minimal 3 karakter, tanpa spasi.', 'error');
        $('userInputUsername').focus();
        return;
    }
    if (usersList[username]) {
        showToast('Nama pengguna ini sudah dipakai.', 'error');
        $('userInputUsername').focus();
        return;
    }

    const nama = $('userInputNama').value.trim();
    usersList[username] = {
        pass: $('userInputPassword').value,
        name: nama,
        role: $('userInputRole').value,
        avatar: nama
    };

    saveDataToStorage();
    renderUsers();
    renderNotifications();
    closeModalUser();
    showToast('Akun dibuat.');
}

function confirmDeleteUser(username) {
    if (currentUser && currentUser.username === username) {
        showToast('Akun yang sedang dipakai tidak bisa dihapus.', 'error');
        return;
    }
    showConfirmDialog('Hapus akun', `${username} tidak akan bisa masuk lagi ke portal.`, () => {
        delete usersList[username];
        saveDataToStorage();
        renderUsers();
        renderNotifications();
        showToast('Akun dihapus.');
    }, 'Hapus');
}
