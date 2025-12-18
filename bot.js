const { create, decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");
const path = require("path");
const DownloaderService = require("./services/DownloaderService");
const StickerService = require("./services/StickerService");
const UtilityService = require("./services/UtilityService");
const GroupService = require("./services/GroupService");

class WhatsAppBot {
    constructor() {
        this.client = null;
        this.botNumber = null;
        this.downloaderService = new DownloaderService();
        this.stickerService = new StickerService();
        this.utilityService = new UtilityService();
        this.groupService = new GroupService();
        
        // Commands yang bisa digunakan tanpa mention di grup
        this.groupCommands = [
            "!tiktok", "!yt", "!youtube", "!ig", "!instagram",
            "!stiker", "!quote", "!joke", "!cuaca", "!weather",
            "!help", "!cmd", "!menu", "!cek"
        ];
    }

    async initialize() {
        try {
            console.log("🔄 Memulai inisialisasi bot dengan konfigurasi minimal...");

            // Konfigurasi MINIMAL sesuai rekomendasi @open-wa
            this.client = await create({
                sessionId: "whatsapp-bot",
                useChrome: true,
                headless: false,          // Biar kelihatan kalau ada error di browser
                qrTimeout: 0,             // Tidak timeout saat scan QR
                authTimeout: 0,           // Jangan batasi proses login
                blockCrashLogs: true,
                disableSpins: true,
                logConsole: true,
                popup: true,
                multiDevice: true,
                chromiumArgs: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
            });

            this.botNumber = await this.client.getHostNumber();
            await this.setupEventHandlers();
            console.log("✅ Bot WhatsApp Aktif!");
            console.log(`📱 Bot Number: ${this.botNumber}`);
        } catch (error) {
            console.error("❌ Error initializing bot:", error);
            console.error("💡 Cek juga: koneksi internet, apakah web.whatsapp.com bisa dibuka di browser biasa, dan apakah Chrome sudah terinstall.");
            process.exit(1);
        }
    }

    async setupEventHandlers() {
        this.client.onMessage(async (message) => {
            await this.handleMessage(message);
        });

        this.client.onStateChanged((state) => {
            console.log("📱 State changed:", state);
        });
    }

    async handleMessage(message) {
        const { body, type, mimetype, caption, from, isGroupMsg, mentionedJidList, chat } = message;
        
        // Cek apakah bot di-mention atau command yang diizinkan di grup
        const isBotMentioned = mentionedJidList?.includes(`${this.botNumber}@c.us`) || false;
        const command = this.extractCommand(body);
        const canUseInGroup = this.groupCommands.some(cmd => command.startsWith(cmd));

        // Jika di grup dan tidak di-mention dan bukan command yang diizinkan, skip
        if (isGroupMsg && !isBotMentioned && !canUseInGroup) {
            return;
        }

        try {
            // Handle text commands
            if (type === "chat" || type === "vcard") {
                await this.handleTextCommand(body, from, isGroupMsg);
            }
            
            // Handle media commands
            if (type === "image" && caption) {
                await this.handleMediaCommand(type, mimetype, caption, message, from);
            }
            
            if (type === "video" && caption) {
                await this.handleMediaCommand(type, mimetype, caption, message, from);
            }
        } catch (error) {
            console.error("❌ Error handling message:", error);
            await this.client.sendText(from, "⚠️ Terjadi kesalahan saat memproses perintah.");
        }
    }

    extractCommand(text) {
        if (!text) return "";
        const trimmed = text.trim();
        const spaceIndex = trimmed.indexOf(" ");
        return spaceIndex > 0 ? trimmed.substring(0, spaceIndex) : trimmed;
    }

    async handleTextCommand(body, from, isGroupMsg) {
        const command = body.toLowerCase().trim();
        const args = body.split(" ").slice(1).join(" ");

        switch (true) {
            case command === "!cek" || command === "!ping":
                await this.client.sendText(from, "👋 Hello! BOT AKTIF 🚀");
                break;

            case command === "!rules":
                await this.sendRules(from);
                break;

            case command === "!jadwal":
                await this.sendSchedule(from);
                break;

            case ["halo", "p", "hai", "hi", "hello"].includes(command):
                await this.client.sendText(from, "Halo! Apa yang bisa saya bantu? 😊\nKetik *!menu* untuk melihat daftar perintah");
                break;

            case command === "!help" || command === "!cmd" || command === "!menu":
                await this.sendHelpMenu(from);
                break;

            case command.startsWith("!tiktok "):
                await this.downloaderService.downloadTikTok(this.client, from, args);
                break;

            case command.startsWith("!yt ") || command.startsWith("!youtube "):
                await this.downloaderService.downloadYouTube(this.client, from, args);
                break;

            case command.startsWith("!ig ") || command.startsWith("!instagram "):
                await this.downloaderService.downloadInstagram(this.client, from, args);
                break;

            case command === "!quote":
                await this.utilityService.sendQuote(this.client, from);
                break;

            case command === "!joke":
                await this.utilityService.sendJoke(this.client, from);
                break;

            case command.startsWith("!cuaca ") || command.startsWith("!weather "):
                await this.utilityService.sendWeather(this.client, from, args);
                break;

            case command.startsWith("!search "):
                await this.utilityService.searchImage(this.client, from, args);
                break;

            case command.startsWith("!translate "):
                await this.utilityService.translateText(this.client, from, args);
                break;

            case isGroupMsg && command.startsWith("!groupinfo"):
                await this.groupService.sendGroupInfo(this.client, from, message.chat);
                break;

            default:
                // Tidak perlu respon untuk command yang tidak dikenal
                break;
        }
    }

    async handleMediaCommand(type, mimetype, caption, message, from) {
        const captionLower = caption.toLowerCase().trim();

        if (captionLower === "!stiker" || captionLower === "!sticker") {
            if (type === "image" && mimetype.includes("image")) {
                await this.stickerService.createStickerFromImage(this.client, message, from);
            } else if (type === "video" && (mimetype.includes("gif") || mimetype.includes("video"))) {
                await this.stickerService.createStickerFromVideo(this.client, message, from);
            }
        }
    }

    async sendRules(from) {
        const rules = `⚠️ *Rules Bot:*
- Jangan spam bot ❌
- Jangan telpon bot 📵 (auto block)
- Gunakan perintah dengan format yang benar ✅
- Di grup, mention bot atau gunakan perintah yang diizinkan
- Jangan kirim konten tidak pantas 🚫

Melanggar = bot keluar 🚪`;
        await this.client.sendText(from, rules);
    }

    async sendSchedule(from) {
        const schedule = `✨ *JADWAL Pelajaran* ✨
📌 *Senin:* PIC / PCC
📌 *Selasa:* PCC / PIC
📌 *Rabu:* Jarkom, PAI, B.Inggris, PP
📌 *Kamis:* Matematika, Sejarah, PKK, PJOK
📌 *Jumat:* B.Indo, BK, B.Inggris
----------------------------------------------`;
        await this.client.sendText(from, schedule);
    }

    async sendHelpMenu(from) {
        const menu = `📌 *DAFTAR PERINTAH BOT*

🎬 *Downloader:*
• *!tiktok <link>* - Download video TikTok tanpa watermark
• *!yt <link>* atau *!youtube <link>* - Download video YouTube
• *!ig <link>* atau *!instagram <link>* - Download foto/video Instagram

🎨 *Sticker:*
• *!stiker* - Kirim gambar/video dengan caption !stiker

📝 *Utility:*
• *!quote* - Dapatkan quote inspiratif
• *!joke* - Dapatkan joke lucu
• *!cuaca <kota>* - Cek cuaca suatu kota
• *!search <keyword>* - Cari gambar
• *!translate <teks>* - Terjemahkan teks

📋 *Info:*
• *!jadwal* - Lihat jadwal pelajaran
• *!rules* - Lihat aturan bot
• *!cek* - Cek status bot
• *!menu* - Tampilkan menu ini

💬 *Grup:*
• Di grup, mention bot atau gunakan perintah yang diizinkan
• *!groupinfo* - Info grup (hanya di grup)

━━━━━━━━━━━━━━━━━━━━
Bot WhatsApp Multi-Feature 🤖`;
        await this.client.sendText(from, menu);
    }
}

// Start bot
const bot = new WhatsAppBot();
bot.initialize();
