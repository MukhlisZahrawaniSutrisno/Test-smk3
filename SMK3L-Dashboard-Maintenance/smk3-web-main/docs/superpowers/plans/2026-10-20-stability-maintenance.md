# Stability and Maintenance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix reproducible stability issues without changing existing user data, and document the project so its owner can maintain it.

**Architecture:** Keep the current Next.js App Router, Prisma, PostgreSQL, and existing UI. Audit by subsystem, make only evidence-backed narrow changes, then document source file responsibilities and operational checks.

**Tech Stack:** TypeScript, React, Next.js, Prisma ORM, PostgreSQL, Tailwind CSS, Node.js.

## Global Constraints

- Do not reset, seed, or mutate production data as part of the audit.
- Do not claim the whole application is error-free unless every relevant runtime path has been verified.
- Keep deployment secrets outside the repository.
- Preserve existing feature behavior unless a confirmed defect requires a correction.

## Review Focus

- Authentication and role boundaries: test missing, invalid, and valid session cases.
- Database and migrations: verify build independently from production database access.
- Uploads and API routes: verify validation, authorization, and deployment storage assumptions.
- User actions: run existing tests, lint, and a production build.
- Maintenance note: ensure documented paths exist and explain their role accurately.

### Task 1: Establish baseline

- [x] Inspect project structure, scripts, Prisma schema/migrations, and deployment config.
- [x] Run existing tests and production build.
- [x] Complete lint and read-only subsystem audits.

### Task 2: Fix verified issues

- [x] Replace forgeable role cookies with an HMAC signed, HttpOnly session; resolve the current role from PostgreSQL.
- [x] Require role checks inside mutating Server Actions and API routes; secure upload reads against anonymous requests and traversal.
- [x] Hash new passwords with scrypt and upgrade legacy plaintext password after a successful login; remove the weak database default.
- [x] Protect seed from production and remove deletion of Witel rows.
- [x] Reuse the shared Prisma Client in pages that previously created extra clients.
- [x] Add focused tests for password hashing and session token validation.
- [x] Re-run relevant checks and review the final diff.

### Task 3: Maintenance note

- [x] Document folder map, feature-to-code paths, language/technology, runtime flow, and safe maintenance commands.
- [x] Verify documented files and commands against the repository.
