# WhatsApp Bot Multi-Feature dengan OOP

## 📌 Deskripsi
Bot WhatsApp canggih dengan arsitektur OOP (Object-Oriented Programming) yang dibuat menggunakan library [`@open-wa/wa-automate`](https://github.com/open-wa/wa-automate-nodejs). Bot ini memiliki berbagai fitur lengkap seperti downloader media sosial, pembuat stiker, dan berbagai utility lainnya.

## ✨ Fitur Utama

### 🎬 Downloader Media Sosial
- **TikTok Downloader** - Download video TikTok tanpa watermark
- **YouTube Downloader** - Download video YouTube (maksimal 50MB)
- **Instagram Downloader** - Download foto dan video Instagram

### 🎨 Sticker Maker
- Konversi gambar menjadi stiker
- Konversi video/GIF menjadi stiker animasi

### 📝 Utility Features
- **Quote Generator** - Dapatkan quote inspiratif
- **Joke Generator** - Dapatkan joke lucu
- **Weather Info** - Cek cuaca suatu kota
- **Image Search** - Cari gambar berdasarkan keyword
- **Text Translator** - Terjemahkan teks ke bahasa Indonesia

### 👥 Group Features
- Bisa digunakan di grup tanpa mention untuk perintah tertentu
- Info grup
- Support multi-device

## 🚀 Instalasi

### 1. Clone Repository
```sh
git clone <repository-url>
cd Bot-WhatsApp
```

### 2. Install Dependensi
```sh
npm install
```

### 3. Jalankan Bot
```sh
npm start
# atau
node bot.js
```

Saat pertama kali dijalankan, bot akan meminta untuk memindai kode QR di WhatsApp Web.

## 📌 Daftar Perintah Lengkap

### 🎬 Downloader
| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!tiktok <link>` | Download video TikTok tanpa watermark | `!tiktok https://vm.tiktok.com/xxxxx` |
| `!yt <link>` atau `!youtube <link>` | Download video YouTube | `!yt https://youtube.com/watch?v=xxxxx` |
| `!ig <link>` atau `!instagram <link>` | Download foto/video Instagram | `!ig https://instagram.com/p/xxxxx` |

### 🎨 Sticker
| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!stiker` | Kirim gambar/video dengan caption !stiker | Kirim gambar + caption `!stiker` |

### 📝 Utility
| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `!quote` | Dapatkan quote inspiratif | `!quote` |
| `!joke` | Dapatkan joke lucu | `!joke` |
| `!cuaca <kota>` atau `!weather <kota>` | Cek cuaca suatu kota | `!cuaca Jakarta` |
| `!search <keyword>` | Cari gambar | `!search kucing lucu` |
| `!translate <teks>` | Terjemahkan teks | `!translate Hello world` |

### 📋 Info & Lainnya
| Perintah | Deskripsi |
|----------|-----------|
| `!jadwal` | Lihat jadwal pelajaran |
| `!rules` | Lihat aturan bot |
| `!cek` atau `!ping` | Cek status bot |
| `!help`, `!cmd`, atau `!menu` | Tampilkan menu lengkap |
| `!groupinfo` | Info grup (hanya di grup) |

## 🏗️ Struktur Project (OOP)

```
Bot-WhatsApp/
├── bot.js                    # Main bot class
├── services/
│   ├── DownloaderService.js  # Service untuk download media
│   ├── StickerService.js     # Service untuk membuat stiker
│   ├── UtilityService.js     # Service untuk utility features
│   └── GroupService.js       # Service untuk fitur grup
├── temp/                     # Folder untuk file sementara
├── package.json
└── README.md
```

## ⚠️ Peraturan Penggunaan
- Jangan melakukan spam pada bot ❌
- Jangan melakukan panggilan suara/video ke bot 📵
- Gunakan perintah dengan format yang benar ✅
- Di grup, mention bot atau gunakan perintah yang diizinkan
- Jangan kirim konten tidak pantas 🚫

Jika aturan dilanggar, bot bisa otomatis keluar dari grup atau memblokir pengguna.

## 🔧 Teknologi yang Digunakan
- **Node.js** - Runtime environment
- **@open-wa/wa-automate** - WhatsApp automation library
- **Sharp** - Image processing untuk stiker
- **Axios** - HTTP client untuk API calls
- **ytdl-core** - YouTube downloader
- **Object-Oriented Programming** - Arsitektur berbasis class

## 📌 Catatan Penting
- Pastikan Anda memiliki Node.js versi terbaru (v14 atau lebih tinggi)
- Beberapa fitur downloader bergantung pada API pihak ketiga, sehingga bisa mengalami perubahan sewaktu-waktu
- Video YouTube yang terlalu besar (>50MB) tidak akan dikirim
- Untuk fitur cuaca dan pencarian gambar yang lebih baik, Anda bisa menambahkan API key sendiri di `UtilityService.js`

## 🛠️ Troubleshooting

### Masalah QR Code Tidak Muncul
```sh
# Hapus session lama
rm -rf .wwebjs_auth
# atau di Windows
rmdir /s .wwebjs_auth

# Jalankan kembali bot
node bot.js
```

### Masalah FFmpeg Tidak Ditemukan
Pastikan FFmpeg sudah terinstall di sistem Anda.

**Windows:**
```sh
choco install ffmpeg  # Menggunakan Chocolatey
# atau download dari https://ffmpeg.org/download.html
```

**Linux:**
```sh
sudo apt install ffmpeg
```

**macOS:**
```sh
brew install ffmpeg
```

### Bot Tidak Merespon di Grup
- Pastikan bot sudah di-mention, atau
- Gunakan perintah yang diizinkan tanpa mention (seperti `!tiktok`, `!yt`, dll)

### Error Download TikTok/Instagram
- Coba lagi dengan link yang berbeda
- Pastikan link valid dan tidak di-private
- Beberapa API mungkin sedang maintenance

## 🎯 Penggunaan di Grup

Bot ini dirancang untuk bisa digunakan di grup dengan dua cara:

1. **Dengan Mention Bot**: Semua perintah bisa digunakan dengan mention bot terlebih dahulu
   ```
   @Bot !help
   ```

2. **Tanpa Mention**: Perintah tertentu bisa digunakan langsung tanpa mention:
   - `!tiktok <link>`
   - `!yt <link>` / `!youtube <link>`
   - `!ig <link>` / `!instagram <link>`
   - `!stiker` (dengan caption)
   - `!quote`, `!joke`
   - `!cuaca <kota>`
   - `!help`, `!cmd`, `!menu`
   - `!cek`

## 📜 Lisensi
Proyek ini menggunakan lisensi MIT. Bebas digunakan dan dikembangkan lebih lanjut.

## 💡 Kontribusi
Jika ingin menambahkan fitur atau memperbaiki bug, silakan buat pull request atau diskusi di issues!

## 🔄 Changelog

### Version 2.0.0
- ✨ Refactor ke arsitektur OOP
- ✨ Tambah fitur YouTube downloader
- ✨ Tambah fitur Instagram downloader
- ✨ Tambah fitur quote generator
- ✨ Tambah fitur joke generator
- ✨ Tambah fitur cuaca
- ✨ Tambah fitur pencarian gambar
- ✨ Tambah fitur translator
- ✨ Perbaikan TikTok downloader dengan multiple API fallback
- ✨ Support penggunaan di grup tanpa mention untuk beberapa perintah
- 🐛 Perbaikan berbagai bug

---

📌 **Dibuat dengan ❤️ menggunakan OOP Architecture**
