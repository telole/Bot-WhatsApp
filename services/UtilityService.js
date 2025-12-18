const axios = require("axios");

class UtilityService {
    async sendQuote(client, from) {
        try {
            const response = await axios.get("https://api.quotable.io/random");
            const quote = response.data;
            
            const message = `💬 *Quote Inspiratif*\n\n"${quote.content}"\n\n— ${quote.author}`;
            await client.sendText(from, message);
        } catch (error) {
            console.error("Error getting quote:", error);
            const fallbackQuotes = [
                "Hidup adalah perjalanan, bukan tujuan.",
                "Kesuksesan adalah perjalanan, bukan tujuan.",
                "Jangan menyerah, karena kamu tidak tahu apa yang menanti di depan."
            ];
            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            await client.sendText(from, `💬 *Quote Inspiratif*\n\n"${randomQuote}"`);
        }
    }

    async sendJoke(client, from) {
        try {
            const response = await axios.get("https://v2.jokeapi.dev/joke/Any?lang=id&type=single");
            const joke = response.data;
            
            if (joke.joke) {
                await client.sendText(from, `😄 *Joke Lucu*\n\n${joke.joke}`);
            } else {
                await this.sendFallbackJoke(client, from);
            }
        } catch (error) {
            console.error("Error getting joke:", error);
            await this.sendFallbackJoke(client, from);
        }
    }

    async sendFallbackJoke(client, from) {
        const jokes = [
            "Kenapa ayam tidak bisa terbang?\nKarena sayapnya cuma dua, bukan empat! 😂",
            "Apa bedanya hujan sama presiden?\nHujan turun, presiden naik! 😄",
            "Kenapa programmer susah tidur?\nKarena ada bug di kode mereka! 😴"
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await client.sendText(from, `😄 *Joke Lucu*\n\n${randomJoke}`);
    }

    async sendWeather(client, from, city) {
        if (!city) {
            await client.sendText(from, "⚠️ Mohon sertakan nama kota!\nContoh: !cuaca Jakarta");
            return;
        }

        try {
            const response = await axios.get(
                `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=id`,
                { timeout: 10000 }
            );

            const weather = response.data;
            const current = weather.current_condition[0];
            const location = weather.nearest_area[0];

            const temp = current.temp_C;
            const feelsLike = current.FeelsLikeC;
            const description = current.lang_id ? current.lang_id[0].value : current.weatherDesc[0].value;
            const humidity = current.humidity;
            const windSpeed = current.windspeedKmph;

            const message = `🌤️ *Cuaca di ${location.areaName[0].value}*\n\n` +
                `🌡️ Suhu: ${temp}°C\n` +
                `🌡️ Terasa: ${feelsLike}°C\n` +
                `☁️ Kondisi: ${description}\n` +
                `💧 Kelembaban: ${humidity}%\n` +
                `💨 Angin: ${windSpeed} km/h`;

            await client.sendText(from, message);
        } catch (error) {
            console.error("Error getting weather:", error);
            await client.sendText(from, `⚠️ Tidak dapat menemukan cuaca untuk kota "${city}".\nPastikan nama kota benar atau coba lagi nanti.`);
        }
    }

    async searchImage(client, from, keyword) {
        if (!keyword) {
            await client.sendText(from, "⚠️ Mohon sertakan keyword pencarian!\nContoh: !search kucing lucu");
            return;
        }

        try {
            // Using Picsum Photos (free, no API key needed) as fallback
            // For production, use Unsplash API with your own key
            const imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
            
            await client.sendImage(from, imageUrl, "search.jpg", `📷 Hasil pencarian: ${keyword}\n\n💡 *Note:* Fitur ini menggunakan gambar random. Untuk hasil yang lebih baik, gunakan Unsplash API dengan API key.`);
        } catch (error) {
            console.error("Error searching image:", error);
            await client.sendText(from, "⚠️ Terjadi kesalahan saat mencari gambar.");
        }
    }

    async translateText(client, from, text) {
        if (!text) {
            await client.sendText(from, "⚠️ Mohon sertakan teks yang ingin diterjemahkan!\nContoh: !translate Hello world");
            return;
        }

        try {
            // Using Google Translate API (free alternative)
            const response = await axios.get(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(text)}`
            );

            const translated = response.data[0][0][0];
            const sourceLang = response.data[2];

            await client.sendText(from, `🌐 *Terjemahan*\n\n` +
                `📝 Asal (${sourceLang}): ${text}\n\n` +
                `🇮🇩 Indonesia: ${translated}`);
        } catch (error) {
            console.error("Error translating:", error);
            await client.sendText(from, "⚠️ Terjadi kesalahan saat menerjemahkan teks.");
        }
    }
}

module.exports = UtilityService;

