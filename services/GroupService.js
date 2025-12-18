class GroupService {
    async sendGroupInfo(client, from, chat) {
        try {
            const chatInfo = await client.getChatById(from);
            const groupMetadata = chatInfo.groupMetadata || {};
            const participants = groupMetadata.participants || [];
            
            const message = `📋 *Info Grup*\n\n` +
                `👥 Nama: ${chatInfo.name || chat.name || "Tidak diketahui"}\n` +
                `👤 Anggota: ${participants.length}\n` +
                `📝 Deskripsi: ${groupMetadata.desc || "Tidak ada"}`;

            await client.sendText(from, message);
        } catch (error) {
            console.error("Error getting group info:", error);
            await client.sendText(from, "⚠️ Tidak dapat mengambil info grup.");
        }
    }
}

module.exports = GroupService;

