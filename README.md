# Veltrunix

**Your Local Stack. One Control Center.**

Veltrunix adalah aplikasi desktop Windows untuk membantu developer mengelola lingkungan pengembangan lokal melalui satu antarmuka. Aplikasi dibangun menggunakan Rust, Tauri 2, React, TypeScript, Vite, dan Tailwind CSS.

> Status pengembangan: fondasi desktop, deteksi runtime, PHP-CGI, Nginx, virtual host, dan halaman Service Center tersedia. Service Center saat ini mengontrol Nginx dan PHP-CGI; Apache, MySQL/MariaDB, PostgreSQL, project manager, local domains, logs, dan settings belum menjadi fitur operasional.

## Fitur yang tersedia

- **Runtime Manager** — mendeteksi PHP, Node.js, npm, Composer, dan Git dari PATH.
- **PHP Manager** — mendeteksi PHP serta mengelola proses PHP-CGI/FastCGI.
- **Nginx Manager** — mendeteksi Nginx, memeriksa konfigurasi, dan mengontrol proses.
- **Virtual Host** — membuat, memperbarui, dan menghapus konfigurasi virtual host Nginx.
- **Service Center** — satu halaman untuk memeriksa dan mengontrol Nginx serta PHP-CGI. Apache, MySQL/MariaDB, dan PostgreSQL ditampilkan sebagai integrasi yang belum tersedia, bukan status palsu.
- **Dashboard & About** — ringkasan aplikasi dan informasi aplikasi.

## Tech stack

| Area | Teknologi |
|---|---|
| Desktop | Tauri 2 |
| Backend | Rust 2024, Serde, Tokio |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Tests | Vitest, Rust unit tests |

## Persyaratan

- Windows 10/11 x64
- Node.js 18+ dan npm
- Rust stable toolchain
- Microsoft C++ Build Tools dan Windows SDK
- WebView2 Runtime

## Menjalankan dari source

~~~powershell
git clone https://github.com/Strong-Bee/veltrunix.git
cd veltrunix
npm ci
npm run dev
~~~

Jalankan aplikasi desktop:

~~~powershell
npm run tauri -- dev
~~~

## Build dan pengujian

~~~powershell
npm run build
npm run tauri -- build
npm test -- --run
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
~~~

Hasil bundle Windows berada di src-tauri/target/release/bundle/.

## Struktur repository

~~~text
.
├── src/
│   ├── components/
│   ├── features/
│   └── lib/
├── src-tauri/
│   ├── src/
│   │   ├── commands/
│   │   ├── nginx/
│   │   ├── php/
│   │   └── runtime/
│   ├── icons/
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
~~~

## Keamanan

- Gunakan std::process::Command dengan argumen terpisah; jangan membangun perintah shell dari input pengguna.
- Validasi path, domain, port, dan aksi sebelum menjalankan proses.
- Jangan menyimpan secret di source code atau log.
- Hentikan hanya child process yang dibuat dan dilacak oleh Veltrunix.
- Minta konfirmasi sebelum mengubah konfigurasi sistem Windows.
- Status layanan harus berasal dari pemeriksaan backend, bukan data mock.

## Kontribusi

Buat branch dari main, jalankan pemeriksaan frontend dan Rust, lalu ajukan Pull Request dengan ringkasan perubahan dan hasil tes.

## Lisensi

MIT. Lihat LICENSE.
