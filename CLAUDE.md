# CLAUDE.md

## Project

Veltrunix is a Windows 10/11 desktop local-development environment. Preserve the product name Veltrunix, crate/executable name veltrunix, and tagline “Your Local Stack. One Control Center.”

## Stack

- Rust 2024 + Tauri 2 for desktop/backend.
- React 18 + TypeScript + Vite + Tailwind CSS for UI.
- Serde and Tokio for serialization and async/network work.
- Vitest and Rust unit tests.

## Repository layout

- src/features/: feature-oriented React pages and API wrappers.
- src/components/: shared shell and UI components.
- src/lib/: shared Tauri API helpers.
- src-tauri/src/commands/: Tauri command handlers.
- src-tauri/src/php/, nginx/, runtime/: backend domain modules.

## Commands

Run from repository root:

- npm ci
- npm run dev
- npm run build
- npm test -- --run (when frontend tests exist)
- npm run tauri -- dev
- npm run tauri -- build
- cargo fmt --check --manifest-path src-tauri/Cargo.toml
- cargo test --manifest-path src-tauri/Cargo.toml
- cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings

## Tauri command contract

Tauri command parameters are named at the Rust function boundary. If a Rust command accepts req: SomeRequest, invoke it from TypeScript with { req }; do not flatten request fields. Keep frontend interfaces aligned with Rust request structs and registered handlers.

When adding a command, register it in tauri::generate_handler! in src-tauri/src/main.rs.

## Engineering and security rules

- Implement real functionality; do not present placeholder screens or mock data as completed features.
- Validate paths, ports, domains, and process arguments.
- Use std::process::Command with structured arguments; never interpolate user input into shell commands.
- Do not log credentials, tokens, or secrets.
- Track and stop only child processes spawned by Veltrunix; never kill unrelated processes.
- Do not modify the Windows hosts file or other system configuration without explicit user confirmation.
- Handle missing executables and runtime failures as actionable errors.
- Work on a feature/fix branch and verify before opening a PR.
