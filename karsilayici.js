const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    // --- GİRİŞ MESAJI ---
    client.on('guildMemberAdd', async member => {
        const channelID = '1542414539029745754';
        const channel = member.guild.channels.cache.get(channelID);
        if (!channel) return;

        const createdAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setColor('#5df258')
            .setAuthor({ 
                name: 'Yeni Bir Macera Başlıyor!', 
                iconURL: member.guild.iconURL({ dynamic: true }) 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `✨ **Hey <@${member.id}>, aramızda yerini aldın!**\n\n` +
                `> CraftingNW evrenine hoş geldin. Kılıcını kuşan ve maceraya başla!\n` +
                `> Kurallara göz atmayı ve ortamın tadını çıkarmayı unutma. 🚀\n\n` +
                `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                ` 📌 **Kullanıcı:** \`${member.user.tag}\`\n` +
                ` 🆔 **ID:** \`${member.id}\`\n` +
                ` ⏳ **Kayıt Tarihi:** ${createdAt}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `🔥 **Toplam Ailemiz:** \`${member.guild.memberCount}\` kişiye ulaştık!`
            )
            .setImage('https://r.resimlink.com/sEybaPe4qoQ.jpg')
            .setFooter({ 
                text: 'CraftingNW • Güvenli Giriş Sistemi',
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        channel.send({
            content: `🎉 Aramıza katıldın <@${member.id}>, keyifli oyunlar!`,
            embeds: [embed]
        });
    });

    // --- ÇIKIŞ MESAJI ---
    client.on('guildMemberRemove', async member => {
        const channelID = '1542414539029745754';
        const channel = member.guild.channels.cache.get(channelID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setAuthor({ 
                name: 'Aramızdan Biri Ayrıldı', 
                iconURL: member.guild.iconURL({ dynamic: true }) 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `😢 **<@${member.id}> (${member.user.tag}) aramızdan ayrıldı.**\n\n` +
                `> Yolun açık olsun! Seni tekrar aramızda görmeyi umuyoruz. ⚔️\n\n` +
                `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                ` 📌 **Kullanıcı:** \`${member.user.tag}\`\n` +
                ` 🆔 **ID:** \`${member.id}\`\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `📉 **Güncel Ailemiz:** \`${member.guild.memberCount}\` kişi kaldı.`
            )
            .setFooter({ 
                text: 'CraftingNW • Çıkış Sistemi',
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    });
};