const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        // Kullanım: c!oylama Sunucu Açılsınmı | 1️⃣ Açılsın | 2️⃣ Açılmasın
        if (message.content.startsWith('c!oylama')) {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const uyari = await message.reply('❌ Bu komutu sadece yetkililer kullanabilir!');
                setTimeout(() => { uyari.delete().catch(() => {}); message.delete().catch(() => {}); }, 2000);
                return;
            }

            const args = message.content.slice(8).trim();
            if (!args) {
                const hata = await message.reply('❌ Hatalı kullanım! Örnek: `c!oylama Soru | 1️⃣ Seçenek 1 | 2️⃣ Seçenek 2`');
                setTimeout(() => { hata.delete().catch(() => {}); message.delete().catch(() => {}); }, 4000);
                return;
            }

            let parts = args.split('|').map(p => p.trim());
            let baslik = parts[0];
            let secenekler = parts.slice(1);

            if (secenekler.length === 0) {
                const hata = await message.reply('❌ Lütfen en az bir seçenek belirt!');
                setTimeout(() => { hata.delete().catch(() => {}); message.delete().catch(() => {}); }, 4000);
                return;
            }

            let descriptionText = `> **${baslik}**\n\n`;
            let foundEmojis = [];

            for (let secenek of secenekler) {
                descriptionText += `${secenek}\n`;

                // Sayı emojileri (1️⃣ vb.), özel Discord emojileri ve standart emojileri eksiksiz yakalayan güncel regex
                const emojiMatch = secenek.match(/(<a?:[a-zA-Z0-9_]+:[0-9]+>|\p{Extended_Pictographic}\uFE0F?[\u20E3]?|[#*0-9]\u20E3)/gu);
                
                if (emojiMatch) {
                    foundEmojis.push(...emojiMatch);
                }
            }

            descriptionText += `\nFikrini belirtmek için aşağıdaki emojilere tıklayabilirsin! 👇`;

            const embed = new EmbedBuilder()
                .setTitle('📊 CRAFTINGNW OYLAMA SİSTEMİ')
                .setDescription(descriptionText)
                .setColor('#5865F2')
                .setFooter({ text: `Oylamayı Başlatan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await message.delete().catch(() => {});
            const oylamaMesaji = await message.channel.send({ embeds: [embed] });

            // Bulunan tüm emojileri sırasıyla mesaja reaksiyon olarak ekliyoruz
            for (const emoji of foundEmojis) {
                await oylamaMesaji.react(emoji).catch(() => {});
            }
        }
    });
};