const { decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

class StickerService {
    constructor() {
        this.tempDir = path.join(__dirname, "../temp");
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async createStickerFromImage(client, message, from) {
        try {
            await client.sendText(from, "⏳ Sedang mengonversi gambar ke stiker...");

            const mediaData = await decryptMedia(message);
            const outputPath = path.join(this.tempDir, `sticker_${Date.now()}.webp`);

            await sharp(mediaData)
                .resize(512, 512, { 
                    fit: "contain", 
                    background: { r: 0, g: 0, b: 0, alpha: 0 } 
                })
                .webp({ quality: 100 })
                .toFile(outputPath);

            // Baca file webp dan kirim sebagai base64, supaya tidak kena error "Unsupported protocol g:"
            const webpBuffer = fs.readFileSync(outputPath);
            const webpBase64 = webpBuffer.toString("base64");

            await client.sendImageAsSticker(from, `data:image/webp;base64,${webpBase64}`);
            fs.unlinkSync(outputPath);

            console.log("✅ Stiker berhasil dikirim!");
        } catch (error) {
            console.error("❌ Gagal mengonversi gambar ke stiker:", error);
            await client.sendText(
                from,
                "⚠️ Gagal mengubah gambar menjadi stiker.\n" +
                "Detail: " + (error && error.message ? error.message : "unknown error") + "\n" +
                "Pastikan:\n- Format gambar jpg/png/webp\n- Ukuran file tidak terlalu besar (< 5 MB)."
            );
        }
    }

    async createStickerFromVideo(client, message, from) {
        try {
            await client.sendText(from, "⏳ Sedang mengonversi video ke stiker...");

            const mediaData = await decryptMedia(message);
            const videoPath = path.join(this.tempDir, `video_${Date.now()}.mp4`);
            const webpPath = path.join(this.tempDir, `sticker_${Date.now()}.webp`);

            fs.writeFileSync(videoPath, mediaData);

            await sharp(videoPath, { animated: true })
                .resize(512, 512, { 
                    fit: "contain", 
                    background: { r: 0, g: 0, b: 0, alpha: 0 } 
                })
                .webp({ quality: 100 })
                .toFile(webpPath);

            const webpBuffer = fs.readFileSync(webpPath);
            const webpBase64 = webpBuffer.toString("base64");

            await client.sendImageAsSticker(from, `data:image/webp;base64,${webpBase64}`);
            
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);

            console.log("✅ Stiker video berhasil dikirim!");
        } catch (error) {
            console.error("❌ Gagal mengonversi video ke stiker:", error);
            await client.sendText(
                from,
                "⚠️ Terjadi kesalahan saat mengubah video menjadi stiker.\n" +
                "Detail: " + (error && error.message ? error.message : "unknown error") + "\n" +
                "Pastikan:\n- Durasi video < 10 detik\n- Ukuran file tidak terlalu besar."
            );
        }
    }
}

module.exports = StickerService;

