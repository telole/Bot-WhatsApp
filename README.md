# WhatsApp Bot dengan open-wa

## 📌 Deskripsi
Bot WhatsApp ini dibuat menggunakan library [`@open-wa/wa-automate`](https://github.com/open-wa/wa-automate-nodejs). Bot ini memiliki berbagai fitur seperti:
- Membalas pesan otomatis
- Membuat stiker dari gambar dan GIF
- Mengunduh video TikTok tanpa watermark(error)
- Menampilkan jadwal pelajaran

## 🚀 Instalasi
### 1. Clone Repository
```sh
```

### 2. Install Dependensi
```sh
npm install
```

### 3. Jalankan Bot
```sh
node bot.js
```

Saat pertama kali dijalankan, bot akan meminta untuk memindai kode QR di WhatsApp Web.

## 📌 Fitur dan Perintah
| Perintah | Deskripsi |
|----------|------------|
| `!cek` | Cek apakah bot aktif |
| `!rules` | Menampilkan aturan penggunaan bot |
| `!jadwal` | Menampilkan jadwal pelajaran |
| `!stiker` | Mengubah gambar atau GIF menjadi stiker |
| `!help` atau `!cmd` | Menampilkan daftar perintah |
| `!tiktok <link>` | Mengunduh video TikTok tanpa watermark |

## ⚠️ Peraturan Penggunaan
- Jangan melakukan spam pada bot ❌
- Jangan melakukan panggilan suara/video ke bot 📵
- Gunakan perintah dengan format yang benar ✅

Jika aturan dilanggar, bot bisa otomatis keluar dari grup atau memblokir pengguna.

## 🔧 Teknologi yang Digunakan
- Node.js
- `@open-wa/wa-automate`
- Sharp (untuk konversi gambar ke stiker)
- Axios (untuk mengunduh video TikTok)

## 📌 Catatan Tambahan
- Pastikan Anda memiliki Node.js versi terbaru.
- Jika mengalami error saat mengonversi gambar/video menjadi stiker, coba install ulang dependensi dengan `npm install`.
- Beberapa fitur seperti download video TikTok bergantung pada API pihak ketiga, sehingga bisa mengalami perubahan sewaktu-waktu.

## 🛠 Troubleshooting
**Masalah QR Code Tidak Muncul**
```sh
rm -rf .wwebjs_auth && node bot.js
```
Coba hapus session lama dan jalankan kembali bot.

**Masalah `FFmpeg` Tidak Ditemukan**
Pastikan FFmpeg sudah terinstall di sistem Anda.
```sh
sudo apt install ffmpeg # Linux
choco install ffmpeg  # Windows (gunakan Chocolatey)
```

## 📜 Lisensi
Proyek ini menggunakan lisensi MIT. Bebas digunakan dan dikembangkan lebih lanjut.

## 💡 Kontribusi
Jika ingin menambahkan fitur atau memperbaiki bug, silakan buat pull request atau diskusi di issues!

---
📌 **Dibuat oleh:** [Naraya]

