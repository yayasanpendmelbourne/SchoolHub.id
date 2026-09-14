// Database Sederhana di Memori Browser (Array Object)
let dataSiswa = [
    { nis: '1001', nama: 'Ahmad Fauzi', kelas: 'SD - Kelas 1', ortu: 'Budi Fauzi', hp: '08123456781', status: 'Aktif', foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad', dokumen: 'KK_Ahmad.pdf' },
    { nis: '2001', nama: 'Siti Nurhaliza', kelas: 'TK - Kelompok B', ortu: 'Rahmat', hp: '08123456782', status: 'Aktif', foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', dokumen: 'Akta_Siti.pdf' }
];

let dataGuru = [
    { nip: '198801', nama: 'Siti Rahma, S.Pd.', jabatan: 'Wali Kelas TK', mapel: 'Tematik TK / Seni', kelas: 'TK - Kelompok B', hp: '081987654321', foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahma' },
    { nip: '198505', nama: 'Budi Santoso, S.Pd.', jabatan: 'Guru Kelas SD', mapel: 'Matematika & IPA', kelas: 'SD - Kelas 1 & 2', hp: '081987654322', foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' }
];

// Switch Tab Navigation
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    event.target.classList.add('active');
}

// Render Data Siswa ke Tabel
function renderSiswa() {
    const tbody = document.getElementById('tbodySiswa');
    tbody.innerHTML = '';

    dataSiswa.forEach((siswa, index) => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${siswa.foto}" class="avatar" alt="Foto"></td>
                <td>${siswa.nis}</td>
                <td><strong>${siswa.nama}</strong></td>
                <td>${siswa.kelas}</td>
                <td>${siswa.ortu}</td>
                <td>${siswa.hp}</td>
                <td><span class="badge ${siswa.status.toLowerCase()}">${siswa.status}</span></td>
                <td>
                    <button class="btn btn-danger" onclick="deleteSiswa(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });
    updateStats();
}

// Render Data Guru ke Tabel
function renderGuru() {
    const tbody = document.getElementById('tbodyGuru');
    tbody.innerHTML = '';

    dataGuru.forEach((guru, index) => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${guru.foto}" class="avatar" alt="Foto"></td>
                <td>${guru.nip}</td>
                <td><strong>${guru.nama}</strong></td>
                <td>${guru.jabatan}</td>
                <td>${guru.mapel}</td>
                <td>${guru.kelas}</td>
                <td>${guru.hp}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteGuru(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });
    updateStats();
}

// Update Statistik Dashboard
function updateStats() {
    const totalTK = dataSiswa.filter(s => s.kelas.includes('TK')).length;
    const totalSD = dataSiswa.filter(s => s.kelas.includes('SD')).length;

    document.getElementById('statSiswaTK').innerText = totalTK;
    document.getElementById('statSiswaSD').innerText = totalSD;
    document.getElementById('statGuru').innerText = dataGuru.length;
}

// Operations Siswa (Modal, Save, Delete)
function openModalSiswa() { document.getElementById('modalSiswa').classList.remove('hidden'); }
function closeModalSiswa() { document.getElementById('modalSiswa').classList.add('hidden'); }

function saveSiswa(e) {
    e.preventDefault();
    const newSiswa = {
        nis: document.getElementById('siswaNis').value,
        nama: document.getElementById('siswaNama').value,
        kelas: document.getElementById('siswaKelas').value,
        ortu: document.getElementById('siswaOrtu').value,
        hp: document.getElementById('siswaHp').value,
        status: document.getElementById('siswaStatus').value,
        alamat: document.getElementById('siswaAlamat').value,
        foto: document.getElementById('siswaFoto').value || 'https://via.placeholder.com/40',
        dokumen: document.getElementById('siswaDokumen').value || '-'
    };

    dataSiswa.push(newSiswa);
    renderSiswa();
    closeModalSiswa();
    document.getElementById('formSiswa').reset();
}

function deleteSiswa(index) {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
        dataSiswa.splice(index, 1);
        renderSiswa();
    }
}

// Operations Guru (Modal, Save, Delete)
function openModalGuru() { document.getElementById('modalGuru').classList.remove('hidden'); }
function closeModalGuru() { document.getElementById('modalGuru').classList.add('hidden'); }

function saveGuru(e) {
    e.preventDefault();
    const newGuru = {
        nip: document.getElementById('guruNip').value,
        nama: document.getElementById('guruNama').value,
        jabatan: document.getElementById('guruJabatan').value,
        mapel: document.getElementById('guruMapel').value,
        kelas: document.getElementById('guruKelas').value,
        hp: document.getElementById('guruHp').value,
        foto: document.getElementById('guruFoto').value || 'https://via.placeholder.com/40'
    };

    dataGuru.push(newGuru);
    renderGuru();
    closeModalGuru();
    document.getElementById('formGuru').reset();
}

function deleteGuru(index) {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
        dataGuru.splice(index, 1);
        renderGuru();
    }
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    renderSiswa();
    renderGuru();
});
