# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyek

Veltrunix — Local Development Environment untuk Windows. Aplikasi desktop GUI (Tauri 2) untuk mengelola server dan runtime pengembangan web lokal (PHP, web server, database, domain lokal, proyek Laravel) melalui satu antarmuka terpadu dengan backend Rust yang benar-benar berfungsi, bukan sekumpulan UI tanpa implementasi.

**Status sekarang:** crate Rust tunggal di `src/main.rs` yang mencetak `Hello, world!` (edisi 2024, tanpa dependensi, branch `master` belum ada komit). Frontend dan modul backend sesuai rencana di bawah ini belum terimplementasi.

## Stack teknis

- Rust: manajemen layanan/proses, operasi filesystem, konfigurasi, validasi, operasi sistem
- Tauri 2: shell desktop dan boundary frontend–backend melalui commands
- React + TypeScript + Vite: UI desktop
- Tailwind CSS: styling
- SQLite: metadata aplikasi, proyek, konfigurasi, preferensi pengguna
- Serde, Tokio, Tracing: serialisasi, asynchronous, structured logging
- Vitest (frontend), Rust unit/integration tests (backend)

## Perintah yang sering digunakan

Backend (Rust, di root repositori):

- `cargo check` — memeriksa kompilasi tanpa menghasilkan binary
- `cargo build` — build debug ke `target/debug/veltrunix`
- `cargo run` — build dan jalankan binary
- `cargo build --release` — build rilis ke `target/release/veltrunix`
- `cargo test` — menjalankan seluruh tes Rust
- `cargo test <nama>` — menjalankan satu tes yang cocok dengan nama
- `cargo clippy` — menjalankan lint
- `cargo fmt` / `cargo fmt --check` — memformat dan memverifikasi formatting

Frontend (akan tersedia di `src/` setelah package.json ada; sesuaikan package manager):

- `pnpm dev` / `npm run dev` — development server Vite
- `pnpm build` / `npm run build` — build produksi
- `pnpm test` / `npm test` — Vitest
- Tes tunggal: `pnpm test <nama>` atau `vitest run <nama>`

## Arsitektur

Boundary antara frontend dan backend adalah Tauri commands. Setiap command harus memiliki input yang tervalidasi, hasil yang terstruktur, dan error yang dapat dipahami. Batasi permission Tauri — akses filesystem dan shell hanya diberikan dengan alasan yang jelas.

Backend Rust (`src-tauri/src/`):

- `main.rs`, `lib.rs` — titik masuk Tauri
- `commands/` — handler command Tauri
- `runtime/`, `php/`, `webserver/`, `database/`, `projects/`, `domains/`, `processes/`, `diagnostics/`, `config/`, `storage/`, `errors/` — modul domain
- `capabilities/`, `Cargo.toml`, `tauri.conf.json`

Frontend (`src/`):

- `app/`, `components/`, `features/{dashboard,projects,runtimes,php,webservers,databases,domains,diagnostics,settings}`, `hooks/`, `lib/`, `services/`, `types/`, `styles/`

Status layanan harus selalu berasal dari pemeriksaan backend aktual, bukan data statis atau mock.

## Aturan kerja dan keamanan

- Gunakan kode nyata, bukan pseudo-code atau mock untuk fitur yang dikatakan selesai.
- Tidak menyimpan secret di source code; tidak mencatat password, token, atau API key ke log.
- Tidak menjalankan shell command dari input mentah tanpa validasi; hindari command injection dan path traversal.
- Validasi path, port, domain, dan argumen proses sebelum dieksekusi.
- Jangan mengubah file sistem Windows (termasuk hosts file) secara diam-diam. Tampilkan perubahan yang akan dilakukan, butuhkan elevasi hak akses saat diperlukan, dan minta konfirmasi untuk operasi berisiko.
- Jangan menghentikan proses pihak ketiga secara sembarangan, dan jangan menghapus folder proyek hanya karena registrasinya dihapus.
- Error backend tidak boleh membuat aplikasi crash tanpa informasi; tangani executable dan runtime yang tidak ditemukan dengan baik.

## Implementasi bertahap (fase)

1. Fase 1 — Audit dan fondasi: verifikasi toolchain, struktur proyek, branding Veltrunix, development build yang berhasil dijalankan.
2. Fase 2 — Desktop shell: navigasi, dashboard, Settings, theme, koneksi frontend–Tauri.
3. Fase 3 — Runtime detection: deteksi PHP, validasi executable, status dan diagnostic reporting.
4. Fase 4 — Project management: registrasi proyek, deteksi Laravel, buka folder/terminal/browser.
5. Fase 5 — Service management: service controller, web server, database, deteksi konflik port, log.
6. Fase 6 — Domain management: domain lokal, virtual host generation, validasi perubahan sistem.
7. Fase 7 — Hardening: security checks, tes otomatis, error handling, uji runtime tidak ditemukan dan service gagal berjalan.
8. Fase 8 — Packaging: build Windows, installer, verifikasi distribusi.

Setiap fase: jalankan pemeriksaan yang relevan dan perbaiki kegagalan sebelum melanjutkan ke fase berikutnya.

## Catatan

- `.gitignore` mengabaikan `/target`; `Cargo.lock` dihasilkan otomatis oleh Cargo, jangan diedit secara manual.
- Repositori belum ada komit. Buat komit di `master` sebelum PR, atau branch terlebih dahulu.
- Branding: gunakan `Veltrunix` (executable `veltrunix.exe`, crate `veltrunix`), bukan nama proyek sementara lain.
