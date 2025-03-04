const { create, decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");
const sharp = require("sharp");
const axios = require("axios");
const path = require("path");
const { exec } = require("child_process");

create().then((client) => start(client));

async function start(client) {
    console.log("✅ Bot WhatsApp Aktif!");

    client.onMessage(async (message) => {
        const { body, type, mimetype, caption, from, isGroupMsg, mentionedJidList } = message;
        const botNumber = await client.getHostNumber(); 
        const isBotMentioned = mentionedJidList?.includes(`${botNumber}@c.us`) || false;

        if (isGroupMsg && !isBotMentioned) {
            return;
        }

        if (body === "!cek") {
            client.sendText(from, "👋 Hello! BOT AKTIF 🚀");
        } 
        
        else if (body === "!rules") {
            client.sendText(from, `⚠️ Rules Bot:
- Jangan spam bot ❌
- Jangan telpon bot 📵 (auto block)
- Gunakan perintah dengan format yang benar ✅
            
Melanggar = bot keluar 🚪`);
        } 
        
        else if (body === "!jadwal") {
            client.sendText(from, `
✨--JADWAL Pelajaran--✨
📌 Senin: PIC / PCC
📌 Selasa: PCC / PIC
📌 Rabu: Jarkom, PAI, B.Inggris, PP
📌 Kamis: Matematika, Sejarah, PKK, PJOK
📌 Jumat: B.Indo, BK, B.Inggris
----------------------------------------------`);
        } 
        
        else if (["halo", "p", "hai", "hi"].includes(body.toLowerCase())) {
            client.sendText(from, "Halo! Apa yang bisa saya bantu? 😊, *!cmd* untuk melihat menu");
        }

        else if (type === "image" && mimetype.includes("image") && caption === "!stiker") {
            try {
                await client.sendText(from, "⏳ Sedang mengonversi gambar ke stiker...");

                const mediaData = await decryptMedia(message);
                const outputPath = "./sticker.webp";

                await sharp(mediaData)
                    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }) 
                    .webp()
                    .toFile(outputPath);

                await client.sendImageAsSticker(from, outputPath);
                fs.unlinkSync(outputPath);

                console.log("✅ Stiker berhasil dikirim!");
            } catch (error) {
                console.error("❌ Gagal mengonversi gambar ke stiker:", error);
                await client.sendText(from, "⚠️ Gagal mengubah gambar menjadi stiker.");
            }
        }  
        
        else if (type === "video" && mimetype.includes("gif") && caption === "!stiker") {
            try {
                await client.sendText(from, "⏳ Sedang mengonversi video ke stiker...");

                const mediaData = await decryptMedia(message);
                const gifPath = "./sticker.gif";
                const webpPath = "./sticker.webp";

                fs.writeFileSync(gifPath, mediaData);

                const encoder = new GIFEncoder(512, 512);
                const canvas = createCanvas(512, 512);
                const ctx = canvas.getContext("2d");

                encoder.start();
                encoder.setRepeat(0);
                encoder.setDelay(100);
                encoder.setQuality(10);

                const frames = [gifPath]; 
                for (const frame of frames) {
                    const image = await loadImage(frame);
                    ctx.clearRect(0, 0, 512, 512);
                    ctx.drawImage(image, 0, 0, 512, 512);
                    encoder.addFrame(ctx);
                }

                encoder.finish();
                fs.writeFileSync(gifPath, encoder.out.getData());

                await sharp(gifPath)
                    .webp()
                    .toFile(webpPath);

                await client.sendImageAsSticker(from, webpPath);
                fs.unlinkSync(gifPath);
                fs.unlinkSync(webpPath);

                console.log("✅ Stiker video berhasil dikirim!");
            } catch (error) {
                console.error("❌ Gagal mengonversi video ke stiker:", error);
                await client.sendText(from, "⚠️ Terjadi kesalahan saat mengubah video menjadi stiker.");
            }
        }
        
        
        else if (body === "!help" || body === "!cmd") {
            client.sendText(from, `📌 *Daftar Perintah:*
- *!stiker* : Kirim gambar/GIF dengan caption *!stiker* untuk membuat stiker
- *!jadwal* : Melihat jadwal XI TJKT 1
- *!rules*  : Untuk melihat peraturan
- *p, hi, halo* : Respon bot
- *!cek* : Cek bot apakah aktif atau tidak
- *!tiktok <link>* : Download video TikTok tanpa watermark`);
        } 
        
        else if (body.startsWith("!tiktok ")) {
            const url = body.split(" ")[1];
            if (!url || !url.includes("tiktok.com")) {
                client.sendText(from, "⚠️ Mohon kirimkan tautan TikTok yang valid!");
                return;
            }


            try {
                await client.sendText(from, "⏳ Mengunduh video dari TikTok...");
        
                const apiUrl = `https://ssstik.io/abc123/download?url=${encodeURIComponent(url)}`;
                const response = await axios.get(apiUrl);
        
                if (response.data && response.data.data && response.data.data.url) {
                    const videoUrl = response.data.data.url;
                    const videoPath = path.join(__dirname, "tiktok.mp4");
        
                    const videoResponse = await axios({
                        url: videoUrl,
                        method: "GET",
                        responseType: "stream",
                    });
        
                    const writer = fs.createWriteStream(videoPath);
                    videoResponse.data.pipe(writer);
        
                    writer.on("finish", async () => {
                        await client.sendFile(from, videoPath, "tiktok.mp4", "🎥 Video TikTok berhasil diunduh!");
                        fs.unlinkSync(videoPath);
                    });
                } else {
                    client.sendText(from, "❌ Gagal mengambil video TikTok. Coba lagi!");
                }
            } catch (error) {
                console.error("❌ Gagal mengunduh video TikTok:", error);
                client.sendText(from, "⚠️ Terjadi kesalahan saat mengunduh video TikTok.");
            }
        }
    });
}
