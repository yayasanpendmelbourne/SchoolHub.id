/* ==========================================================================
   EduCore — Portal Sekolah
   Bagian 1 : data induk, utilitas, hak akses, navigasi
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. DATA AWAL
   -------------------------------------------------------------------------- */
const defaultSekolah = {
    npsn: '10405123',
    nama: 'TK–SD Tunas Bangsa',
    alamat: 'Jl. Melati No. 12, Pekanbaru, Riau',
    kepsek: 'Hj. Ratna Dewi, M.Pd.',
    nipKepsek: '19700101 199503 2 001',
    jenjang: 'TK & SD'
};

const defaultUsers = {
    admin:  { pass: 'admin123', role: 'admin',   name: 'Administrator Sekolah', avatar: 'Admin', tugas: { jenis: 'none' } },
    gurutk: { pass: 'tk123',    role: 'guru_tk', name: 'Siti Rahma, S.Pd.',     avatar: 'Rahma', tugas: { jenis: 'wali_kelas', kelas: 'TK B' } },
    gurusd: { pass: 'sd123',    role: 'guru_sd', name: 'Budi Santoso, S.Pd.',   avatar: 'Budi',  tugas: { jenis: 'wali_kelas', kelas: 'SD Kelas 1' } }
};

const defaultKelas = [
    { nama: 'TK A', tingkat: 'TK' },
    { nama: 'TK B', tingkat: 'TK' },
    { nama: 'SD Kelas 1', tingkat: 'SD' },
    { nama: 'SD Kelas 2', tingkat: 'SD' },
    { nama: 'SD Kelas 3', tingkat: 'SD' },
    { nama: 'SD Kelas 4', tingkat: 'SD' },
    { nama: 'SD Kelas 5', tingkat: 'SD' },
    { nama: 'SD Kelas 6', tingkat: 'SD' }
];

const defaultEmployees = [
    { nip: 'KAY-2026-001', nama: 'Budi Santoso, S.Pd.', dept: 'Guru SD',      status: 'Tetap',   gaji: 5000000, hp: '081234567801' },
    { nip: 'KAY-2026-002', nama: 'Siti Rahma, S.Pd.',   dept: 'Guru TK',      status: 'Tetap',   gaji: 4800000, hp: '081234567802' },
    { nip: 'KAY-2026-003', nama: 'Dewi Lestari, A.Md.', dept: 'Administrasi', status: 'Kontrak', gaji: 3800000, hp: '081234567803' }
];

const defaultSiswa = [
    { nis: '101', nama: 'Ahmad Fauzi',    tingkat: 'TK', kelas: 'TK B',       ortu: 'Budi Fauzi', hp: '08123456781' },
    { nis: '102', nama: 'Anisa Putri',    tingkat: 'TK', kelas: 'TK B',       ortu: 'Hendra',     hp: '08123456784' },
    { nis: '201', nama: 'Siti Nurhaliza', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Rahmat',     hp: '08123456782' },
    { nis: '202', nama: 'Doni Pratama',   tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Eko',        hp: '08123456785' }
];

const defaultMapel = [
    { kode: 'TK-MTR', nama: 'Motorik & Seni',          role: 'guru_tk' },
    { kode: 'TK-BHS', nama: 'Mengenal Huruf & Bahasa', role: 'guru_tk' },
    { kode: 'SD-MTK', nama: 'Matematika Dasar',        role: 'guru_sd' },
    { kode: 'SD-IPA', nama: 'IPAS Integrasi',          role: 'guru_sd' },
    { kode: 'SD-BIN', nama: 'Bahasa Indonesia',        role: 'guru_sd' }
];

const defaultCP = [
    { id: 'cp1', mapelKode: 'SD-MTK', fase: 'A', elemen: 'Bilangan', deskripsi: 'Peserta didik menunjukkan pemahaman dan intuisi bilangan cacah sampai 100, serta melakukan operasi penjumlahan dan pengurangan.' },
    { id: 'cp2', mapelKode: 'SD-BIN', fase: 'A', elemen: 'Membaca dan Memirsa', deskripsi: 'Peserta didik mampu bersikap menjadi pembaca dan pemirsa yang menunjukkan minat terhadap teks yang dibaca atau dipirsa.' },
    { id: 'cp3', mapelKode: 'SD-IPA', fase: 'A', elemen: 'Pemahaman IPAS', deskripsi: 'Peserta didik mengenali bagian tubuh manusia serta kebutuhan dasar makhluk hidup di lingkungan sekitarnya.' }
];

const defaultTP = [
    { id: 'tp1', cpId: 'cp1', kode: 'TP-1.1', alokasi: 6, deskripsi: 'membaca dan menuliskan lambang bilangan cacah sampai 100' },
    { id: 'tp2', cpId: 'cp1', kode: 'TP-1.2', alokasi: 8, deskripsi: 'menyelesaikan penjumlahan dan pengurangan dua bilangan sampai 20' },
    { id: 'tp3', cpId: 'cp2', kode: 'TP-2.1', alokasi: 4, deskripsi: 'membaca kata dan kalimat sederhana dengan lafal yang jelas' },
    { id: 'tp4', cpId: 'cp3', kode: 'TP-3.1', alokasi: 4, deskripsi: 'menyebutkan bagian tubuh dan fungsinya' }
];

const defaultKD = [
    { id: 'kd1', kode: '3.1', deskripsi: 'Menjelaskan makna bilangan cacah sampai dengan 99 sebagai banyak anggota suatu kumpulan objek.', cpId: 'cp1' }
];

const defaultNilai = [
    { id: '1', nis: '101', mapelKode: 'TK-MTR', jenis: 'sumatif',  tpId: '',    nilai: 'BSB', catatan: 'Perkembangan motorik halus sangat baik', role: 'guru_tk', tanggal: '' },
    { id: '2', nis: '201', mapelKode: 'SD-MTK', jenis: 'sumatif',  tpId: 'tp2', nilai: '90',  catatan: 'Sudah paham penjumlahan dasar',          role: 'guru_sd', tanggal: '' },
    { id: '3', nis: '201', mapelKode: 'SD-MTK', jenis: 'formatif', tpId: 'tp1', nilai: '82',  catatan: 'Lancar menulis lambang bilangan',        role: 'guru_sd', tanggal: '' },
    { id: '4', nis: '202', mapelKode: 'SD-MTK', jenis: 'sumatif',  tpId: 'tp2', nilai: '74',  catatan: 'Masih keliru pada pengurangan bersusun', role: 'guru_sd', tanggal: '' }
];

const defaultProjek = [
    { id: 'pj1', nama: 'Panen Sampah Organik', tema: 'Gaya Hidup Berkelanjutan', dimensi: ['Beriman, bertakwa, dan berakhlak mulia', 'Bergotong royong', 'Kreatif'], deskripsi: 'Murid mengolah sampah dapur sekolah menjadi kompos selama satu semester.' }
];

const defaultPengaturan = {
    tahun: '2026/2027',
    semester: 'Ganjil',
    deadline: '',
    locked: false,
    lockedAt: null,
    lockedBy: '',
    bobotFormatif: 40
};

/* --------------------------------------------------------------------------
   2. KONSTANTA TAMPILAN
   -------------------------------------------------------------------------- */
const ROLE_LABEL   = { admin: 'Administrator', guru_tk: 'Guru TK', guru_sd: 'Guru SD' };
const ROLE_TINGKAT = { guru_tk: 'TK', guru_sd: 'SD' };
const TUGAS_LABEL  = { none: 'Tanpa penugasan', wali_kelas: 'Wali kelas', guru_mapel: 'Guru mata pelajaran', guru_bk: 'Guru BK' };

const PREDIKAT_SIKAP  = ['Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan'];
const PREDIKAT_EKSKUL = ['Sangat Baik', 'Baik', 'Cukup'];
const DIMENSI_P5 = [
    'Beriman, bertakwa, dan berakhlak mulia',
    'Berkebinekaan global',
    'Bergotong royong',
    'Mandiri',
    'Bernalar kritis',
    'Kreatif'
];
const CAPAIAN_P5 = [
    { kode: 'BB',  label: 'BB — Belum Berkembang' },
    { kode: 'MB',  label: 'MB — Mulai Berkembang' },
    { kode: 'BSH', label: 'BSH — Berkembang Sesuai Harapan' },
    { kode: 'SB',  label: 'SB — Sangat Berkembang' }
];

const FORMAT_IMPOR = {
    guru:  { kolom: ['nip', 'nama', 'unit', 'status', 'gaji', 'hp'], label: 'Guru & tenaga kependidikan' },
    kelas: { kolom: ['nama', 'tingkat'], label: 'Rombongan belajar' },
    mapel: { kolom: ['kode', 'nama', 'jenjang'], label: 'Mata pelajaran' },
    siswa: { kolom: ['nis', 'nama', 'tingkat', 'kelas', 'ortu', 'hp'], label: 'Peserta didik' }
};

const PAGE_TITLE = {
    'dashboard': 'Ringkasan',
    'dapodik': 'Integrasi Dapodik',
    'manajemen-hr': 'Data karyawan',
    'manajemen-user': 'User & akses',
    'kurikulum': 'Penyelarasan CP–TP',
    'leger': 'Leger & penguncian',
    'manajemen-pembelajaran': 'Mapel & nilai',
    'deskripsi': 'Deskripsi akademik',
    'sikap': 'Sikap & catatan wali',
    'p5': 'Penilaian P5',
    'ekskul': 'Ekstrakurikuler',
    'siswa-tk': 'Murid TK',
    'siswa-sd': 'Murid SD',
    'absensi': 'Absensi harian',
    'rekap-absensi-gas': 'Rekap Google Sheets'
};

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzTziMYccKpqpum3QRAgsY6fET9UOTVIIohcI5PVphoUGEa_TMIOiLFUaR3SQ_wNWlM10WEQ36XA0V/pub?output=csv';

/* --------------------------------------------------------------------------
   3. STATE
   -------------------------------------------------------------------------- */
function klon(value) { return JSON.parse(JSON.stringify(value)); }

function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return klon(fallback);
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object') return klon(fallback);
        return parsed;
    } catch (err) {
        console.warn(`Data "${key}" rusak, memakai data bawaan.`, err);
        return klon(fallback);
    }
}

let dataSekolah    = Object.assign(klon(defaultSekolah), readStore('educore_sekolah', {}));
let usersList      = readStore('educore_users', defaultUsers);
let dataKelas      = readStore('educore_kelas', defaultKelas);
let employeesList  = readStore('educore_employees', defaultEmployees);
let dataSiswa      = readStore('educore_siswa', defaultSiswa);
let dataMapel      = readStore('educore_mapel', defaultMapel);
let dataCP         = readStore('educore_cp', defaultCP);
let dataTP         = readStore('educore_tp', defaultTP);
let dataKD         = readStore('educore_kd', defaultKD);
let dataNilai      = readStore('educore_nilai', defaultNilai);
let dataSikap      = readStore('educore_sikap', {});
let dataEkskul     = readStore('educore_ekskul', []);
let dataProjek     = readStore('educore_projek', defaultProjek);
let dataP5         = readStore('educore_p5', []);
let dataDeskripsi  = readStore('educore_deskripsi', {});
let absensiRecords = readStore('educore_absensi', {});
let dapodikLog     = readStore('educore_dapodik_log', []);
let pengaturan     = Object.assign(klon(defaultPengaturan), readStore('educore_pengaturan', {}));

/* Data lama tidak punya jenis penilaian — anggap sumatif agar leger tetap terhitung. */
dataNilai.forEach(n => { if (!n.jenis) n.jenis = 'sumatif'; });
Object.keys(usersList).forEach(k => { if (!usersList[k].tugas) usersList[k].tugas = { jenis: 'none' }; });

let currentUser = null;
let attendanceChartInstance = null;
let clockInterval = null;
let toastTimer = null;
let pendingConfirmCallback = null;
let activeTab = 'dashboard';
let imporBaris = null;

const STORE_MAP = {
    educore_sekolah:     () => dataSekolah,
    educore_users:       () => usersList,
    educore_kelas:       () => dataKelas,
    educore_employees:   () => employeesList,
    educore_siswa:       () => dataSiswa,
    educore_mapel:       () => dataMapel,
    educore_cp:          () => dataCP,
    educore_tp:          () => dataTP,
    educore_kd:          () => dataKD,
    educore_nilai:       () => dataNilai,
    educore_sikap:       () => dataSikap,
    educore_ekskul:      () => dataEkskul,
    educore_projek:      () => dataProjek,
    educore_p5:          () => dataP5,
    educore_deskripsi:   () => dataDeskripsi,
    educore_absensi:     () => absensiRecords,
    educore_dapodik_log: () => dapodikLog,
    educore_pengaturan:  () => pengaturan
};

function saveDataToStorage() {
    try {
        Object.keys(STORE_MAP).forEach(k => localStorage.setItem(k, JSON.stringify(STORE_MAP[k]())));
    } catch (err) {
        showToast('Penyimpanan browser penuh. Perubahan terakhir tidak tersimpan.', 'error');
    }
}

/* --------------------------------------------------------------------------
   4. UTILITAS
   -------------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Untuk nilai di dalam string JS pada atribut onclick: escape JS dulu, baru HTML. */
function escAttr(value) {
    return esc(String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
}

function uid(prefix) { return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }

function avatarUrl(seed) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'user')}`;
}

function rupiah(v) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0);
}

function todayISO() {
    const n = new Date();
    n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    return n.toISOString().split('T')[0];
}

function tanggalPanjang(iso) {
    if (!iso) return '—';
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function tingkatTag(t) {
    return `<span class="badge-role ${t === 'TK' ? 'tag-tk' : 'tag-sd'}">${esc(t)}</span>`;
}

function namaSiswa(nis) {
    const s = dataSiswa.find(x => String(x.nis) === String(nis));
    return s ? s.nama : String(nis);
}

function namaMapel(kode) {
    const m = dataMapel.find(x => x.kode === kode);
    return m ? m.nama : kode;
}

function showToast(msg, type = 'success') {
    const toast = $('toast');
    if (!toast) return;
    toast.innerHTML = `<span aria-hidden="true">${type === 'success' ? '✓' : '!'}</span><span>${esc(msg)}</span>`;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3400);
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

function getEmptyStateHTML(message, tbodyEl, title) {
    let cols = 5;
    if (tbodyEl) {
        const head = tbodyEl.closest('table')?.querySelector('thead tr');
        if (head) cols = head.children.length;
    }
    return `<tr><td colspan="${cols}" class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">◌</div>
        <h4>${esc(title || 'Belum ada data')}</h4>
        <p>${esc(message || '')}</p>
    </td></tr>`;
}

function setEmpty(tbodyEl, message, title) {
    if (tbodyEl) tbodyEl.innerHTML = getEmptyStateHTML(message, tbodyEl, title);
}

function isiSelect(el, items, selected) {
    if (!el) return;
    el.innerHTML = items.map(i => {
        const val = typeof i === 'string' ? i : i.value;
        const lab = typeof i === 'string' ? i : i.label;
        return `<option value="${esc(val)}"${String(val) === String(selected) ? ' selected' : ''}>${esc(lab)}</option>`;
    }).join('');
}

/* --------------------------------------------------------------------------
   5. HAK AKSES & PENUGASAN
   -------------------------------------------------------------------------- */
function tugasSaya() {
    return (currentUser && currentUser.tugas) || { jenis: 'none' };
}

function labelPenugasan(user) {
    const t = user.tugas || { jenis: 'none' };
    if (t.jenis === 'wali_kelas') return `Wali kelas ${t.kelas || '—'}`;
    if (t.jenis === 'guru_mapel') return `Guru ${(t.mapel || []).length} mapel`;
    if (t.jenis === 'guru_bk') return 'Guru BK';
    return ROLE_LABEL[user.role] || '—';
}

/* Murid yang boleh disentuh: jenjang dulu, lalu dipersempit kalau wali kelas. */
function scopedSiswa(list = dataSiswa) {
    if (!currentUser) return [];
    const tingkat = ROLE_TINGKAT[currentUser.role];
    let hasil = tingkat ? list.filter(s => s.tingkat === tingkat) : list.slice();

    const t = tugasSaya();
    if (t.jenis === 'wali_kelas' && t.kelas) hasil = hasil.filter(s => s.kelas === t.kelas);
    return hasil;
}

function kelasSaya() {
    const t = tugasSaya();
    if (t.jenis === 'wali_kelas' && t.kelas) return t.kelas;
    return null;
}

function scopedMapel() {
    if (!currentUser) return [];
    let hasil = currentUser.role === 'admin' ? dataMapel.slice() : dataMapel.filter(m => m.role === currentUser.role);

    const t = tugasSaya();
    if (t.jenis === 'guru_mapel' && Array.isArray(t.mapel) && t.mapel.length > 0) {
        hasil = hasil.filter(m => t.mapel.includes(m.kode));
    }
    return hasil;
}

function scopedNilai() {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return dataNilai;
    const nisSet = new Set(scopedSiswa().map(s => String(s.nis)));
    const kodeSet = new Set(scopedMapel().map(m => m.kode));
    return dataNilai.filter(n => nisSet.has(String(n.nis)) && kodeSet.has(n.mapelKode));
}

/* --------------------------------------------------------------------------
   6. PENGUNCIAN NILAI
   -------------------------------------------------------------------------- */
function nilaiTerkunci() { return Boolean(pengaturan.locked); }

function lewatTenggat() {
    return Boolean(pengaturan.deadline) && todayISO() > pengaturan.deadline;
}

/* Dipanggil di awal setiap aksi yang mengubah nilai atau komponen rapor. */
function guardKunci(namaAksi = 'Data') {
    if (!nilaiTerkunci()) return false;
    showToast(`${namaAksi} terkunci untuk periode ${pengaturan.semester} ${pengaturan.tahun}. Hubungi administrator.`, 'error');
    return true;
}

function renderPeriodeTag() {
    const tag = $('periodeTag');
    if (tag) tag.textContent = `${pengaturan.semester} ${pengaturan.tahun}`;

    const lock = $('lockTag');
    if (lock) lock.classList.toggle('hidden', !nilaiTerkunci());
}

/* --------------------------------------------------------------------------
   7. INISIALISASI
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

    document.addEventListener('click', (e) => {
        const wrapper = $('notifWrapper');
        if (wrapper && !wrapper.contains(e.target)) closeNotifDropdown();
    });

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

    updateImporFormat();
    restoreSession();
});

function restoreSession() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('educore_session') || 'null'); } catch (_) { /* abaikan */ }
    if (saved && usersList[saved.username] && usersList[saved.username].role === saved.role) {
        enterPortal(saved.username, false);
    }
}

/* --------------------------------------------------------------------------
   8. MASUK & KELUAR
   -------------------------------------------------------------------------- */
function handleLogin(e) {
    if (e) e.preventDefault();

    const username = $('loginUser').value.trim().toLowerCase();
    const password = $('loginPass').value;
    const userObj = usersList[username];

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
    } catch (_) { /* mode privat */ }

    $('loginPage').classList.add('hidden');
    $('mainApp').classList.remove('hidden');

    $('userNameDisplay').textContent = currentUser.name;
    $('userNameDisplay').title = currentUser.name;
    $('userRoleBadge').textContent = labelPenugasan(currentUser);
    $('userAvatar').src = avatarUrl(currentUser.avatar || currentUser.name);

    renderPeriodeTag();
    applyRolePermissions(currentUser.role);
    startRealtimeClock();
    renderNotifications();

    if (announce) showToast(`Berhasil masuk sebagai ${labelPenugasan(currentUser)}.`);
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
   9. NAVIGASI
   -------------------------------------------------------------------------- */
function applyRolePermissions(role) {
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        const roles = (li.dataset.roles || '').split(',').map(r => r.trim()).filter(Boolean);
        li.classList.toggle('hidden', !roles.includes(role));
    });

    /* Judul kelompok tanpa menu di bawahnya ikut disembunyikan. */
    document.querySelectorAll('.sidebar-menu li.menu-divider').forEach(divider => {
        let next = divider.nextElementSibling;
        let ada = false;
        while (next && !next.classList.contains('menu-divider')) {
            if (!next.classList.contains('hidden')) { ada = true; break; }
            next = next.nextElementSibling;
        }
        if (!ada) divider.classList.add('hidden');
    });

    switchTab('dashboard');
}

function switchTab(tabName, event) {
    if (event) event.preventDefault();
    if (!currentUser) return;

    const navLink = document.querySelector(`.nav-link[data-tab="${tabName}"]`);
    if (!navLink || navLink.closest('li').classList.contains('hidden')) tabName = 'dashboard';

    activeTab = tabName;

    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    $(`section-${tabName}`)?.classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.tab === tabName));

    $('pageMainHeading').textContent = PAGE_TITLE[tabName] || 'Portal';
    renderPeriodeTag();
    closeSidebar();
    window.scrollTo(0, 0);

    const dispatch = {
        'dashboard': renderDashboardAcademic,
        'dapodik': renderDapodik,
        'manajemen-hr': () => renderEmployees(),
        'manajemen-user': renderUsers,
        'kurikulum': renderKurikulum,
        'leger': renderLegerPage,
        'manajemen-pembelajaran': renderPembelajaran,
        'deskripsi': renderDeskripsiPage,
        'sikap': () => renderSikap(),
        'p5': renderP5Page,
        'ekskul': renderEkskul,
        'siswa-tk': () => renderSiswaTables(dataSiswa),
        'siswa-sd': () => renderSiswaTables(dataSiswa),
        'absensi': renderAbsensi,
        'rekap-absensi-gas': fetchGoogleSheetAttendance
    };
    dispatch[tabName]?.();
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
   10. JAM & NOTIFIKASI
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

        $('greetingTitle').textContent = `${greeting}, ${currentUser.name.split(',')[0]}`;

        const tanggal = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        $('realtimeClock').textContent = `${tanggal} · ${jam}`;
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function toggleNotifDropdown(event) {
    if (event) event.stopPropagation();
    const open = $('notifDropdown').classList.toggle('hidden') === false;
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
    $('notifRoleTag').textContent = labelPenugasan(currentUser);

    const items = [];
    const murid = scopedSiswa();

    if (nilaiTerkunci()) {
        items.push({ text: `Nilai periode ${pengaturan.semester} ${pengaturan.tahun} sudah dikunci.`, time: 'Periode' });
    } else if (lewatTenggat()) {
        items.push({ text: `Tenggat input nilai lewat pada ${tanggalPanjang(pengaturan.deadline)}.`, time: 'Perlu tindakan' });
    }

    const belumAbsen = murid.filter(s => !(absensiRecords[todayISO()] || {})[s.nis]);
    if (belumAbsen.length > 0) items.push({ text: `${belumAbsen.length} murid belum diabsen hari ini.`, time: 'Perlu tindakan' });

    if (currentUser.role === 'admin') {
        const cpTanpaTp = dataCP.filter(cp => !dataTP.some(tp => tp.cpId === cp.id)).length;
        if (cpTanpaTp > 0) items.push({ text: `${cpTanpaTp} Capaian Pembelajaran belum diturunkan menjadi TP.`, time: 'Kurikulum' });
        items.push({ text: `${employeesList.length} karyawan dan ${Object.keys(usersList).length} akun aktif.`, time: 'Ringkasan' });
    } else if (currentUser.role === 'guru_sd') {
        const belumSikap = murid.filter(s => !dataSikap[s.nis]).length;
        if (belumSikap > 0) items.push({ text: `${belumSikap} murid belum punya penilaian sikap.`, time: 'Rapor' });
    }

    badge.textContent = items.length;
    badge.classList.toggle('hidden', items.length === 0);

    list.innerHTML = items.length === 0
        ? '<div class="notif-item">Tidak ada pemberitahuan.</div>'
        : items.map(i => `<div class="notif-item"><div>${esc(i.text)}</div><small>${esc(i.time)}</small></div>`).join('');
}
/* ==========================================================================
   Bagian 2 : Integrasi Dapodik, kepegawaian, user & akses, murid, absensi
   ========================================================================== */

/* --------------------------------------------------------------------------
   11. INTEGRASI DAPODIK
   -------------------------------------------------------------------------- */
function renderDapodik() {
    $('skNpsn').value = dataSekolah.npsn;
    $('skNama').value = dataSekolah.nama;
    $('skAlamat').value = dataSekolah.alamat;
    $('skKepsek').value = dataSekolah.kepsek;
    $('skNipKepsek').value = dataSekolah.nipKepsek || '';
    $('skJenjang').value = dataSekolah.jenjang;

    updateImporFormat();
    renderDapodikLog();
}

function saveSekolah(e) {
    e.preventDefault();
    dataSekolah = {
        npsn: $('skNpsn').value.trim(),
        nama: $('skNama').value.trim(),
        alamat: $('skAlamat').value.trim(),
        kepsek: $('skKepsek').value.trim(),
        nipKepsek: $('skNipKepsek').value.trim(),
        jenjang: $('skJenjang').value
    };
    saveDataToStorage();
    showToast('Profil sekolah tersimpan.');
}

function updateImporFormat() {
    const jenis = $('imporJenis')?.value || 'guru';
    const format = FORMAT_IMPOR[jenis];
    if ($('imporFormat')) $('imporFormat').textContent = format.kolom.join(',');
    if ($('imporTeks')) $('imporTeks').placeholder = `${format.kolom.join(',')}\n…`;
    previewImpor();
}

function bacaBerkasImpor(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { $('imporTeks').value = String(reader.result || ''); previewImpor(); };
    reader.onerror = () => showToast('Berkas tidak bisa dibaca.', 'error');
    reader.readAsText(file);
}

/* Memeriksa CSV sebelum menyentuh data, supaya kesalahan kolom ketahuan lebih dulu. */
function previewImpor() {
    const box = $('imporPreview');
    const btn = $('btnImpor');
    const teks = ($('imporTeks')?.value || '').trim();
    if (!box || !btn) return;

    imporBaris = null;
    btn.disabled = true;

    if (!teks) { box.classList.add('hidden'); return; }

    const jenis = $('imporJenis').value;
    const format = FORMAT_IMPOR[jenis];
    const rows = parseCSV(teks).filter(r => r.some(c => c !== ''));

    box.classList.remove('hidden');

    if (rows.length < 2) {
        box.className = 'preview-box is-error mb-4';
        box.innerHTML = '<strong>Berkas belum berisi data.</strong> Baris pertama harus berupa nama kolom, diikuti minimal satu baris isi.';
        return;
    }

    const header = rows[0].map(h => h.toLowerCase().replace(/\s+/g, ''));
    const hilang = format.kolom.filter(k => !header.includes(k));

    if (hilang.length > 0) {
        box.className = 'preview-box is-error mb-4';
        box.innerHTML = `<strong>Kolom belum lengkap.</strong> Tidak menemukan: ${esc(hilang.join(', '))}.`;
        return;
    }

    const idx = {};
    format.kolom.forEach(k => { idx[k] = header.indexOf(k); });

    const baris = rows.slice(1).map(r => {
        const obj = {};
        format.kolom.forEach(k => { obj[k] = (r[idx[k]] || '').trim(); });
        return obj;
    }).filter(o => Object.values(o).some(v => v !== ''));

    imporBaris = { jenis, baris };
    btn.disabled = baris.length === 0;

    box.className = 'preview-box mb-4';
    box.innerHTML = `<strong>${baris.length} baris siap diimpor</strong> sebagai ${esc(format.label.toLowerCase())}.
        <ul>${baris.slice(0, 3).map(b => `<li>${esc(Object.values(b).filter(Boolean).slice(0, 3).join(' · '))}</li>`).join('')}</ul>
        ${baris.length > 3 ? `<span class="text-muted">dan ${baris.length - 3} baris lainnya.</span>` : ''}`;
}

function resetImpor() {
    $('imporTeks').value = '';
    $('imporFile').value = '';
    imporBaris = null;
    $('imporPreview').classList.add('hidden');
    $('btnImpor').disabled = true;
}

function jalankanImpor() {
    if (!imporBaris) return;
    const { jenis, baris } = imporBaris;

    showConfirmDialog('Impor data Dapodik',
        `${baris.length} baris akan ditambahkan sebagai ${FORMAT_IMPOR[jenis].label.toLowerCase()}. Baris dengan nomor induk atau kode yang sudah ada akan dilewati.`,
        () => prosesImpor(jenis, baris), 'Impor sekarang');
}

function prosesImpor(jenis, baris) {
    let masuk = 0;
    let lewat = 0;

    baris.forEach(b => {
        if (jenis === 'guru') {
            if (!b.nip || employeesList.some(e => e.nip.toLowerCase() === b.nip.toLowerCase())) { lewat++; return; }
            employeesList.push({
                nip: b.nip, nama: b.nama, dept: b.unit || 'Administrasi',
                status: b.status || 'Tetap', gaji: parseFloat(b.gaji) || 0, hp: b.hp || '-'
            });
            masuk++;
        } else if (jenis === 'kelas') {
            const tingkat = (b.tingkat || '').toUpperCase() === 'TK' ? 'TK' : 'SD';
            if (!b.nama || dataKelas.some(k => k.nama.toLowerCase() === b.nama.toLowerCase())) { lewat++; return; }
            dataKelas.push({ nama: b.nama, tingkat });
            masuk++;
        } else if (jenis === 'mapel') {
            const kode = (b.kode || '').toUpperCase();
            if (!kode || dataMapel.some(m => m.kode === kode)) { lewat++; return; }
            dataMapel.push({ kode, nama: b.nama, role: (b.jenjang || '').toUpperCase() === 'TK' ? 'guru_tk' : 'guru_sd' });
            masuk++;
        } else if (jenis === 'siswa') {
            if (!b.nis || dataSiswa.some(s => String(s.nis) === b.nis)) { lewat++; return; }
            const tingkat = (b.tingkat || '').toUpperCase() === 'TK' ? 'TK' : 'SD';
            const kelas = b.kelas || (tingkat === 'TK' ? 'TK A' : 'SD Kelas 1');

            /* Kelas yang belum terdaftar ikut dibuat agar murid tidak menggantung. */
            if (!dataKelas.some(k => k.nama === kelas)) dataKelas.push({ nama: kelas, tingkat });

            dataSiswa.push({ nis: b.nis, nama: b.nama, tingkat, kelas, ortu: b.ortu || '-', hp: b.hp || '-' });
            masuk++;
        }
    });

    dapodikLog.unshift({
        waktu: new Date().toISOString(),
        jenis: FORMAT_IMPOR[jenis].label,
        masuk, lewat,
        status: masuk > 0 ? 'Berhasil' : 'Tidak ada data baru'
    });
    dapodikLog = dapodikLog.slice(0, 20);

    saveDataToStorage();
    resetImpor();
    renderDapodikLog();
    renderNotifications();
    showToast(`${masuk} baris masuk, ${lewat} dilewati.`, masuk > 0 ? 'success' : 'error');
}

function renderDapodikLog() {
    const tbody = $('tbodyDapodikLog');
    if (!tbody) return;

    if (dapodikLog.length === 0) {
        setEmpty(tbody, 'Riwayat impor akan tercatat di sini.', 'Belum ada sinkronisasi');
        return;
    }

    tbody.innerHTML = dapodikLog.map(l => `<tr>
        <td class="num">${esc(new Date(l.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }))}</td>
        <td>${esc(l.jenis)}</td>
        <td class="num cell-strong">${l.masuk}</td>
        <td class="num text-muted">${l.lewat}</td>
        <td><span class="badge-role ${l.masuk > 0 ? 'tag-ok' : 'tag-warn'}">${esc(l.status)}</span></td>
    </tr>`).join('');
}

/* Paket contoh agar modul bisa dicoba tanpa berkas Dapodik asli. */
function muatPaketDapodik() {
    showConfirmDialog('Muat paket contoh',
        'Data contoh berisi 4 guru, 2 rombel, 3 mata pelajaran, dan 8 peserta didik akan ditambahkan.',
        () => {
            prosesImpor('kelas', [
                { nama: 'SD Kelas 2', tingkat: 'SD' },
                { nama: 'SD Kelas 3', tingkat: 'SD' }
            ]);
            prosesImpor('guru', [
                { nip: 'KAY-2026-004', nama: 'Rina Marlina, S.Pd.', unit: 'Guru SD', status: 'Tetap', gaji: '4900000', hp: '081234567804' },
                { nip: 'KAY-2026-005', nama: 'Ahmad Yani, S.Pd.', unit: 'Guru SD', status: 'Kontrak', gaji: '4200000', hp: '081234567805' },
                { nip: 'KAY-2026-006', nama: 'Lestari Wulandari, S.Psi.', unit: 'Guru SD', status: 'Tetap', gaji: '4600000', hp: '081234567806' },
                { nip: 'KAY-2026-007', nama: 'Nurhayati, S.Pd.AUD', unit: 'Guru TK', status: 'Tetap', gaji: '4400000', hp: '081234567807' }
            ]);
            prosesImpor('mapel', [
                { kode: 'SD-PKN', nama: 'Pendidikan Pancasila', jenjang: 'SD' },
                { kode: 'SD-PJK', nama: 'PJOK', jenjang: 'SD' },
                { kode: 'TK-KOG', nama: 'Kognitif & Sains Awal', jenjang: 'TK' }
            ]);
            prosesImpor('siswa', [
                { nis: '203', nama: 'Rizky Ramadhan', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Sundari', hp: '08123456790' },
                { nis: '204', nama: 'Nabila Zahra', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Iwan Kurnia', hp: '08123456791' },
                { nis: '205', nama: 'Fajar Nugroho', tingkat: 'SD', kelas: 'SD Kelas 1', ortu: 'Wahyu', hp: '08123456792' },
                { nis: '206', nama: 'Kirana Maheswari', tingkat: 'SD', kelas: 'SD Kelas 2', ortu: 'Dian Saputra', hp: '08123456793' },
                { nis: '207', nama: 'Bagas Wicaksono', tingkat: 'SD', kelas: 'SD Kelas 2', ortu: 'Hartono', hp: '08123456794' },
                { nis: '208', nama: 'Salsabila Aulia', tingkat: 'SD', kelas: 'SD Kelas 3', ortu: 'Firman', hp: '08123456795' },
                { nis: '103', nama: 'Gavin Alfarizi', tingkat: 'TK', kelas: 'TK A', ortu: 'Yudi Prasetyo', hp: '08123456796' },
                { nis: '104', nama: 'Naura Khalisa', tingkat: 'TK', kelas: 'TK A', ortu: 'Melati', hp: '08123456797' }
            ]);
            showToast('Paket contoh Dapodik dimuat.');
        }, 'Muat data');
}

/* --------------------------------------------------------------------------
   12. KEPEGAWAIAN
   -------------------------------------------------------------------------- */
function filterEmployeeTable(query) {
    const q = query.trim().toLowerCase();
    const filtered = !q ? employeesList : employeesList.filter(e =>
        e.nama.toLowerCase().includes(q) || e.nip.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
    renderEmployees(filtered, Boolean(q));
}

function renderEmployees(list = employeesList, isFiltered = false) {
    const tbody = $('tbodyHR');
    if (!tbody) return;

    if (list.length === 0) {
        setEmpty(tbody, isFiltered ? 'Ubah kata kunci pencarian.' : 'Tambahkan karyawan lewat tombol di atas, atau impor dari Dapodik.',
            isFiltered ? 'Tidak ada yang cocok' : 'Belum ada karyawan');
        return;
    }

    tbody.innerHTML = list.map(emp => `<tr>
        <td class="num cell-strong">${esc(emp.nip)}</td>
        <td>${esc(emp.nama)}</td>
        <td><span class="badge-role">${esc(emp.dept)}</span></td>
        <td>${esc(emp.status)}</td>
        <td class="num">${rupiah(emp.gaji)}</td>
        <td class="num">${esc(emp.hp)}</td>
        <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteEmployee('${escAttr(emp.nip)}')">Hapus</button></div></td>
    </tr>`).join('');
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
   13. USER & AKSES
   -------------------------------------------------------------------------- */
function renderUsers() {
    const tbody = $('tbodyUsers');
    if (!tbody) return;

    const semua = Object.keys(usersList);
    const hitung = (j) => semua.filter(k => (usersList[k].tugas || {}).jenis === j).length;
    $('statWali').textContent = hitung('wali_kelas');
    $('statMapel').textContent = hitung('guru_mapel');
    $('statBk').textContent = hitung('guru_bk');

    tbody.innerHTML = semua.map(key => {
        const u = usersList[key];
        const t = u.tugas || { jenis: 'none' };
        const isSelf = currentUser && currentUser.username === key;

        let cakupan = '<span class="text-muted">Seluruh jenjang</span>';
        if (t.jenis === 'wali_kelas') cakupan = `<span class="badge-role tag-accent">${esc(t.kelas || 'Belum dipilih')}</span>`;
        else if (t.jenis === 'guru_mapel') {
            const list = (t.mapel || []);
            cakupan = list.length === 0
                ? '<span class="text-muted">Belum dipilih</span>'
                : list.map(k => `<span class="badge-role">${esc(k)}</span>`).join(' ');
        } else if (t.jenis === 'guru_bk') cakupan = '<span class="text-muted">Semua murid jenjangnya</span>';

        const hapus = key === 'admin'
            ? '<span class="badge-role">Terkunci</span>'
            : `<button class="btn btn-danger btn-sm" onclick="confirmDeleteUser('${escAttr(key)}')"${isSelf ? ' disabled title="Akun yang sedang dipakai"' : ''}>Hapus</button>`;

        return `<tr>
            <td class="cell-strong">${esc(key)}</td>
            <td>${esc(u.name)}</td>
            <td><span class="badge-role ${u.role === 'admin' ? 'tag-accent' : (u.role === 'guru_tk' ? 'tag-tk' : 'tag-sd')}">${esc(ROLE_LABEL[u.role] || u.role)}</span></td>
            <td>${esc(TUGAS_LABEL[t.jenis] || '—')}</td>
            <td>${cakupan}</td>
            <td><div class="row-actions">
                <button class="btn btn-secondary btn-sm" onclick="openModalUser('${escAttr(key)}')">Atur akses</button>
                ${hapus}
            </div></td>
        </tr>`;
    }).join('');
}

function openModalUser(editKey) {
    const form = $('formUser');
    form.reset();
    $('userEditKey').value = editKey || '';

    const isEdit = Boolean(editKey);
    $('modalUserTitle').textContent = isEdit ? `Atur akses — ${editKey}` : 'Tambah akun';
    $('btnSimpanUser').textContent = isEdit ? 'Simpan perubahan' : 'Buat akun';
    $('userInputUsername').disabled = isEdit;
    $('userInputPassword').required = !isEdit;
    $('userPassHint').textContent = isEdit ? 'Kosongkan bila kata sandi tidak diubah.' : 'Minimal 5 karakter.';

    if (isEdit) {
        const u = usersList[editKey];
        const t = u.tugas || { jenis: 'none' };
        $('userInputUsername').value = editKey;
        $('userInputNama').value = u.name;
        $('userInputRole').value = u.role;
        $('userInputTugas').value = t.jenis || 'none';
        syncTugasOptions(t);
    } else {
        $('userInputUsername').value = '';
        syncTugasOptions();
    }

    $('modalUser').classList.remove('hidden');
    (isEdit ? $('userInputNama') : $('userInputUsername')).focus();
}

function closeModalUser() { $('modalUser').classList.add('hidden'); $('formUser').reset(); $('userInputUsername').disabled = false; }

/* Pilihan kelas dan mapel menyesuaikan jenjang akun yang sedang diatur. */
function syncTugasOptions(preset) {
    const role = $('userInputRole').value;
    const jenis = $('userInputTugas').value;
    const tingkat = ROLE_TINGKAT[role];

    $('tugasKelasGroup').classList.toggle('hidden', jenis !== 'wali_kelas');
    $('tugasMapelGroup').classList.toggle('hidden', jenis !== 'guru_mapel');

    if (jenis === 'wali_kelas') {
        const kelas = dataKelas.filter(k => !tingkat || k.tingkat === tingkat).map(k => k.nama);
        isiSelect($('userTugasKelas'), kelas.length ? kelas : ['Belum ada kelas'], preset && preset.kelas);
    }

    if (jenis === 'guru_mapel') {
        const mapel = dataMapel.filter(m => !tingkat || m.role === role);
        const dipilih = (preset && preset.mapel) || [];
        $('userTugasMapel').innerHTML = mapel.map(m =>
            `<option value="${esc(m.kode)}"${dipilih.includes(m.kode) ? ' selected' : ''}>${esc(m.kode)} — ${esc(m.nama)}</option>`).join('');
    }
}

function saveUser(e) {
    e.preventDefault();
    const editKey = $('userEditKey').value;
    const username = editKey || $('userInputUsername').value.trim().toLowerCase();

    if (!editKey) {
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
    }

    const jenis = $('userInputTugas').value;
    const tugas = { jenis };
    if (jenis === 'wali_kelas') {
        tugas.kelas = $('userTugasKelas').value;
        if (!tugas.kelas || tugas.kelas === 'Belum ada kelas') {
            showToast('Pilih kelas yang diampu terlebih dahulu.', 'error');
            return;
        }
        /* Satu kelas hanya boleh punya satu wali. */
        const bentrok = Object.keys(usersList).find(k =>
            k !== username && (usersList[k].tugas || {}).jenis === 'wali_kelas' && usersList[k].tugas.kelas === tugas.kelas);
        if (bentrok) {
            showToast(`${tugas.kelas} sudah diampu oleh ${bentrok}.`, 'error');
            return;
        }
    }
    if (jenis === 'guru_mapel') {
        tugas.mapel = [...$('userTugasMapel').selectedOptions].map(o => o.value);
        if (tugas.mapel.length === 0) {
            showToast('Pilih minimal satu mata pelajaran.', 'error');
            return;
        }
    }

    const nama = $('userInputNama').value.trim();
    const sandiBaru = $('userInputPassword').value;

    usersList[username] = {
        pass: sandiBaru || (editKey ? usersList[editKey].pass : sandiBaru),
        name: nama,
        role: $('userInputRole').value,
        avatar: nama,
        tugas
    };

    /* Kalau admin mengubah akunnya sendiri, tampilan sidebar ikut disegarkan. */
    if (currentUser && currentUser.username === username) {
        currentUser = { username, ...usersList[username] };
        $('userRoleBadge').textContent = labelPenugasan(currentUser);
    }

    saveDataToStorage();
    renderUsers();
    renderNotifications();
    closeModalUser();
    showToast(editKey ? 'Akses akun diperbarui.' : 'Akun dibuat.');
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
        showToast('Akun dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   14. MURID
   -------------------------------------------------------------------------- */
function filterSiswaTable(tingkat, query) {
    const q = query.trim().toLowerCase();
    const basis = currentUser.role === 'admin' ? dataSiswa : scopedSiswa();
    const filtered = basis.filter(s => s.tingkat === tingkat &&
        (!q || s.nama.toLowerCase().includes(q) || String(s.nis).toLowerCase().includes(q) || s.kelas.toLowerCase().includes(q)));
    renderSiswaTables(filtered, tingkat, Boolean(q));
}

function renderSiswaTables(listSiswa, specificTingkat = null, isFiltered = false) {
    const basis = currentUser && currentUser.role !== 'admin' && !isFiltered
        ? listSiswa.filter(s => scopedSiswa().some(x => String(x.nis) === String(s.nis)))
        : listSiswa;

    const kelas = kelasSaya();
    if ($('siswaSdScope')) {
        $('siswaSdScope').textContent = kelas
            ? `Murid ${kelas} — kelas yang Anda ampu sebagai wali.`
            : 'Kelas 1 sampai 6 beserta data wali.';
    }

    [{ tingkat: 'TK', tbody: $('tbodySiswaTK') }, { tingkat: 'SD', tbody: $('tbodySiswaSD') }].forEach(({ tingkat, tbody }) => {
        if (!tbody) return;
        if (specificTingkat && specificTingkat !== tingkat) return;

        const rows = basis.filter(s => s.tingkat === tingkat);
        if (rows.length === 0) {
            setEmpty(tbody, isFiltered ? 'Ubah kata kunci pencarian.' : `Tambahkan murid ${tingkat} lewat tombol di atas, atau impor dari Dapodik.`,
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
    $('modalSiswaSub').textContent = 'Nomor induk harus unik. Daftar kelas diambil dari rombongan belajar Dapodik.';

    const kelas = dataKelas.filter(k => k.tingkat === tingkat).map(k => k.nama);
    isiSelect($('siswaKelas'), kelas.length ? kelas : ['Belum ada kelas'], kelasSaya());

    $('modalSiswa').classList.remove('hidden');
    $('siswaNis').focus();
}
function closeModalSiswa() { $('modalSiswa').classList.add('hidden'); $('formSiswa').reset(); }

function saveSiswa(e) {
    e.preventDefault();
    const nis = $('siswaNis').value.trim();

    if (dataSiswa.some(s => String(s.nis) === nis)) {
        showToast('Nomor induk ini sudah terdaftar.', 'error');
        $('siswaNis').focus();
        return;
    }

    dataSiswa.push({
        nis,
        nama: $('siswaNama').value.trim(),
        tingkat: $('siswaTingkat').value,
        kelas: $('siswaKelas').value,
        ortu: $('siswaOrtu').value.trim(),
        hp: $('siswaHp').value.trim()
    });

    saveDataToStorage();
    renderSiswaTables(dataSiswa);
    renderNotifications();
    closeModalSiswa();
    showToast('Murid tersimpan.');
}

function confirmDeleteSiswa(nis) {
    const s = dataSiswa.find(item => String(item.nis) === String(nis));
    showConfirmDialog('Hapus murid', `${s ? s.nama : nis} beserta nilai, sikap, P5, dan ekstrakurikulernya akan dihapus.`, () => {
        dataSiswa = dataSiswa.filter(item => String(item.nis) !== String(nis));
        dataNilai = dataNilai.filter(n => String(n.nis) !== String(nis));
        dataEkskul = dataEkskul.filter(x => String(x.nis) !== String(nis));
        dataP5 = dataP5.filter(x => String(x.nis) !== String(nis));
        delete dataSikap[nis];
        Object.keys(dataDeskripsi).forEach(k => { if (k.startsWith(`${nis}|`)) delete dataDeskripsi[k]; });
        Object.keys(absensiRecords).forEach(d => { delete absensiRecords[d][nis]; });

        saveDataToStorage();
        renderSiswaTables(dataSiswa);
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
        tbody.innerHTML = grades.map(n => `<tr>
            <td>${esc(namaMapel(n.mapelKode))}</td>
            <td><span class="badge-role ${n.jenis === 'formatif' ? 'tag-warn' : 'tag-accent'}">${esc(n.jenis || 'sumatif')}</span></td>
            <td class="cell-strong num">${esc(n.nilai)}</td>
            <td><span class="note-cell text-muted">${esc(n.catatan)}</span></td>
        </tr>`).join('');
    }

    /* Ringkasan komponen rapor lain supaya wali kelas tidak perlu berpindah tab. */
    const sikap = dataSikap[nis];
    const ekskul = dataEkskul.filter(x => String(x.nis) === String(nis));
    const p5 = dataP5.filter(x => String(x.nis) === String(nis));
    const bagian = [];

    if (sikap) {
        bagian.push(`<div class="preview-box mb-4"><strong>Sikap</strong>
            <ul><li>Spiritual: ${esc(sikap.spiritual)}</li><li>Sosial: ${esc(sikap.sosial)}</li>
            ${sikap.catatan ? `<li>Catatan wali: ${esc(sikap.catatan)}</li>` : ''}</ul></div>`);
    }
    if (ekskul.length) {
        bagian.push(`<div class="preview-box mb-4"><strong>Ekstrakurikuler</strong>
            <ul>${ekskul.map(x => `<li>${esc(x.kegiatan)} — ${esc(x.predikat)}</li>`).join('')}</ul></div>`);
    }
    if (p5.length) {
        bagian.push(`<div class="preview-box mb-4"><strong>Capaian P5</strong>
            <ul>${p5.map(x => `<li>${esc(x.dimensi)}: ${esc(x.capaian)}</li>`).join('')}</ul></div>`);
    }

    $('profileExtra').innerHTML = bagian.join('');
    $('modalStudentProfile').classList.remove('hidden');
}

function closeModalStudentProfile() { $('modalStudentProfile').classList.add('hidden'); }

/* --------------------------------------------------------------------------
   15. ABSENSI
   -------------------------------------------------------------------------- */
const STATUS_ABSEN = ['Hadir', 'Izin', 'Sakit', 'Alpa'];

function renderAbsensi() {
    if (!currentUser) return;

    const tbody = $('tbodyAbsensi');
    const dateInput = $('filterTanggalAbsensi');
    if (!dateInput.value) dateInput.value = todayISO();
    const tanggal = dateInput.value;

    const kelas = kelasSaya();
    $('absensiScope').textContent = currentUser.role === 'admin'
        ? 'Seluruh murid TK dan SD. Perubahan tersimpan otomatis.'
        : `${kelas ? `Murid ${kelas}` : `Murid jenjang ${ROLE_TINGKAT[currentUser.role]}`}. Perubahan tersimpan otomatis.`;

    const murid = scopedSiswa();
    if (murid.length === 0) {
        setEmpty(tbody, 'Tambahkan murid dulu di menu peserta didik.', 'Belum ada murid');
        return;
    }

    const rec = absensiRecords[tanggal] || {};
    tbody.innerHTML = murid.map(s => {
        const status = rec[s.nis] || '';
        const options = STATUS_ABSEN.map(v => `<option value="${v}"${status === v ? ' selected' : ''}>${v}</option>`).join('');
        return `<tr>
            <td class="num">${esc(s.nis)}</td>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(s.nis)}')">${esc(s.nama)}</a></td>
            <td>${tingkatTag(s.tingkat)}</td>
            <td>${esc(s.kelas)}</td>
            <td><select class="select-inline" onchange="updateAbsensi('${escAttr(tanggal)}','${escAttr(s.nis)}',this.value)">
                <option value=""${status ? '' : ' selected'}>Belum diisi</option>${options}
            </select></td>
        </tr>`;
    }).join('');
}

function updateAbsensi(date, nis, status) {
    if (!absensiRecords[date]) absensiRecords[date] = {};
    if (status) absensiRecords[date][nis] = status;
    else delete absensiRecords[date][nis];

    saveDataToStorage();
    renderNotifications();
}

function markAllPresent() {
    const tanggal = $('filterTanggalAbsensi').value || todayISO();
    const murid = scopedSiswa();
    if (murid.length === 0) { showToast('Belum ada murid untuk diabsen.', 'error'); return; }

    showConfirmDialog('Tandai semua hadir', `${murid.length} murid akan ditandai hadir pada ${tanggalPanjang(tanggal)}.`, () => {
        if (!absensiRecords[tanggal]) absensiRecords[tanggal] = {};
        murid.forEach(s => { absensiRecords[tanggal][s.nis] = 'Hadir'; });
        saveDataToStorage();
        renderAbsensi();
        renderNotifications();
        showToast('Semua murid ditandai hadir.');
    }, 'Tandai hadir');
}

/* --------------------------------------------------------------------------
   16. GOOGLE SHEETS
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
        const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(GOOGLE_SHEET_CSV_URL));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const rows = parseCSV(await res.text()).filter(r => r.some(c => c !== ''));

        if (rows.length <= 1) {
            setEmpty(tbodyEl, 'Spreadsheet terhubung tetapi belum berisi baris data.', 'Spreadsheet kosong');
            return;
        }

        theadEl.innerHTML = `<tr>${rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
        tbodyEl.innerHTML = rows.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
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

/* Menangani kutip ganda ("") dan carriage return. Dipakai juga oleh impor Dapodik. */
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
/* ==========================================================================
   Bagian 3 : kurikulum, penilaian, leger & penguncian
   ========================================================================== */

/* --------------------------------------------------------------------------
   17. PENYELARASAN KURIKULUM (CP – TP – KD)
   -------------------------------------------------------------------------- */
function tpDariCp(cpId) { return dataTP.filter(t => t.cpId === cpId); }
function cpById(id) { return dataCP.find(c => c.id === id); }
function tpById(id) { return dataTP.find(t => t.id === id); }

function labelCP(cp) {
    return `${namaMapel(cp.mapelKode)} · Fase ${cp.fase} · ${cp.elemen}`;
}

function renderKurikulum() {
    const select = $('kurikulumFilterMapel');
    const terpilih = select.value;
    const opsi = [{ value: '', label: 'Semua mata pelajaran' },
        ...dataMapel.map(m => ({ value: m.kode, label: `${m.kode} — ${m.nama}` }))];
    isiSelect(select, opsi, terpilih);

    const filter = select.value;
    const cpList = filter ? dataCP.filter(c => c.mapelKode === filter) : dataCP;
    const tpList = dataTP.filter(t => cpList.some(c => c.id === t.cpId));
    const sudah = cpList.filter(c => tpDariCp(c.id).length > 0).length;

    $('statCP').textContent = cpList.length;
    $('statTP').textContent = tpList.length;
    $('statSelaras').textContent = cpList.length === 0 ? '—' : `${Math.round((sudah / cpList.length) * 100)}%`;

    const tree = $('kurikulumTree');
    if (cpList.length === 0) {
        tree.innerHTML = `<div class="card p-4"><div class="empty-state">
            <div class="empty-state-icon" aria-hidden="true">◌</div>
            <h4>Belum ada Capaian Pembelajaran</h4>
            <p>Tambahkan CP untuk mata pelajaran ini, lalu turunkan menjadi beberapa TP.</p>
        </div></div>`;
    } else {
        tree.innerHTML = cpList.map(cp => {
            const tps = tpDariCp(cp.id);
            const selaras = tps.length > 0;
            return `<article class="cp-block">
                <div class="cp-head">
                    <div class="cp-head-top">
                        <span class="badge-role tag-accent">${esc(namaMapel(cp.mapelKode))}</span>
                        <span class="badge-role">Fase ${esc(cp.fase)}</span>
                        <span class="badge-role">${esc(cp.elemen)}</span>
                        <span class="badge-role ${selaras ? 'tag-ok' : 'tag-warn'}">${selaras ? `${tps.length} TP` : 'Belum diturunkan'}</span>
                        <div class="row-actions" style="margin-left:auto;">
                            <button class="btn btn-secondary btn-sm" onclick="openModalTP('${escAttr(cp.id)}')">Tambah TP</button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteCP('${escAttr(cp.id)}')">Hapus CP</button>
                        </div>
                    </div>
                    <p>${esc(cp.deskripsi)}</p>
                </div>
                ${tps.length === 0
                    ? '<div class="cp-empty">Capaian ini belum punya Tujuan Pembelajaran, jadi belum bisa dipakai menyusun deskripsi rapor.</div>'
                    : `<div class="cp-tp-list">${tps.map(tp => `
                        <div class="tp-row">
                            <span class="badge-time">${esc(tp.kode)}</span>
                            <div>
                                <p>Murid dapat ${esc(tp.deskripsi)}</p>
                                <small>${esc(tp.alokasi || 0)} JP · ${dataNilai.filter(n => n.tpId === tp.id).length} nilai tertaut</small>
                            </div>
                            <div class="row-actions">
                                <button class="btn btn-danger btn-sm" onclick="confirmDeleteTP('${escAttr(tp.id)}')">Hapus</button>
                            </div>
                        </div>`).join('')}</div>`}
            </article>`;
        }).join('');
    }

    const tbodyKD = $('tbodyKD');
    const kdList = filter ? dataKD.filter(k => { const c = cpById(k.cpId); return c && c.mapelKode === filter; }) : dataKD;

    if (kdList.length === 0) {
        setEmpty(tbodyKD, 'Tambahkan padanan bila sekolah masih memakai KD Kurikulum 2013.', 'Belum ada padanan KD');
    } else {
        tbodyKD.innerHTML = kdList.map(kd => {
            const cp = cpById(kd.cpId);
            return `<tr>
                <td class="cell-strong num">${esc(kd.kode)}</td>
                <td><span class="desc-cell">${esc(kd.deskripsi)}</span></td>
                <td>${cp ? `<span class="badge-role tag-accent">${esc(labelCP(cp))}</span>` : '<span class="text-muted">CP terhapus</span>'}</td>
                <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteKD('${escAttr(kd.id)}')">Hapus</button></div></td>
            </tr>`;
        }).join('');
    }
}

function openModalCP() {
    if (dataMapel.length === 0) { showToast('Tambahkan mata pelajaran terlebih dahulu.', 'error'); return; }
    isiSelect($('cpMapel'), dataMapel.map(m => ({ value: m.kode, label: `${m.kode} — ${m.nama}` })), $('kurikulumFilterMapel').value);
    $('modalCP').classList.remove('hidden');
    $('cpElemen').focus();
}
function closeModalCP() { $('modalCP').classList.add('hidden'); $('formCP').reset(); }

function saveCP(e) {
    e.preventDefault();
    dataCP.push({
        id: uid('cp'),
        mapelKode: $('cpMapel').value,
        fase: $('cpFase').value,
        elemen: $('cpElemen').value.trim(),
        deskripsi: $('cpDeskripsi').value.trim()
    });
    saveDataToStorage();
    renderKurikulum();
    renderNotifications();
    closeModalCP();
    showToast('Capaian Pembelajaran tersimpan.');
}

function confirmDeleteCP(id) {
    const jumlahTP = tpDariCp(id).length;
    showConfirmDialog('Hapus Capaian Pembelajaran',
        jumlahTP > 0 ? `${jumlahTP} Tujuan Pembelajaran turunannya ikut terhapus.` : 'Capaian ini akan dihapus dari pemetaan.',
        () => {
            const tpIds = tpDariCp(id).map(t => t.id);
            dataCP = dataCP.filter(c => c.id !== id);
            dataTP = dataTP.filter(t => t.cpId !== id);
            dataKD = dataKD.filter(k => k.cpId !== id);
            dataNilai.forEach(n => { if (tpIds.includes(n.tpId)) n.tpId = ''; });
            saveDataToStorage();
            renderKurikulum();
            showToast('Capaian Pembelajaran dihapus.');
        }, 'Hapus');
}

function openModalTP(cpId) {
    if (dataCP.length === 0) { showToast('Tambahkan Capaian Pembelajaran terlebih dahulu.', 'error'); return; }
    isiSelect($('tpCp'), dataCP.map(c => ({ value: c.id, label: labelCP(c) })), cpId);
    $('tpKode').value = `TP-${dataTP.length + 1}.1`;
    $('modalTP').classList.remove('hidden');
    $('tpDeskripsi').focus();
}
function closeModalTP() { $('modalTP').classList.add('hidden'); $('formTP').reset(); }

function saveTP(e) {
    e.preventDefault();
    dataTP.push({
        id: uid('tp'),
        cpId: $('tpCp').value,
        kode: $('tpKode').value.trim(),
        alokasi: parseInt($('tpAlokasi').value, 10) || 0,
        deskripsi: $('tpDeskripsi').value.trim().replace(/^murid dapat\s+/i, '')
    });
    saveDataToStorage();
    renderKurikulum();
    renderNotifications();
    closeModalTP();
    showToast('Tujuan Pembelajaran tersimpan.');
}

function confirmDeleteTP(id) {
    const terpakai = dataNilai.filter(n => n.tpId === id).length;
    showConfirmDialog('Hapus Tujuan Pembelajaran',
        terpakai > 0 ? `${terpakai} nilai kehilangan tautan ke TP ini, tetapi nilainya tetap tersimpan.` : 'Tujuan ini akan dihapus dari pemetaan.',
        () => {
            dataTP = dataTP.filter(t => t.id !== id);
            dataNilai.forEach(n => { if (n.tpId === id) n.tpId = ''; });
            saveDataToStorage();
            renderKurikulum();
            showToast('Tujuan Pembelajaran dihapus.');
        }, 'Hapus');
}

function openModalKD() {
    if (dataCP.length === 0) { showToast('Tambahkan Capaian Pembelajaran terlebih dahulu.', 'error'); return; }
    isiSelect($('kdCp'), dataCP.map(c => ({ value: c.id, label: labelCP(c) })));
    $('modalKD').classList.remove('hidden');
    $('kdKode').focus();
}
function closeModalKD() { $('modalKD').classList.add('hidden'); $('formKD').reset(); }

function saveKD(e) {
    e.preventDefault();
    dataKD.push({
        id: uid('kd'),
        kode: $('kdKode').value.trim(),
        deskripsi: $('kdDeskripsi').value.trim(),
        cpId: $('kdCp').value
    });
    saveDataToStorage();
    renderKurikulum();
    closeModalKD();
    showToast('Padanan KD tersimpan.');
}

function confirmDeleteKD(id) {
    showConfirmDialog('Hapus padanan KD', 'Padanan ini akan dihapus dari daftar.', () => {
        dataKD = dataKD.filter(k => k.id !== id);
        saveDataToStorage();
        renderKurikulum();
        showToast('Padanan KD dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   18. PERHITUNGAN NILAI
   -------------------------------------------------------------------------- */
function rerataNumerik(list) {
    const angka = list.map(n => parseFloat(String(n.nilai).replace(',', '.'))).filter(v => !isNaN(v));
    if (angka.length === 0) return null;
    return angka.reduce((a, b) => a + b, 0) / angka.length;
}

/* Nilai akhir menggabungkan rata-rata formatif dan sumatif sesuai bobot sekolah. */
function nilaiAkhir(nis, mapelKode) {
    const list = dataNilai.filter(n => String(n.nis) === String(nis) && n.mapelKode === mapelKode);
    const f = rerataNumerik(list.filter(n => n.jenis === 'formatif'));
    const s = rerataNumerik(list.filter(n => n.jenis !== 'formatif'));

    if (f === null && s === null) return null;
    if (f === null) return s;
    if (s === null) return f;

    const w = (Number(pengaturan.bobotFormatif) || 40) / 100;
    return f * w + s * (1 - w);
}

function predikatNilai(na) {
    if (na === null) return { kode: '—', kata: 'belum dinilai' };
    if (na >= 86) return { kode: 'A', kata: 'sangat baik' };
    if (na >= 76) return { kode: 'B', kata: 'baik' };
    if (na >= 66) return { kode: 'C', kata: 'cukup' };
    return { kode: 'D', kata: 'perlu bimbingan' };
}

/* --------------------------------------------------------------------------
   19. MAPEL & NILAI
   -------------------------------------------------------------------------- */
function renderPembelajaran() {
    if (!currentUser) return;

    const mapelSaya = scopedMapel();
    const filterJenis = $('nilaiFilterJenis').value;
    let nilaiSaya = scopedNilai();
    if (filterJenis) nilaiSaya = nilaiSaya.filter(n => (n.jenis || 'sumatif') === filterJenis);

    const t = tugasSaya();
    $('pembelajaranScope').textContent = currentUser.role === 'admin'
        ? 'Seluruh kurikulum TK dan SD.'
        : (t.jenis === 'guru_mapel'
            ? `Mata pelajaran yang Anda ampu di jenjang ${ROLE_TINGKAT[currentUser.role]}.`
            : `Kurikulum dan penilaian jenjang ${ROLE_TINGKAT[currentUser.role]}.`);

    const tbodyMapel = $('tbodyMapel');
    if (mapelSaya.length === 0) {
        setEmpty(tbodyMapel, 'Tambahkan mata pelajaran lewat tombol di atas.', 'Belum ada mapel');
    } else {
        tbodyMapel.innerHTML = mapelSaya.map(m => {
            const jumlahTP = dataTP.filter(tp => { const c = cpById(tp.cpId); return c && c.mapelKode === m.kode; }).length;
            return `<tr>
                <td class="cell-strong">${esc(m.kode)}</td>
                <td>${esc(m.nama)}</td>
                <td>${tingkatTag(ROLE_TINGKAT[m.role] || '—')}</td>
                <td><span class="badge-role ${jumlahTP ? 'tag-ok' : 'tag-warn'}">${jumlahTP || 'belum ada'}</span></td>
                <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteMapel('${escAttr(m.kode)}')">Hapus</button></div></td>
            </tr>`;
        }).join('');
    }

    const tbodyNilai = $('tbodyNilai');
    if (nilaiSaya.length === 0) {
        setEmpty(tbodyNilai, 'Penilaian yang diinput akan tampil di sini.', 'Belum ada nilai');
    } else {
        tbodyNilai.innerHTML = [...nilaiSaya].reverse().map(n => `<tr>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(n.nis)}')">${esc(namaSiswa(n.nis))}</a></td>
            <td>${esc(namaMapel(n.mapelKode))}</td>
            <td><span class="badge-role ${(n.jenis || 'sumatif') === 'formatif' ? 'tag-warn' : 'tag-accent'}">${esc(n.jenis || 'sumatif')}</span></td>
            <td class="cell-strong num">${esc(n.nilai)}</td>
            <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteNilai('${escAttr(n.id)}')">Hapus</button></div></td>
        </tr>`).join('');
    }
}

function openModalMapel() {
    const isAdmin = currentUser.role === 'admin';
    $('mapelJenjangGroup').classList.toggle('hidden', !isAdmin);
    $('mapelRole').value = isAdmin ? 'guru_sd' : currentUser.role;
    $('mapelKode').placeholder = `${ROLE_TINGKAT[currentUser.role] || 'SD'}-IPA`;
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
    closeModalMapel();
    showToast('Mata pelajaran tersimpan.');
}

function confirmDeleteMapel(kode) {
    const terpakai = dataNilai.filter(n => n.mapelKode === kode).length;
    const cpTerkait = dataCP.filter(c => c.mapelKode === kode).length;
    const pesan = [];
    if (terpakai) pesan.push(`${terpakai} rekam nilai`);
    if (cpTerkait) pesan.push(`${cpTerkait} CP beserta TP-nya`);

    showConfirmDialog('Hapus mata pelajaran',
        pesan.length ? `${pesan.join(' dan ')} ikut terhapus.` : 'Mata pelajaran akan dihapus dari kurikulum.',
        () => {
            const cpIds = dataCP.filter(c => c.mapelKode === kode).map(c => c.id);
            dataMapel = dataMapel.filter(m => m.kode !== kode);
            dataNilai = dataNilai.filter(n => n.mapelKode !== kode);
            dataCP = dataCP.filter(c => c.mapelKode !== kode);
            dataTP = dataTP.filter(t => !cpIds.includes(t.cpId));
            dataKD = dataKD.filter(k => !cpIds.includes(k.cpId));
            Object.keys(dataDeskripsi).forEach(k => { if (k.endsWith(`|${kode}`)) delete dataDeskripsi[k]; });
            saveDataToStorage();
            renderPembelajaran();
            showToast('Mata pelajaran dihapus.');
        }, 'Hapus');
}

function openModalNilai() {
    if (guardKunci('Input nilai')) return;

    const mapelSaya = scopedMapel();
    if (mapelSaya.length === 0) { showToast('Tambahkan mata pelajaran dulu sebelum input nilai.', 'error'); return; }

    isiSelect($('nilaiMapelSelect'), mapelSaya.map(m => ({ value: m.kode, label: `${m.nama} (${ROLE_TINGKAT[m.role] || '-'})` })));
    $('nilaiTanggal').value = todayISO();
    syncNilaiSiswaOptions();

    if (lewatTenggat()) showToast(`Tenggat input nilai lewat pada ${tanggalPanjang(pengaturan.deadline)}.`, 'error');
    $('modalNilai').classList.remove('hidden');
}

/* Daftar murid dan TP mengikuti mata pelajaran yang dipilih. */
function syncNilaiSiswaOptions() {
    const kode = $('nilaiMapelSelect').value;
    const mapel = dataMapel.find(m => m.kode === kode);
    const tingkat = mapel ? ROLE_TINGKAT[mapel.role] : null;

    let list = currentUser.role === 'admin' ? dataSiswa : scopedSiswa();
    if (tingkat) list = list.filter(s => s.tingkat === tingkat);

    const select = $('nilaiSiswaSelect');
    select.innerHTML = list.length === 0
        ? '<option value="">Belum ada murid di jenjang ini</option>'
        : list.map(s => `<option value="${esc(s.nis)}">${esc(s.nama)} — ${esc(s.kelas)}</option>`).join('');
    select.disabled = list.length === 0;

    const tps = dataTP.filter(tp => { const c = cpById(tp.cpId); return c && c.mapelKode === kode; });
    $('nilaiTpSelect').innerHTML = '<option value="">Tidak ditautkan</option>' +
        tps.map(tp => `<option value="${esc(tp.id)}">${esc(tp.kode)} — ${esc(tp.deskripsi)}</option>`).join('');
}

function closeModalNilai() { $('modalNilai').classList.add('hidden'); $('formNilai').reset(); }

function saveNilai(e) {
    e.preventDefault();
    if (guardKunci('Input nilai')) return;

    const nis = $('nilaiSiswaSelect').value;
    if (!nis) { showToast('Tidak ada murid yang bisa dinilai di jenjang ini.', 'error'); return; }

    const kode = $('nilaiMapelSelect').value;
    const mapel = dataMapel.find(m => m.kode === kode);

    dataNilai.push({
        id: uid('n'),
        nis,
        mapelKode: kode,
        jenis: $('nilaiJenis').value,
        tpId: $('nilaiTpSelect').value,
        nilai: $('nilaiAngka').value.trim(),
        catatan: $('nilaiCatatan').value.trim(),
        tanggal: $('nilaiTanggal').value,
        role: mapel ? mapel.role : currentUser.role
    });

    saveDataToStorage();
    renderPembelajaran();
    closeModalNilai();
    showToast('Penilaian tersimpan.');
}

function confirmDeleteNilai(id) {
    if (guardKunci('Data nilai')) return;
    showConfirmDialog('Hapus penilaian', 'Rekam nilai ini akan dihapus permanen.', () => {
        dataNilai = dataNilai.filter(n => n.id !== id);
        saveDataToStorage();
        renderPembelajaran();
        showToast('Penilaian dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   20. LEGER & PENGUNCIAN
   -------------------------------------------------------------------------- */
function renderLegerPage() {
    $('setTahun').value = pengaturan.tahun;
    $('setSemester').value = pengaturan.semester;
    $('setDeadline').value = pengaturan.deadline || '';
    $('setBobot').value = String(pengaturan.bobotFormatif || 40);

    const terpilih = $('legerKelas').value;
    isiSelect($('legerKelas'), dataKelas.map(k => ({ value: k.nama, label: k.nama })), terpilih || (dataKelas[0] && dataKelas[0].nama));

    renderStatusKunci();
    renderLeger();
}

function renderStatusKunci() {
    const tag = $('legerStatusTag');
    const btn = $('btnKunci');

    if (nilaiTerkunci()) {
        tag.className = 'badge-role tag-lock';
        tag.textContent = `Terkunci ${pengaturan.lockedAt ? tanggalPanjang(pengaturan.lockedAt.split('T')[0]) : ''}`.trim();
        btn.textContent = 'Buka kunci';
        btn.className = 'btn btn-secondary';
    } else if (lewatTenggat()) {
        tag.className = 'badge-role tag-warn';
        tag.textContent = 'Tenggat terlewat';
        btn.textContent = 'Kunci nilai';
        btn.className = 'btn btn-danger';
    } else {
        tag.className = 'badge-role tag-ok';
        tag.textContent = 'Terbuka';
        btn.textContent = 'Kunci nilai';
        btn.className = 'btn btn-danger';
    }
    renderPeriodeTag();
}

function savePengaturanNilai() {
    pengaturan.tahun = $('setTahun').value.trim() || pengaturan.tahun;
    pengaturan.semester = $('setSemester').value;
    pengaturan.deadline = $('setDeadline').value;
    pengaturan.bobotFormatif = parseInt($('setBobot').value, 10) || 40;

    saveDataToStorage();
    renderStatusKunci();
    renderLeger();
    renderNotifications();
    showToast('Pengaturan periode tersimpan.');
}

function toggleKunciNilai() {
    if (nilaiTerkunci()) {
        showConfirmDialog('Buka kunci nilai',
            `Guru dapat kembali menambah dan mengubah nilai periode ${pengaturan.semester} ${pengaturan.tahun}.`,
            () => {
                pengaturan.locked = false;
                pengaturan.lockedAt = null;
                pengaturan.lockedBy = '';
                saveDataToStorage();
                renderStatusKunci();
                renderNotifications();
                showToast('Kunci dibuka. Nilai bisa diubah lagi.');
            }, 'Buka kunci');
        return;
    }

    const belum = hitungMapelBelumLengkap();
    const catatan = belum > 0
        ? `Masih ada ${belum} kombinasi murid–mapel tanpa nilai. Setelah dikunci, guru tidak bisa menambah atau menghapus nilai, sikap, P5, dan ekstrakurikuler.`
        : 'Setelah dikunci, guru tidak bisa menambah atau menghapus nilai, sikap, P5, dan ekstrakurikuler.';

    showConfirmDialog(`Kunci nilai ${pengaturan.semester} ${pengaturan.tahun}`, catatan, () => {
        pengaturan.locked = true;
        pengaturan.lockedAt = new Date().toISOString();
        pengaturan.lockedBy = currentUser.username;
        saveDataToStorage();
        renderStatusKunci();
        renderNotifications();
        showToast('Nilai dikunci.');
    }, 'Kunci sekarang');
}

function hitungMapelBelumLengkap() {
    let n = 0;
    dataSiswa.forEach(s => {
        dataMapel.filter(m => ROLE_TINGKAT[m.role] === s.tingkat).forEach(m => {
            if (nilaiAkhir(s.nis, m.kode) === null) n++;
        });
    });
    return n;
}

function renderLeger() {
    const kelas = $('legerKelas').value;
    const thead = $('theadLeger');
    const tbody = $('tbodyLeger');

    const murid = dataSiswa.filter(s => s.kelas === kelas);
    const kelasObj = dataKelas.find(k => k.nama === kelas);
    const tingkat = kelasObj ? kelasObj.tingkat : (murid[0] && murid[0].tingkat) || 'SD';
    const mapel = dataMapel.filter(m => ROLE_TINGKAT[m.role] === tingkat);

    thead.innerHTML = `<tr>
        <th>No</th><th>NIS</th><th>Nama</th>
        ${mapel.map(m => `<th title="${esc(m.nama)}">${esc(m.kode)}</th>`).join('')}
        <th>Rata-rata</th><th>Predikat</th><th>Peringkat</th>
    </tr>`;

    if (murid.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${mapel.length + 6}" class="empty-state">
            <div class="empty-state-icon" aria-hidden="true">◌</div>
            <h4>Belum ada murid di ${esc(kelas || 'kelas ini')}</h4>
            <p>Pilih kelas lain, atau impor peserta didik dari Dapodik.</p></td></tr>`;
        return;
    }

    const baris = murid.map(s => {
        const nilai = mapel.map(m => nilaiAkhir(s.nis, m.kode));
        const terisi = nilai.filter(v => v !== null);
        const rata = terisi.length ? terisi.reduce((a, b) => a + b, 0) / terisi.length : null;
        return { s, nilai, rata };
    });

    const urut = [...baris].filter(b => b.rata !== null).sort((a, b) => b.rata - a.rata);
    const peringkat = new Map();
    urut.forEach((b, i) => peringkat.set(String(b.s.nis), i + 1));

    tbody.innerHTML = baris.map((b, i) => {
        const p = predikatNilai(b.rata);
        return `<tr>
            <td class="num">${i + 1}</td>
            <td class="num">${esc(b.s.nis)}</td>
            <td>${esc(b.s.nama)}</td>
            ${b.nilai.map(v => `<td><span class="leger-nilai ${v === null ? 'is-kosong' : (v < 66 ? 'is-rendah' : '')}">${v === null ? '–' : v.toFixed(1)}</span></td>`).join('')}
            <td class="leger-nilai">${b.rata === null ? '–' : b.rata.toFixed(1)}</td>
            <td>${esc(p.kode)}</td>
            <td class="num">${peringkat.get(String(b.s.nis)) || '–'}</td>
        </tr>`;
    }).join('');
}

function cetakLeger() {
    const kelas = $('legerKelas').value;
    if (!kelas) { showToast('Pilih kelas terlebih dahulu.', 'error'); return; }

    const waliEntry = Object.keys(usersList).find(k => {
        const t = usersList[k].tugas || {};
        return t.jenis === 'wali_kelas' && t.kelas === kelas;
    });
    const wali = waliEntry ? usersList[waliEntry].name : '…………………………';

    $('legerKop').innerHTML = `
        <h2>${esc(dataSekolah.nama)}</h2>
        <p>${esc(dataSekolah.alamat)} · NPSN ${esc(dataSekolah.npsn)}</p>
        <div class="leger-judul">LEGER PENILAIAN — ${esc(kelas.toUpperCase())} · SEMESTER ${esc(pengaturan.semester.toUpperCase())} ${esc(pengaturan.tahun)}</div>`;

    const hariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    $('legerTtd').innerHTML = `
        <div><span>Mengetahui,<br>Kepala Sekolah</span><div class="ttd-space"></div><b>${esc(dataSekolah.kepsek)}</b>
            <div>${esc(dataSekolah.nipKepsek || '')}</div></div>
        <div><span>Pekanbaru, ${esc(hariIni)}<br>Wali Kelas</span><div class="ttd-space"></div><b>${esc(wali)}</b><div>&nbsp;</div></div>`;

    window.print();
}
/* ==========================================================================
   Bagian 4 : modul wali kelas SD dan ringkasan
   ========================================================================== */

/* --------------------------------------------------------------------------
   21. SIKAP & CATATAN WALI KELAS
   -------------------------------------------------------------------------- */
function renderSikap(query = '') {
    if (!currentUser) return;

    const kelas = kelasSaya();
    $('sikapScope').textContent = kelas
        ? `Murid ${kelas}. Penilaian sikap spiritual, sikap sosial, dan catatan naratif wali kelas.`
        : 'Penilaian sikap dan catatan wali kelas untuk murid jenjang Anda.';

    const q = String(query).trim().toLowerCase();
    const murid = scopedSiswa().filter(s => !q || s.nama.toLowerCase().includes(q));
    const tbody = $('tbodySikap');

    if (murid.length === 0) {
        setEmpty(tbody, q ? 'Ubah kata kunci pencarian.' : 'Belum ada murid di kelas yang Anda ampu.',
            q ? 'Tidak ada yang cocok' : 'Belum ada murid');
        return;
    }

    tbody.innerHTML = murid.map(s => {
        const d = dataSikap[s.nis];
        const belum = '<span class="text-muted">Belum diisi</span>';
        return `<tr>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(s.nis)}')">${esc(s.nama)}</a></td>
            <td>${d ? `<span class="badge-role tag-ok">${esc(d.spiritual)}</span>` : belum}</td>
            <td>${d ? `<span class="badge-role tag-ok">${esc(d.sosial)}</span>` : belum}</td>
            <td>${d && d.catatan ? `<span class="desc-cell">${esc(d.catatan)}</span>` : belum}</td>
            <td><div class="row-actions">
                <button class="btn btn-secondary btn-sm" onclick="openModalSikap('${escAttr(s.nis)}')">${d ? 'Ubah' : 'Isi'}</button>
            </div></td>
        </tr>`;
    }).join('');
}

function openModalSikap(nis) {
    if (guardKunci('Penilaian sikap')) return;

    const s = dataSiswa.find(x => String(x.nis) === String(nis));
    if (!s) return;

    const d = dataSikap[nis] || {};
    $('sikapNis').value = nis;
    $('sikapSub').textContent = `${s.nama} · ${s.kelas} · Semester ${pengaturan.semester} ${pengaturan.tahun}`;

    isiSelect($('sikapSpiritual'), PREDIKAT_SIKAP, d.spiritual || 'Baik');
    isiSelect($('sikapSosial'), PREDIKAT_SIKAP, d.sosial || 'Baik');
    $('sikapDeskSpiritual').value = d.deskSpiritual || '';
    $('sikapDeskSosial').value = d.deskSosial || '';
    $('sikapCatatan').value = d.catatan || '';

    $('modalSikap').classList.remove('hidden');
    $('sikapSpiritual').focus();
}

function closeModalSikap() { $('modalSikap').classList.add('hidden'); $('formSikap').reset(); }

function saveSikap(e) {
    e.preventDefault();
    if (guardKunci('Penilaian sikap')) return;

    const nis = $('sikapNis').value;
    dataSikap[nis] = {
        spiritual: $('sikapSpiritual').value,
        sosial: $('sikapSosial').value,
        deskSpiritual: $('sikapDeskSpiritual').value.trim(),
        deskSosial: $('sikapDeskSosial').value.trim(),
        catatan: $('sikapCatatan').value.trim(),
        periode: `${pengaturan.semester} ${pengaturan.tahun}`,
        diubah: new Date().toISOString()
    };

    saveDataToStorage();
    renderSikap();
    renderNotifications();
    closeModalSikap();
    showToast('Penilaian sikap tersimpan.');
}

/* --------------------------------------------------------------------------
   22. PENILAIAN P5
   -------------------------------------------------------------------------- */
function renderP5Page() {
    const select = $('p5FilterProjek');
    const terpilih = select.value;
    isiSelect(select, [{ value: '', label: 'Semua projek' },
        ...dataProjek.map(p => ({ value: p.id, label: p.nama }))], terpilih);
    renderP5();
}

function renderP5() {
    const filter = $('p5FilterProjek').value;
    const info = $('p5ProjekInfo');
    const projek = dataProjek.find(p => p.id === filter);

    if (projek) {
        info.classList.remove('hidden');
        info.innerHTML = `<div class="card-title"><h3>${esc(projek.nama)}</h3>
                <div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteProjek('${escAttr(projek.id)}')">Hapus projek</button></div>
            </div>
            <p class="text-muted" style="font-size:.8125rem;">Tema ${esc(projek.tema)}</p>
            ${projek.deskripsi ? `<p class="mt-2" style="font-size:.875rem;">${esc(projek.deskripsi)}</p>` : ''}
            <div class="mt-4" style="display:flex;gap:6px;flex-wrap:wrap;">
                ${(projek.dimensi || []).map(d => `<span class="badge-role tag-accent">${esc(d)}</span>`).join('')}
            </div>`;
    } else {
        info.classList.add('hidden');
    }

    const nisSet = new Set(scopedSiswa().map(s => String(s.nis)));
    let list = dataP5.filter(x => nisSet.has(String(x.nis)));
    if (filter) list = list.filter(x => x.projekId === filter);

    const tbody = $('tbodyP5');
    if (list.length === 0) {
        setEmpty(tbody, dataProjek.length === 0
            ? 'Buat projek terlebih dahulu, lalu catat capaian tiap murid per dimensi.'
            : 'Belum ada capaian yang dicatat untuk projek ini.', 'Belum ada capaian P5');
        return;
    }

    tbody.innerHTML = [...list].reverse().map(x => `<tr>
        <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(x.nis)}')">${esc(namaSiswa(x.nis))}</a></td>
        <td><span class="note-cell">${esc(x.dimensi)}</span></td>
        <td><span class="badge-role ${x.capaian === 'SB' || x.capaian === 'BSH' ? 'tag-ok' : 'tag-warn'}">${esc(x.capaian)}</span></td>
        <td><span class="desc-cell">${esc(x.catatan)}</span></td>
        <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteP5('${escAttr(x.id)}')">Hapus</button></div></td>
    </tr>`).join('');
}

function openModalProjek() {
    if (guardKunci('Projek P5')) return;
    $('projekDimensi').innerHTML = DIMENSI_P5.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
    $('modalProjek').classList.remove('hidden');
    $('projekNama').focus();
}
function closeModalProjek() { $('modalProjek').classList.add('hidden'); $('formProjek').reset(); }

function saveProjek(e) {
    e.preventDefault();
    if (guardKunci('Projek P5')) return;

    const dimensi = [...$('projekDimensi').selectedOptions].map(o => o.value);
    if (dimensi.length === 0) { showToast('Pilih minimal satu dimensi yang disasar.', 'error'); return; }

    const id = uid('pj');
    dataProjek.push({
        id,
        nama: $('projekNama').value.trim(),
        tema: $('projekTema').value,
        dimensi,
        deskripsi: $('projekDeskripsi').value.trim()
    });

    saveDataToStorage();
    closeModalProjek();
    renderP5Page();
    $('p5FilterProjek').value = id;
    renderP5();
    showToast('Projek tersimpan.');
}

function confirmDeleteProjek(id) {
    const terkait = dataP5.filter(x => x.projekId === id).length;
    showConfirmDialog('Hapus projek',
        terkait > 0 ? `${terkait} catatan capaian murid ikut terhapus.` : 'Projek akan dihapus dari daftar.',
        () => {
            dataProjek = dataProjek.filter(p => p.id !== id);
            dataP5 = dataP5.filter(x => x.projekId !== id);
            saveDataToStorage();
            $('p5FilterProjek').value = '';
            renderP5Page();
            showToast('Projek dihapus.');
        }, 'Hapus');
}

function openModalP5() {
    if (guardKunci('Capaian P5')) return;
    if (dataProjek.length === 0) { showToast('Buat projek terlebih dahulu.', 'error'); return; }

    const murid = scopedSiswa();
    if (murid.length === 0) { showToast('Belum ada murid di kelas Anda.', 'error'); return; }

    isiSelect($('p5Projek'), dataProjek.map(p => ({ value: p.id, label: p.nama })), $('p5FilterProjek').value);
    isiSelect($('p5Siswa'), murid.map(s => ({ value: s.nis, label: `${s.nama} — ${s.kelas}` })));
    isiSelect($('p5Capaian'), CAPAIAN_P5.map(c => ({ value: c.kode, label: c.label })), 'BSH');
    syncP5Dimensi();

    $('modalP5').classList.remove('hidden');
}

/* Dimensi yang bisa dipilih dibatasi pada dimensi yang memang disasar projek. */
function syncP5Dimensi() {
    const projek = dataProjek.find(p => p.id === $('p5Projek').value);
    const list = projek && projek.dimensi && projek.dimensi.length ? projek.dimensi : DIMENSI_P5;
    isiSelect($('p5Dimensi'), list);
}

function closeModalP5() { $('modalP5').classList.add('hidden'); $('formP5').reset(); }

function saveP5(e) {
    e.preventDefault();
    if (guardKunci('Capaian P5')) return;

    const projekId = $('p5Projek').value;
    const nis = $('p5Siswa').value;
    const dimensi = $('p5Dimensi').value;

    /* Satu murid hanya punya satu capaian per dimensi dalam satu projek. */
    const adaIdx = dataP5.findIndex(x => x.projekId === projekId && String(x.nis) === String(nis) && x.dimensi === dimensi);
    const record = {
        id: adaIdx >= 0 ? dataP5[adaIdx].id : uid('p5'),
        projekId, nis, dimensi,
        capaian: $('p5Capaian').value,
        catatan: $('p5Catatan').value.trim(),
        diubah: new Date().toISOString()
    };

    if (adaIdx >= 0) dataP5[adaIdx] = record;
    else dataP5.push(record);

    saveDataToStorage();
    closeModalP5();
    renderP5();
    showToast(adaIdx >= 0 ? 'Capaian diperbarui.' : 'Capaian tersimpan.');
}

function confirmDeleteP5(id) {
    if (guardKunci('Capaian P5')) return;
    showConfirmDialog('Hapus capaian', 'Catatan capaian ini akan dihapus.', () => {
        dataP5 = dataP5.filter(x => x.id !== id);
        saveDataToStorage();
        renderP5();
        showToast('Capaian dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   23. EKSTRAKURIKULER
   -------------------------------------------------------------------------- */
function renderEkskul() {
    const nisSet = new Set(scopedSiswa().map(s => String(s.nis)));
    const list = dataEkskul.filter(x => nisSet.has(String(x.nis)));
    const tbody = $('tbodyEkskul');

    if (list.length === 0) {
        setEmpty(tbody, 'Catat kegiatan yang diikuti murid beserta predikatnya.', 'Belum ada catatan ekstrakurikuler');
        return;
    }

    tbody.innerHTML = [...list].reverse().map(x => `<tr>
        <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(x.nis)}')">${esc(namaSiswa(x.nis))}</a></td>
        <td class="cell-strong">${esc(x.kegiatan)}</td>
        <td><span class="badge-role ${x.predikat === 'Cukup' ? 'tag-warn' : 'tag-ok'}">${esc(x.predikat)}</span></td>
        <td><span class="desc-cell">${esc(x.keterangan)}</span></td>
        <td><div class="row-actions"><button class="btn btn-danger btn-sm" onclick="confirmDeleteEkskul('${escAttr(x.id)}')">Hapus</button></div></td>
    </tr>`).join('');
}

function openModalEkskul() {
    if (guardKunci('Data ekstrakurikuler')) return;

    const murid = scopedSiswa();
    if (murid.length === 0) { showToast('Belum ada murid di kelas Anda.', 'error'); return; }

    isiSelect($('ekskulSiswa'), murid.map(s => ({ value: s.nis, label: `${s.nama} — ${s.kelas}` })));
    isiSelect($('ekskulPredikat'), PREDIKAT_EKSKUL, 'Baik');

    $('modalEkskul').classList.remove('hidden');
    $('ekskulKegiatan').focus();
}
function closeModalEkskul() { $('modalEkskul').classList.add('hidden'); $('formEkskul').reset(); }

function saveEkskul(e) {
    e.preventDefault();
    if (guardKunci('Data ekstrakurikuler')) return;

    const nis = $('ekskulSiswa').value;
    const kegiatan = $('ekskulKegiatan').value.trim();

    if (dataEkskul.some(x => String(x.nis) === String(nis) && x.kegiatan.toLowerCase() === kegiatan.toLowerCase())) {
        showToast('Murid ini sudah punya catatan untuk kegiatan tersebut.', 'error');
        return;
    }

    dataEkskul.push({
        id: uid('ek'),
        nis, kegiatan,
        predikat: $('ekskulPredikat').value,
        keterangan: $('ekskulKeterangan').value.trim(),
        periode: `${pengaturan.semester} ${pengaturan.tahun}`
    });

    saveDataToStorage();
    closeModalEkskul();
    renderEkskul();
    showToast('Catatan ekstrakurikuler tersimpan.');
}

function confirmDeleteEkskul(id) {
    if (guardKunci('Data ekstrakurikuler')) return;
    showConfirmDialog('Hapus catatan', 'Catatan ekstrakurikuler ini akan dihapus.', () => {
        dataEkskul = dataEkskul.filter(x => x.id !== id);
        saveDataToStorage();
        renderEkskul();
        showToast('Catatan dihapus.');
    }, 'Hapus');
}

/* --------------------------------------------------------------------------
   24. DESKRIPSI AKADEMIK
   -------------------------------------------------------------------------- */
function kunciDeskripsi(nis, mapelKode) { return `${nis}|${mapelKode}`; }

/* Draf disusun dari TP yang benar-benar dinilai, bukan kalimat umum. */
function susunDraf(nis, mapelKode) {
    const s = dataSiswa.find(x => String(x.nis) === String(nis));
    if (!s) return '';

    const na = nilaiAkhir(nis, mapelKode);
    const mapel = namaMapel(mapelKode);
    if (na === null) return `Ananda ${s.nama} belum memiliki nilai pada ${mapel}, sehingga deskripsi capaian belum dapat disusun.`;

    const p = predikatNilai(na);
    const terkait = dataNilai
        .filter(n => String(n.nis) === String(nis) && n.mapelKode === mapelKode && n.tpId)
        .map(n => ({ tp: tpById(n.tpId), angka: parseFloat(String(n.nilai).replace(',', '.')) }))
        .filter(x => x.tp && !isNaN(x.angka));

    if (terkait.length === 0) {
        return `Ananda ${s.nama} menunjukkan capaian ${p.kata} pada ${mapel} dengan nilai akhir ${na.toFixed(0)}.`;
    }

    const urut = [...terkait].sort((a, b) => b.angka - a.angka);
    const atas = urut[0];
    const bawah = urut[urut.length - 1];

    /* Satu TP saja: kalimatnya mengikuti tinggi rendahnya nilai, bukan selalu "sudah mampu". */
    if (urut.length === 1 || atas.tp.id === bawah.tp.id) {
        return atas.angka < 76
            ? `Ananda ${s.nama} menunjukkan capaian ${p.kata} pada ${mapel} dan masih memerlukan pendampingan dalam ${atas.tp.deskripsi}.`
            : `Ananda ${s.nama} menunjukkan capaian ${p.kata} pada ${mapel}. Ia sudah mampu ${atas.tp.deskripsi}.`;
    }

    let teks = `Ananda ${s.nama} menunjukkan capaian ${p.kata} pada ${mapel}. Ia sudah mampu ${atas.tp.deskripsi}`;
    teks += bawah.angka < 76
        ? `, namun masih memerlukan pendampingan dalam ${bawah.tp.deskripsi}.`
        : ` serta ${bawah.tp.deskripsi}.`;
    return teks;
}

function renderDeskripsiPage() {
    const select = $('deskripsiMapel');
    const mapelSaya = scopedMapel();
    isiSelect(select, mapelSaya.map(m => ({ value: m.kode, label: `${m.kode} — ${m.nama}` })), select.value);
    renderDeskripsi();
}

function renderDeskripsi() {
    const mapelKode = $('deskripsiMapel').value;
    const tbody = $('tbodyDeskripsi');
    const murid = scopedSiswa();

    if (!mapelKode || murid.length === 0) {
        setEmpty(tbody, 'Pilih mata pelajaran yang Anda ampu dan pastikan kelas sudah berisi murid.', 'Belum bisa menyusun deskripsi');
        return;
    }

    tbody.innerHTML = murid.map(s => {
        const na = nilaiAkhir(s.nis, mapelKode);
        const simpan = dataDeskripsi[kunciDeskripsi(s.nis, mapelKode)];
        const teks = simpan ? simpan.teks : susunDraf(s.nis, mapelKode);
        const status = simpan
            ? '<span class="badge-role tag-ok">Disunting guru</span>'
            : '<span class="badge-role tag-warn">Draf otomatis</span>';

        return `<tr>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(s.nis)}')">${esc(s.nama)}</a></td>
            <td><span class="leger-nilai ${na === null ? 'is-kosong' : ''}">${na === null ? '–' : na.toFixed(1)}</span></td>
            <td><span class="desc-cell">${esc(teks)}</span></td>
            <td>${status}</td>
            <td><div class="row-actions">
                <button class="btn btn-secondary btn-sm" onclick="openModalDeskripsi('${escAttr(s.nis)}','${escAttr(mapelKode)}')">Sunting</button>
            </div></td>
        </tr>`;
    }).join('');
}

function openModalDeskripsi(nis, mapelKode) {
    if (guardKunci('Deskripsi akademik')) return;

    const s = dataSiswa.find(x => String(x.nis) === String(nis));
    if (!s) return;

    $('deskripsiNis').value = nis;
    $('deskripsiMapelKode').value = mapelKode;
    $('deskripsiSub').textContent = `${s.nama} · ${namaMapel(mapelKode)} · ${pengaturan.semester} ${pengaturan.tahun}`;

    const simpan = dataDeskripsi[kunciDeskripsi(nis, mapelKode)];
    $('deskripsiTeks').value = simpan ? simpan.teks : susunDraf(nis, mapelKode);

    const terkait = dataNilai.filter(n => String(n.nis) === String(nis) && n.mapelKode === mapelKode);
    const na = nilaiAkhir(nis, mapelKode);
    $('deskripsiRujukan').innerHTML = `<strong>Rujukan draf</strong>
        <ul>
            <li>Nilai akhir: ${na === null ? 'belum ada' : `${na.toFixed(1)} (${predikatNilai(na).kode})`}</li>
            <li>${terkait.filter(n => n.jenis === 'formatif').length} nilai formatif · ${terkait.filter(n => n.jenis !== 'formatif').length} nilai sumatif</li>
            ${terkait.filter(n => n.tpId).map(n => { const tp = tpById(n.tpId); return tp ? `<li>${esc(tp.kode)}: ${esc(tp.deskripsi)} — ${esc(n.nilai)}</li>` : ''; }).join('')}
        </ul>`;

    $('modalDeskripsi').classList.remove('hidden');
    $('deskripsiTeks').focus();
}

function closeModalDeskripsi() { $('modalDeskripsi').classList.add('hidden'); }

function susunUlangSatu() {
    const nis = $('deskripsiNis').value;
    const mapelKode = $('deskripsiMapelKode').value;
    $('deskripsiTeks').value = susunDraf(nis, mapelKode);
    showToast('Draf disusun ulang dari nilai terkini.');
}

function saveDeskripsi(e) {
    e.preventDefault();
    if (guardKunci('Deskripsi akademik')) return;

    const nis = $('deskripsiNis').value;
    const mapelKode = $('deskripsiMapelKode').value;

    dataDeskripsi[kunciDeskripsi(nis, mapelKode)] = {
        teks: $('deskripsiTeks').value.trim(),
        diubah: new Date().toISOString(),
        oleh: currentUser.username
    };

    saveDataToStorage();
    closeModalDeskripsi();
    renderDeskripsi();
    showToast('Deskripsi tersimpan.');
}

function susunSemuaDeskripsi() {
    const mapelKode = $('deskripsiMapel').value;
    if (!mapelKode) { showToast('Pilih mata pelajaran terlebih dahulu.', 'error'); return; }
    if (guardKunci('Deskripsi akademik')) return;

    const murid = scopedSiswa();
    showConfirmDialog('Susun ulang semua draf',
        `Deskripsi ${murid.length} murid untuk ${namaMapel(mapelKode)} akan ditulis ulang dari nilai terkini. Suntingan manual yang sudah disimpan akan tergantikan.`,
        () => {
            murid.forEach(s => {
                dataDeskripsi[kunciDeskripsi(s.nis, mapelKode)] = {
                    teks: susunDraf(s.nis, mapelKode),
                    diubah: new Date().toISOString(),
                    oleh: currentUser.username
                };
            });
            saveDataToStorage();
            renderDeskripsi();
            showToast('Semua draf disusun ulang.');
        }, 'Susun ulang');
}

/* --------------------------------------------------------------------------
   25. RINGKASAN
   -------------------------------------------------------------------------- */
function renderDashboardAcademic() {
    if (!currentUser) return;

    const role = currentUser.role;
    const murid = scopedSiswa();
    const mapelSaya = scopedMapel();
    const nilaiSaya = scopedNilai();
    const kelas = kelasSaya();

    $('dashRoleTitle').textContent = labelPenugasan(currentUser);
    $('dashLabelSiswa').textContent = role === 'admin' ? 'Total murid TK & SD' : (kelas ? `Murid ${kelas}` : `Murid ${ROLE_TINGKAT[role]}`);
    $('dashTotalSiswa').textContent = murid.length;

    const hariIni = absensiRecords[todayISO()] || {};
    const tercatat = murid.filter(s => hariIni[s.nis]);
    const hadir = tercatat.filter(s => hariIni[s.nis] === 'Hadir').length;
    $('dashHadirHariIni').textContent = tercatat.length === 0 ? '—' : `${Math.round((hadir / tercatat.length) * 100)}%`;

    $('chartScopeTag').textContent = role === 'admin' ? 'Semua jenjang' : (kelas || ROLE_TINGKAT[role]);

    /* Kelengkapan rapor — hanya relevan untuk guru SD yang mengisi komponen rapor. */
    const progresCard = $('dashProgresCard');
    if (role === 'guru_sd' && murid.length > 0) {
        progresCard.classList.remove('hidden');
        $('dashProgresKelas').textContent = kelas || 'Jenjang SD';

        const komponen = [
            { label: 'Nilai sumatif', n: murid.filter(s => mapelSaya.some(m => dataNilai.some(x => String(x.nis) === String(s.nis) && x.mapelKode === m.kode && x.jenis !== 'formatif'))).length },
            { label: 'Penilaian sikap', n: murid.filter(s => dataSikap[s.nis]).length },
            { label: 'Deskripsi akademik', n: murid.filter(s => mapelSaya.some(m => dataDeskripsi[kunciDeskripsi(s.nis, m.kode)])).length },
            { label: 'Capaian P5', n: murid.filter(s => dataP5.some(x => String(x.nis) === String(s.nis))).length },
            { label: 'Ekstrakurikuler', n: murid.filter(s => dataEkskul.some(x => String(x.nis) === String(s.nis))).length }
        ];

        $('dashProgresList').innerHTML = komponen.map(k => {
            const pct = Math.round((k.n / murid.length) * 100);
            return `<div class="progress-row">
                <span>${esc(k.label)}</span>
                <span class="progress-bar"><i style="width:${pct}%"></i></span>
                <b>${k.n}/${murid.length}</b>
            </div>`;
        }).join('');
    } else {
        progresCard.classList.add('hidden');
    }

    const mapelListEl = $('dashMapelList');
    mapelListEl.innerHTML = mapelSaya.length === 0
        ? '<p class="text-muted" style="font-size:.875rem;margin-top:10px;">Belum ada mata pelajaran yang tercatat untuk Anda.</p>'
        : mapelSaya.map(m => `<div class="schedule-item">
            <span class="badge-time">${esc(m.kode)}</span><strong>${esc(m.nama)}</strong></div>`).join('');

    const tbody = $('dashTbodyNilai');
    const terbaru = [...nilaiSaya].reverse().slice(0, 6);
    if (terbaru.length === 0) {
        setEmpty(tbody, 'Nilai yang diinput akan tampil di sini.', 'Belum ada penilaian');
    } else {
        tbody.innerHTML = terbaru.map(n => `<tr>
            <td><a class="student-link" role="button" tabindex="0" onclick="openModalStudentProfile('${escAttr(n.nis)}')">${esc(namaSiswa(n.nis))}</a></td>
            <td>${esc(namaMapel(n.mapelKode))}</td>
            <td><span class="badge-role ${(n.jenis || 'sumatif') === 'formatif' ? 'tag-warn' : 'tag-accent'}">${esc(n.jenis || 'sumatif')}</span></td>
            <td class="cell-strong num">${esc(n.nilai)}</td>
        </tr>`).join('');
    }

    renderAttendanceChart();
}

function renderAttendanceChart() {
    const canvas = $('attendanceChart');
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
                fill: true, tension: .32, borderWidth: 2,
                pointRadius: 3, pointBackgroundColor: '#0e6f66', spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 400 },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => ctx.parsed.y === null ? 'Belum diabsen' : `Hadir ${ctx.parsed.y}%` } }
            },
            scales: {
                y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 25 }, grid: { color: '#eef1f4' } },
                x: { grid: { display: false } }
            }
        }
    });
}
