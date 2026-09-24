const { PermissionFlagsBits } = require('discord.js');

const kufurler = [
    'aq', 'amina', 'amk', 'orospu', 'sik', 'piç', 'oc', 'oç', 'ananı',
    'pic', 'anan', 'annen', 'yarram', 'döl', 'yarrak', 'mal', 'salak', 'amcık', 'göt'
];
const uyariVeritabani = new Map();

module.exports = (client) => {
    client.on('messageCreate', async message => {
        if (message.author.bot || !message.guild) return;

        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const content = message.content.toLowerCase();
        let kufurVarMi = kufurler.some(kufur => content.includes(kufur));
        const discordInvite = content.includes('discord.gg/') || content.includes('discord.com/invite/');
        const hasLink = content.includes('http://') || content.includes('https://') || content.includes('www.');

        if (kufurVarMi || discordInvite || hasLink) {
            try {
                await message.delete().catch(() => {});

                const userId = message.author.id;
                let mevcutUyari = uyariVeritabani.get(userId) || 0;
                mevcutUyari += 1;
                uyariVeritabani.set(userId, mevcutUyari);

                const ihlalTuru = kufurVarMi ? 'küfür etmek' : 'link/reklam paylaşmak';

                const hedefRolAdi = `U${mevcutUyari}`;
                const yeniRol = message.guild.roles.cache.find(r => r.name === hedefRolAdi);

                // --- 10. UYARI (ZAMAN AŞIMI VE TEMİZLİK) ---
                if (mevcutUyari >= 10) {
                    try {
                        await message.member.timeout(24 * 60 * 60 * 1000, '10 kez küfür/reklam sınırına ulaştı.');
                        uyariVeritabani.set(userId, 0);

                        for (let i = 1; i <= 10; i++) {
                            const eskiRol = message.guild.roles.cache.find(r => r.name === `U${i}`);
                            if (eskiRol && message.member.roles.cache.has(eskiRol.id)) {
                                await message.member.roles.remove(eskiRol).catch(() => {});
                            }
                        }

                        const muteUyari = await message.channel.send(`🚫 <@${userId}> üst üste 10 kez kural ihlali yaptığı için **1 gün süreyle** zaman aşımına uğratıldı ve uyarı rolleri sıfırlandı!`);
                        setTimeout(() => muteUyari.delete().catch(() => {}), 6000);
                        return;
                    } catch (err) {
                        console.error("Timeout veya rol silme hatası:", err);
                    }
                }

                // --- ÖNCEKİ U ROLÜNÜ SİL, YENİSİNİ EKLE ---
                if (yeniRol) {
                    for (let i = 1; i <= 10; i++) {
                        const eskiRol = message.guild.roles.cache.find(r => r.name === `U${i}`);
                        if (eskiRol && message.member.roles.cache.has(eskiRol.id)) {
                            await message.member.roles.remove(eskiRol).catch(() => {});
                        }
                    }
                    await message.member.roles.add(yeniRol).catch(err => console.error("Rol verilemedi:", err));
                } else {
                    console.log(`⚠️ Hata: "${hedefRolAdi}" adında bir rol sunucuda bulunamadı!`);
                }

                const uyari = await message.channel.send(`⚠️ <@${userId}>, bu sunucuda ${ihlalTuru} yasak! **Verilen Rol: U${mevcutUyari}/10**`);
                setTimeout(() => uyari.delete().catch(() => {}), 5000);
                return;

            } catch (err) {
                console.error("Engel sisteminde hata:", err);
            }
        }
    });
};