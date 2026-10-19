# Upload perubahan ke GitHub

Repositori sudah menggunakan remote `origin`:
`git@github.com:MukhlisZahrawaniSutrisno/Test-smk3.git`, branch `main`.
Jalankan dari folder utama repositori, yaitu folder yang berisi `package.json`
dan `smk3-web-main`.

## Periksa program

```powershell
npm --prefix smk3-web-main ci
npm test
npm run lint
npm run build
```

Perintah dari folder utama diteruskan ke aplikasi `smk3-web-main`. Build
menghasilkan Prisma Client terlebih dahulu dan memeriksa TypeScript.

## Commit dan push

```powershell
git status --short
git diff
git add .gitignore package.json GITHUB_UPLOAD.md smk3-web-main
git diff --cached --stat
git commit -m "Fix validation and deployment configuration"
git push origin main
```

`node_modules`, `.next`, dan `.env` tidak perlu diunggah. Jika `node_modules`
sudah tercatat pada commit lama, keluarkan dari index tanpa menghapus berkas lokal:

```powershell
git rm -r --cached -- node_modules
```

Lakukan perintah itu sebelum commit di atas jika belum dilakukan. File dependency
diunduh kembali melalui `npm ci` berdasarkan `package-lock.json`.

Remote menggunakan SSH. Jika `git push` menampilkan `Permission denied
(publickey)`, periksa koneksi dengan `ssh -T git@github.com` dan daftarkan public
key SSH di GitHub Settings → SSH and GPG keys. Jangan mengunggah private key.
Panduan resmi: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh>.

Jika push ditolak karena remote memiliki commit baru, gunakan `git pull --rebase
origin main` setelah perubahan lokal di-commit. Selesaikan konflik jika muncul,
lalu ulangi `git push origin main`; jangan memakai force push untuk menimpa
pekerjaan lain.

## Sebelum deploy

Password database pernah tertulis dalam commit lama. Menghapusnya dari file
terbaru tidak menghapus riwayat Git: ganti password database lama dan simpan
kredensial baru hanya dalam `.env` server. Untuk membersihkan riwayat, ikuti
prosedur GitHub dan koordinasikan dengan pengguna repositori terlebih dahulu:
<https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository>.

Drone membutuhkan `/root/smk3-monitoring/.env` yang sudah diisi sebelum deploy.
Gunakan `.env.example` sebagai template. Docker berhenti bila migrasi gagal;
kesalahan migrasi harus diperbaiki sebelum menjalankan aplikasi.
