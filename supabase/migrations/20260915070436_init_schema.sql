-- ===========================================================================
-- EduCore — Skema Supabase
-- Jalankan seluruh berkas ini sekali di SQL Editor Supabase.
-- Urutannya penting: tabel dulu, lalu fungsi bantu, lalu RLS.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFIL PENGGUNA
-- Kata sandi TIDAK disimpan di sini. Itu urusan Supabase Auth (auth.users).
-- Tabel ini hanya menyimpan peran dan penugasan.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  nama        text not null,
  role        text not null check (role in ('admin','guru_tk','guru_sd')),
  tugas_jenis text not null default 'none'
              check (tugas_jenis in ('none','wali_kelas','guru_mapel','guru_bk')),
  tugas_kelas text,
  tugas_mapel text[] default '{}',
  dibuat_pada timestamptz not null default now()
);

-- Satu kelas hanya boleh punya satu wali.
create unique index if not exists satu_wali_per_kelas
  on profiles (tugas_kelas) where tugas_jenis = 'wali_kelas';

-- ---------------------------------------------------------------------------
-- 2. DATA INDUK
-- ---------------------------------------------------------------------------
create table if not exists sekolah (
  id          int primary key default 1 check (id = 1),  -- selalu satu baris
  npsn        text,
  nama        text,
  alamat      text,
  kepsek      text,
  nip_kepsek  text,
  jenjang     text
);

create table if not exists kelas (
  nama    text primary key,
  tingkat text not null check (tingkat in ('TK','SD'))
);

create table if not exists karyawan (
  nip    text primary key,
  nama   text not null,
  dept   text,
  status text,
  gaji   numeric default 0,
  hp     text
);

create table if not exists siswa (
  nis     text primary key,
  nama    text not null,
  tingkat text not null check (tingkat in ('TK','SD')),
  kelas   text references kelas(nama) on update cascade,
  ortu    text,
  hp      text
);
create index if not exists siswa_kelas_idx on siswa (kelas);

create table if not exists mapel (
  kode text primary key,
  nama text not null,
  role text not null check (role in ('guru_tk','guru_sd'))
);

-- ---------------------------------------------------------------------------
-- 3. KURIKULUM
-- ---------------------------------------------------------------------------
create table if not exists cp (
  id         uuid primary key default gen_random_uuid(),
  mapel_kode text references mapel(kode) on delete cascade,
  fase       text,
  elemen     text,
  deskripsi  text
);

create table if not exists tp (
  id        uuid primary key default gen_random_uuid(),
  cp_id     uuid references cp(id) on delete cascade,
  kode      text,
  alokasi   int default 0,
  deskripsi text
);

create table if not exists kd (
  id        uuid primary key default gen_random_uuid(),
  kode      text,
  deskripsi text,
  cp_id     uuid references cp(id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- 4. PERIODE & PENGUNCIAN
-- ---------------------------------------------------------------------------
create table if not exists pengaturan (
  id             int primary key default 1 check (id = 1),
  tahun          text default '2026/2027',
  semester       text default 'Ganjil',
  deadline       date,
  locked         boolean not null default false,
  locked_at      timestamptz,
  locked_by      text,
  bobot_formatif int default 40
);

insert into pengaturan (id) values (1) on conflict do nothing;
insert into sekolah (id, nama, jenjang) values (1, 'Nama Sekolah', 'TK & SD')
  on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 5. PENILAIAN
-- ---------------------------------------------------------------------------
create table if not exists nilai (
  id         uuid primary key default gen_random_uuid(),
  nis        text references siswa(nis) on delete cascade,
  mapel_kode text references mapel(kode) on delete cascade,
  jenis      text not null default 'sumatif' check (jenis in ('formatif','sumatif')),
  tp_id      uuid references tp(id) on delete set null,
  nilai      text,
  catatan    text,
  tanggal    date,
  periode    text,
  dibuat_oleh uuid references profiles(id)
);
create index if not exists nilai_nis_mapel_idx on nilai (nis, mapel_kode);

create table if not exists sikap (
  nis            text references siswa(nis) on delete cascade,
  periode        text not null,
  spiritual      text,
  sosial         text,
  desk_spiritual text,
  desk_sosial    text,
  catatan        text,
  diubah         timestamptz default now(),
  primary key (nis, periode)
);

create table if not exists ekskul (
  id         uuid primary key default gen_random_uuid(),
  nis        text references siswa(nis) on delete cascade,
  kegiatan   text not null,
  predikat   text,
  keterangan text,
  periode    text,
  unique (nis, kegiatan, periode)
);

create table if not exists projek_p5 (
  id        uuid primary key default gen_random_uuid(),
  nama      text not null,
  tema      text,
  dimensi   text[] default '{}',
  deskripsi text
);

create table if not exists capaian_p5 (
  id        uuid primary key default gen_random_uuid(),
  projek_id uuid references projek_p5(id) on delete cascade,
  nis       text references siswa(nis) on delete cascade,
  dimensi   text not null,
  capaian   text check (capaian in ('BB','MB','BSH','SB')),
  catatan   text,
  diubah    timestamptz default now(),
  unique (projek_id, nis, dimensi)   -- satu capaian per dimensi per murid
);

create table if not exists deskripsi (
  nis        text references siswa(nis) on delete cascade,
  mapel_kode text references mapel(kode) on delete cascade,
  periode    text not null,
  teks       text,
  diubah     timestamptz default now(),
  oleh       uuid references profiles(id),
  primary key (nis, mapel_kode, periode)
);

create table if not exists absensi (
  tanggal date not null,
  nis     text references siswa(nis) on delete cascade,
  status  text check (status in ('Hadir','Izin','Sakit','Alpa')),
  primary key (tanggal, nis)
);

create table if not exists dapodik_log (
  id     uuid primary key default gen_random_uuid(),
  waktu  timestamptz default now(),
  jenis  text,
  masuk  int,
  lewat  int,
  status text,
  oleh   uuid references profiles(id)
);

-- ---------------------------------------------------------------------------
-- 6. FUNGSI BANTU UNTUK RLS
-- security definer + search_path kosong: wajib, supaya fungsi tidak bisa
-- dibajak lewat tabel bernama sama di schema lain.
-- ---------------------------------------------------------------------------
create or replace function my_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function my_kelas() returns text
language sql stable security definer set search_path = '' as $$
  select tugas_kelas from public.profiles
  where id = auth.uid() and tugas_jenis = 'wali_kelas'
$$;

create or replace function my_mapel() returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(tugas_mapel, '{}') from public.profiles
  where id = auth.uid() and tugas_jenis = 'guru_mapel'
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.my_role() = 'admin', false)
$$;

create or replace function nilai_terkunci() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(locked, false) from public.pengaturan where id = 1
$$;

-- Apakah murid ini berada dalam tanggung jawab saya?
create or replace function murid_saya(p_nis text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.siswa s
    where s.nis = p_nis
      and (
        public.is_admin()
        or (
          s.tingkat = case public.my_role() when 'guru_tk' then 'TK' else 'SD' end
          and (public.my_kelas() is null or s.kelas = public.my_kelas())
        )
      )
  )
$$;

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- Tanpa ini, anon key yang tertanam di browser = akses penuh ke seluruh data.
-- ---------------------------------------------------------------------------
alter table profiles     enable row level security;
alter table sekolah      enable row level security;
alter table kelas        enable row level security;
alter table karyawan     enable row level security;
alter table siswa        enable row level security;
alter table mapel        enable row level security;
alter table cp           enable row level security;
alter table tp           enable row level security;
alter table kd           enable row level security;
alter table pengaturan   enable row level security;
alter table nilai        enable row level security;
alter table sikap        enable row level security;
alter table ekskul       enable row level security;
alter table projek_p5    enable row level security;
alter table capaian_p5   enable row level security;
alter table deskripsi    enable row level security;
alter table absensi      enable row level security;
alter table dapodik_log  enable row level security;

-- --- Profil -----------------------------------------------------------------
create policy "profil: lihat diri sendiri" on profiles
  for select to authenticated using (id = auth.uid() or is_admin());
create policy "profil: admin kelola" on profiles
  for all to authenticated using (is_admin()) with check (is_admin());

-- --- Data induk: semua yang login boleh baca, hanya admin boleh ubah --------
create policy "sekolah baca"  on sekolah  for select to authenticated using (true);
create policy "sekolah tulis" on sekolah  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "kelas baca"  on kelas  for select to authenticated using (true);
create policy "kelas tulis" on kelas  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "mapel baca"  on mapel  for select to authenticated using (true);
create policy "mapel tulis" on mapel  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "cp baca"  on cp  for select to authenticated using (true);
create policy "cp tulis" on cp  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "tp baca"  on tp  for select to authenticated using (true);
create policy "tp tulis" on tp  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "kd baca"  on kd  for select to authenticated using (true);
create policy "kd tulis" on kd  for all    to authenticated using (is_admin()) with check (is_admin());

create policy "pengaturan baca"  on pengaturan for select to authenticated using (true);
create policy "pengaturan tulis" on pengaturan for all    to authenticated using (is_admin()) with check (is_admin());

-- Gaji hanya untuk admin.
create policy "karyawan admin" on karyawan
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "dapodik log" on dapodik_log
  for all to authenticated using (is_admin()) with check (is_admin());

-- --- Murid ------------------------------------------------------------------
create policy "siswa: baca sesuai penugasan" on siswa
  for select to authenticated using (murid_saya(nis));
create policy "siswa: admin kelola" on siswa
  for all to authenticated using (is_admin()) with check (is_admin());

-- --- Nilai: penguncian ditegakkan di database, bukan hanya di tombol --------
create policy "nilai baca" on nilai
  for select to authenticated using (murid_saya(nis));

create policy "nilai tulis" on nilai
  for insert to authenticated
  with check (
    murid_saya(nis)
    and not nilai_terkunci()
    and (is_admin() or my_mapel() = '{}' or mapel_kode = any(my_mapel()))
  );

create policy "nilai ubah" on nilai
  for update to authenticated
  using (murid_saya(nis) and not nilai_terkunci())
  with check (murid_saya(nis) and not nilai_terkunci());

create policy "nilai hapus" on nilai
  for delete to authenticated
  using (murid_saya(nis) and not nilai_terkunci());

-- --- Komponen rapor lain: pola yang sama ------------------------------------
create policy "sikap baca"  on sikap for select to authenticated using (murid_saya(nis));
create policy "sikap tulis" on sikap for all to authenticated
  using (murid_saya(nis) and not nilai_terkunci())
  with check (murid_saya(nis) and not nilai_terkunci());

create policy "ekskul baca"  on ekskul for select to authenticated using (murid_saya(nis));
create policy "ekskul tulis" on ekskul for all to authenticated
  using (murid_saya(nis) and not nilai_terkunci())
  with check (murid_saya(nis) and not nilai_terkunci());

create policy "deskripsi baca"  on deskripsi for select to authenticated using (murid_saya(nis));
create policy "deskripsi tulis" on deskripsi for all to authenticated
  using (murid_saya(nis) and not nilai_terkunci())
  with check (murid_saya(nis) and not nilai_terkunci());

create policy "p5 capaian baca"  on capaian_p5 for select to authenticated using (murid_saya(nis));
create policy "p5 capaian tulis" on capaian_p5 for all to authenticated
  using (murid_saya(nis) and not nilai_terkunci())
  with check (murid_saya(nis) and not nilai_terkunci());

create policy "projek baca"  on projek_p5 for select to authenticated using (true);
create policy "projek tulis" on projek_p5 for all to authenticated
  using (not nilai_terkunci()) with check (not nilai_terkunci());

-- --- Absensi: tidak ikut terkunci, kehadiran tetap dicatat tiap hari --------
create policy "absensi baca"  on absensi for select to authenticated using (murid_saya(nis));
create policy "absensi tulis" on absensi for all to authenticated
  using (murid_saya(nis)) with check (murid_saya(nis));

-- ---------------------------------------------------------------------------
-- 8. PROFIL OTOMATIS SAAT AKUN DIBUAT
-- ---------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, nama, role, tugas_jenis, tugas_kelas, tugas_mapel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'nama', 'Pengguna Baru'),
    coalesce(new.raw_user_meta_data->>'role', 'guru_sd'),
    coalesce(new.raw_user_meta_data->>'tugas_jenis', 'none'),
    new.raw_user_meta_data->>'tugas_kelas',
    coalesce(
      (select array_agg(value::text) from jsonb_array_elements_text(
        coalesce(new.raw_user_meta_data->'tugas_mapel', '[]'::jsonb)) as value),
      '{}'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- 9. DATA AWAL (opsional, samakan dengan data demo di aplikasi)
-- ---------------------------------------------------------------------------
insert into kelas (nama, tingkat) values
  ('TK A','TK'), ('TK B','TK'),
  ('SD Kelas 1','SD'), ('SD Kelas 2','SD'), ('SD Kelas 3','SD'),
  ('SD Kelas 4','SD'), ('SD Kelas 5','SD'), ('SD Kelas 6','SD')
on conflict do nothing;

insert into mapel (kode, nama, role) values
  ('TK-MTR','Motorik & Seni','guru_tk'),
  ('TK-BHS','Mengenal Huruf & Bahasa','guru_tk'),
  ('SD-MTK','Matematika Dasar','guru_sd'),
  ('SD-IPA','IPAS Integrasi','guru_sd'),
  ('SD-BIN','Bahasa Indonesia','guru_sd')
on conflict do nothing;
