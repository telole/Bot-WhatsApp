const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");

class DownloaderService {
    constructor() {
        this.tempDir = path.join(__dirname, "../temp");
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async downloadTikTok(client, from, url) {
        if (!url || !url.includes("tiktok.com")) {
            await client.sendText(from, "⚠️ Mohon kirimkan tautan TikTok yang valid!\nContoh: !tiktok https://vm.tiktok.com/xxxxx");
            return;
        }

        try {
            await client.sendText(from, "⏳ Mengunduh video dari TikTok...");
            console.log("[TIKTOK] Request URL:", url);

            // Gunakan API tikwm.com yang relatif stabil
            let videoUrl = null;

            try {
                const resp = await axios.post(
                    "https://www.tikwm.com/api/",
                    new URLSearchParams({
                        url,
                        count: 12,
                        cursor: 0,
                        web: 1,
                        hd: 1
                    }),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                        timeout: 15000
                    }
                );

                console.log("[TIKTOK] API response status:", resp.status);
                console.log("[TIKTOK] API response data (trimmed):", {
                    code: resp.data?.code,
                    msg: resp.data?.msg,
                    hasData: !!resp.data?.data
                });

                if (resp.data && resp.data.data && resp.data.data.play) {
                    // API mengembalikan path relatif, tambahkan host
                    videoUrl = resp.data.data.play.startsWith("http")
                        ? resp.data.data.play
                        : `https://www.tikwm.com${resp.data.data.play}`;
                    console.log("[TIKTOK] Final video URL:", videoUrl);
                }
            } catch (e) {
                console.error("[TIKTOK] TikWM API error:", e.response?.data || e.message);
            }

            if (videoUrl) {
                const videoPath = path.join(this.tempDir, `tiktok_${Date.now()}.mp4`);
                const writer = fs.createWriteStream(videoPath);
                
                const videoResponse = await axios({
                    url: videoUrl,
                    method: "GET",
                    responseType: "stream",
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Referer': 'https://www.tiktok.com/'
                    }
                });

                videoResponse.data.pipe(writer);

                writer.on("finish", async () => {
                    try {
                        await client.sendFile(from, videoPath, "tiktok.mp4", "🎥 Video TikTok berhasil diunduh!");
                        fs.unlinkSync(videoPath);
                    } catch (error) {
                        console.error("Error sending file:", error);
                        await client.sendText(from, "⚠️ Video terlalu besar untuk dikirim. Coba lagi nanti.");
                        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                    }
                });

                writer.on("error", async (error) => {
                    console.error("Error downloading:", error);
                    await client.sendText(from, "❌ Gagal mengunduh video TikTok.");
                    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                });
            } else {
                console.warn("[TIKTOK] videoUrl kosong. Tidak ada URL video yang bisa diunduh.");
                await client.sendText(
                    from,
                    "❌ Gagal mengambil video TikTok.\n" +
                    "Kemungkinan penyebab:\n" +
                    "- Link tidak didukung API saat ini\n" +
                    "- Video private / region-locked\n" +
                    "- API TikTok downloader lagi down.\n\n" +
                    "Coba pakai link lain atau coba beberapa menit lagi."
                );
            }
        } catch (error) {
            console.error("❌ Error downloading TikTok (outer catch):", error);
            await client.sendText(
                from,
                "⚠️ Terjadi kesalahan internal saat mengunduh video TikTok.\n" +
                "Detail (untuk developer, cek console.log di server)."
            );
        }
    }

    extractTikTokId(url) {
        const match = url.match(/video\/(\d+)/);
        return match ? match[1] : null;
    }

    async downloadYouTube(client, from, url) {
        if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
            await client.sendText(from, "⚠️ Mohon kirimkan tautan YouTube yang valid!\nContoh: !yt https://youtube.com/watch?v=xxxxx");
            return;
        }

        try {
            await client.sendText(from, "⏳ Mengunduh video dari YouTube...");

            if (!ytdl.validateURL(url)) {
                await client.sendText(from, "❌ URL YouTube tidak valid!");
                return;
            }

            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
            const videoPath = path.join(this.tempDir, `youtube_${Date.now()}.mp4`);

            const video = ytdl(url, {
                quality: "lowestvideo",
                filter: "videoandaudio"
            });

            const writer = fs.createWriteStream(videoPath);
            video.pipe(writer);

            writer.on("finish", async () => {
                try {
                    const stats = fs.statSync(videoPath);
                    const fileSizeInMB = stats.size / (1024 * 1024);

                    if (fileSizeInMB > 50) {
                        await client.sendText(from, `⚠️ Video terlalu besar (${fileSizeInMB.toFixed(2)} MB). Maksimal 50MB.`);
                        fs.unlinkSync(videoPath);
                        return;
                    }

                    await client.sendFile(from, videoPath, `${title}.mp4`, `🎥 ${info.videoDetails.title}\n👁️ Views: ${info.videoDetails.viewCount}`);
                    fs.unlinkSync(videoPath);
                } catch (error) {
                    console.error("Error sending file:", error);
                    await client.sendText(from, "⚠️ Video terlalu besar untuk dikirim.");
                    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                }
            });

            writer.on("error", async (error) => {
                console.error("Error downloading:", error);
                await client.sendText(from, "❌ Gagal mengunduh video YouTube.");
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });
        } catch (error) {
            console.error("❌ Error downloading YouTube:", error);
            await client.sendText(from, "⚠️ Terjadi kesalahan saat mengunduh video YouTube.\nPastikan video tidak di-private atau di-restrict.");
        }
    }

    async downloadInstagram(client, from, url) {
        if (!url || !url.includes("instagram.com")) {
            await client.sendText(from, "⚠️ Mohon kirimkan tautan Instagram yang valid!\nContoh: !ig https://instagram.com/p/xxxxx");
            return;
        }

        try {
            await client.sendText(from, "⏳ Mengunduh media dari Instagram...");

            // Use instagram downloader API
            const response = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
                params: {
                    q: url,
                    t: "media",
                    lang: "id"
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            if (response.data && response.data.medias) {
                const media = response.data.medias[0];
                const mediaUrl = media.url;
                const isVideo = media.type === "video";
                const ext = isVideo ? "mp4" : "jpg";
                const mediaPath = path.join(this.tempDir, `instagram_${Date.now()}.${ext}`);

                const mediaResponse = await axios({
                    url: mediaUrl,
                    method: "GET",
                    responseType: "stream",
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });

                const writer = fs.createWriteStream(mediaPath);
                mediaResponse.data.pipe(writer);

                writer.on("finish", async () => {
                    try {
                        if (isVideo) {
                            await client.sendFile(from, mediaPath, "instagram.mp4", "📹 Video Instagram berhasil diunduh!");
                        } else {
                            await client.sendImage(from, mediaPath, "instagram.jpg", "📷 Foto Instagram berhasil diunduh!");
                        }
                        fs.unlinkSync(mediaPath);
                    } catch (error) {
                        console.error("Error sending file:", error);
                        await client.sendText(from, "⚠️ Media terlalu besar untuk dikirim.");
                        if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
                    }
                });
            } else {
                await client.sendText(from, "❌ Gagal mengambil media Instagram. Coba lagi!");
            }
        } catch (error) {
            console.error("❌ Error downloading Instagram:", error);
            await client.sendText(from, "⚠️ Terjadi kesalahan saat mengunduh media Instagram.\nPastikan post tidak di-private.");
        }
    }
}

module.exports = DownloaderService;

