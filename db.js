/* ==========================================================================
   db.js — lapisan data Supabase untuk EduCore
   Dimuat sebelum script.js. Memakai supabase-js v2 lewat ESM CDN.

   Peran berkas ini:
   - menyambung ke Supabase dan menangani login
   - memuat seluruh data sekali saat masuk, ke dalam array yang sudah ada
   - menyediakan simpan() dan hapus() per baris

   Yang TIDAK dilakukan: menyimpan kata sandi. Itu urusan Supabase Auth.
   ========================================================================== */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* --------------------------------------------------------------------------
   1. KONFIGURASI
   Anon key memang boleh terlihat publik — pengamanan sesungguhnya ada di RLS.
   Jangan pernah menaruh service_role key di sini.
   -------------------------------------------------------------------------- */
const SUPABASE_URL = 'https://pybjvfcsapxrkmenodjo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IgwW1SZby58RLWIdyMA2DQ_XvnCV7vI';

/* Supabase Auth memakai email. Username sekolah dipetakan ke domain semu ini. */
const DOMAIN_SEMU = 'educore.local';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
});

export const emailDari = (username) => `${String(username).trim().toLowerCase()}@${DOMAIN_SEMU}`;

/* --------------------------------------------------------------------------
   2. PEMETAAN NAMA KOLOM
   Aplikasi memakai camelCase, Postgres memakai snake_case.
   Konversi di satu tempat supaya sisa kode tidak perlu tahu.
   -------------------------------------------------------------------------- */
const ALIAS = {
    mapelKode: 'mapel_kode', tpId: 'tp_id', cpId: 'cp_id', projekId: 'projek_id',
    nipKepsek: 'nip_kepsek', deskSpiritual: 'desk_spiritual', deskSosial: 'desk_sosial',
    bobotFormatif: 'bobot_formatif', lockedAt: 'locked_at', lockedBy: 'locked_by',
    dibuatOleh: 'dibuat_oleh'
};
const ALIAS_BALIK = Object.fromEntries(Object.entries(ALIAS).map(([a, b]) => [b, a]));

const petakan = (obj, tabel) => {
    const out = {};
    for (const [k, v] of Object.entries(obj || {})) {
        const kunci = tabel[k];
        if (kunci !== undefined) out[kunci] = v;
        else out[k] = v;
    }
    return out;
};

export const keDb = (obj) => petakan(obj, ALIAS);
export const keApp = (obj) => petakan(obj, ALIAS_BALIK);

/* --------------------------------------------------------------------------
   3. AUTENTIKASI
   -------------------------------------------------------------------------- */
export async function masuk(username, password) {
    const { data, error } = await sb.auth.signInWithPassword({
        email: emailDari(username),
        password
    });
    if (error) throw new Error('Nama pengguna atau kata sandi tidak cocok.');
    return ambilProfil(data.user.id);
}

export async function keluar() { await sb.auth.signOut(); }

export async function sesiAktif() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    return ambilProfil(data.session.user.id);
}

async function ambilProfil(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error) throw new Error('Profil pengguna belum dibuat. Hubungi administrator.');

    /* Bentuknya disamakan dengan currentUser yang sudah dipakai script.js. */
    return {
        id: data.id,
        username: data.username,
        name: data.nama,
        role: data.role,
        avatar: data.nama,
        tugas: {
            jenis: data.tugas_jenis,
            kelas: data.tugas_kelas,
            mapel: data.tugas_mapel || []
        }
    };
}

/* --------------------------------------------------------------------------
   4. MEMUAT SELURUH DATA
   Dipanggil sekali setelah login. Hasilnya mengisi array global di script.js.
   RLS otomatis memangkas baris yang bukan hak pengguna ini, jadi guru SD
   tidak pernah menerima data murid TK sejak dari jaringan.
   -------------------------------------------------------------------------- */
export async function muatSemua() {
    const ambil = (t, kolom = '*') => sb.from(t).select(kolom);

    const [
        sekolah, kelas, karyawan, siswa, mapel, cp, tp, kd,
        nilai, sikap, ekskul, projek, capaian, deskripsi, absensi, pengaturan, log, profil
    ] = await Promise.all([
        sb.from('sekolah').select('*').eq('id', 1).maybeSingle(),
        ambil('kelas'), ambil('karyawan'), ambil('siswa'), ambil('mapel'),
        ambil('cp'), ambil('tp'), ambil('kd'), ambil('nilai'), ambil('sikap'),
        ambil('ekskul'), ambil('projek_p5'), ambil('capaian_p5'), ambil('deskripsi'),
        ambil('absensi'), sb.from('pengaturan').select('*').eq('id', 1).maybeSingle(),
        sb.from('dapodik_log').select('*').order('waktu', { ascending: false }).limit(20),
        ambil('profiles')
    ]);

    const gagal = [sekolah, kelas, karyawan, siswa, mapel, cp, tp, kd, nilai, sikap,
        ekskul, projek, capaian, deskripsi, absensi, pengaturan, log, profil]
        .find(r => r.error && r.error.code !== 'PGRST116');
    if (gagal) throw new Error(`Gagal memuat data: ${gagal.error.message}`);

    const baris = (r) => (r.data || []).map(keApp);

    /* absensi di database berbentuk baris; aplikasi memakai { tanggal: { nis: status } }. */
    const absensiObj = {};
    (absensi.data || []).forEach(a => {
        if (!absensiObj[a.tanggal]) absensiObj[a.tanggal] = {};
        absensiObj[a.tanggal][a.nis] = a.status;
    });

    const sikapObj = {};
    (sikap.data || []).forEach(s => { sikapObj[s.nis] = keApp(s); });

    const deskripsiObj = {};
    (deskripsi.data || []).forEach(d => { deskripsiObj[`${d.nis}|${d.mapel_kode}`] = keApp(d); });

    const usersObj = {};
    (profil.data || []).forEach(p => {
        usersObj[p.username] = {
            name: p.nama, role: p.role, avatar: p.nama,
            tugas: { jenis: p.tugas_jenis, kelas: p.tugas_kelas, mapel: p.tugas_mapel || [] }
        };
    });

    return {
        sekolah: keApp(sekolah.data || {}),
        kelas: baris(kelas),
        karyawan: baris(karyawan),
        siswa: baris(siswa),
        mapel: baris(mapel),
        cp: baris(cp),
        tp: baris(tp),
        kd: baris(kd),
        nilai: baris(nilai),
        sikap: sikapObj,
        ekskul: baris(ekskul),
        projek: baris(projek),
        p5: baris(capaian),
        deskripsi: deskripsiObj,
        absensi: absensiObj,
        pengaturan: keApp(pengaturan.data || {}),
        log: baris(log),
        users: usersObj
    };
}

/* --------------------------------------------------------------------------
   5. SIMPAN & HAPUS PER BARIS
   upsert dipakai supaya satu fungsi melayani tambah maupun ubah.
   -------------------------------------------------------------------------- */
export async function simpan(tabel, row, konflik) {
    const opsi = konflik ? { onConflict: konflik } : undefined;
    const { data, error } = await sb.from(tabel).upsert(keDb(row), opsi).select().single();
    if (error) throw terjemahkanError(error);
    return keApp(data);
}

export async function simpanBanyak(tabel, rows, konflik) {
    if (!rows.length) return [];
    const opsi = konflik ? { onConflict: konflik } : undefined;
    const { data, error } = await sb.from(tabel).upsert(rows.map(keDb), opsi).select();
    if (error) throw terjemahkanError(error);
    return (data || []).map(keApp);
}

export async function hapus(tabel, filter) {
    let q = sb.from(tabel).delete();
    Object.entries(filter).forEach(([k, v]) => { q = q.eq(ALIAS[k] || k, v); });
    const { error } = await q;
    if (error) throw terjemahkanError(error);
}

/* Pesan Postgres tidak layak dibaca guru. Terjemahkan yang sering muncul. */
function terjemahkanError(error) {
    const kode = error.code;
    if (kode === '42501' || /row-level security/i.test(error.message || '')) {
        return new Error('Tidak diizinkan. Periode nilai mungkin sedang dikunci, atau data ini di luar penugasan Anda.');
    }
    if (kode === '23505') return new Error('Data dengan kunci yang sama sudah ada.');
    if (kode === '23503') return new Error('Data rujukan tidak ditemukan. Periksa kelas atau mata pelajaran.');
    return new Error(error.message || 'Terjadi kesalahan pada server.');
}

/* --------------------------------------------------------------------------
   6. PERUBAHAN LANGSUNG (opsional)
   Kalau beberapa guru bekerja bersamaan, ini membuat tabel ikut berubah
   tanpa perlu menyegarkan halaman.
   -------------------------------------------------------------------------- */
export function dengarkan(tabel, saatBerubah) {
    return sb.channel(`perubahan-${tabel}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabel }, saatBerubah)
        .subscribe();
}
