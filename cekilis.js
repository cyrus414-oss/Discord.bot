const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        // Komut: c!çekilişbaşlat Ödül Süre KazananSayısı (Örn: c!çekilişbaşlat VIP Üyelik 1m 1)
        if (message.content.startsWith('c!çekilişbaşlat') || message.content.startsWith('c!cekilisbaslat')) {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const uyari = await message.reply('❌ Bu komutu sadece yetkililer kullanabilir!');
                setTimeout(() => { uyari.delete().catch(() => {}); message.delete().catch(() => {}); }, 2000);
                return;
            }

            // Örnek girdi: c!çekilişbaşlat VIP Üyelik 1m 1
            // Boşluklara göre böldüğümüzde: ['c!çekilişbaşlat', 'VIP', 'Üyelik', '1m', '1']
            const parts = message.content.trim().split(/\s+/);
            
            if (parts.length < 4) {
                const hata = await message.reply('❌ Hatalı kullanım! Örnek: `c!çekilişbaşlat VIP Üyelik 1m 1` (Süreler: s, m, h, d)');
                setTimeout(() => { hata.delete().catch(() => {}); message.delete().catch(() => {}); }, 4000);
                return;
            }

            const winnerCount = parseInt(parts[parts.length - 1]);
            const durationStr = parts[parts.length - 2];
            // Ödül adı aradaki kelimeleri birleştirerek alınır
            const prize = parts.slice(1, parts.length - 2).join(' ');

            if (isNaN(winnerCount)) {
                const hata = await message.reply('❌ Kazanan kişi sayısı bir sayı olmalıdır! Örnek: `c!çekilişbaşlat VIP Üyelik 1m 1`');
                setTimeout(() => { hata.delete().catch(() => {}); message.delete().catch(() => {}); }, 4000);
                return;
            }

            const multiplier = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
            const unit = durationStr.slice(-1);
            const value = parseInt(durationStr.slice(0, -1));

            if (!multiplier[unit] || isNaN(value)) {
                const hata = await message.reply('❌ Geçersiz süre formatı! Örnek: `30s` (saniye), `5m` (dakika), `1h` (saat)');
                setTimeout(() => { hata.delete().catch(() => {}); message.delete().catch(() => {}); }, 4000);
                return;
            }

            const durationMs = value * multiplier[unit];
            const endsAt = Date.now() + durationMs;
            const endsTimestamp = Math.floor(endsAt / 1000);
            const participants = new Set();

            const createEmbed = (count) => {
                return new EmbedBuilder()
                    .setTitle('🎉 ÇEKİLİŞ BAŞLADI! 🎉')
                    .setDescription(
                        `🎁 **Ödül:** \`${prize}\`\n` +
                        `👑 **Kazanan Sayısı:** \`${winnerCount}\`\n` +
                        `👥 **Katılan Kişi:** \`${count}\`\n` +
                        `⏳ **Bitiş Süresi:** <t:${endsTimestamp}:R> (<t:${endsTimestamp}:F>)\n\n` +
                        `Katılmak için aşağıdaki **🎉 Katıl** butonuna bas!`
                    )
                    .setColor('#5865F2')
                    .setFooter({ text: `Düzenleyen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp(endsAt);
            };

            await message.delete().catch(() => {});
            const giveawayMsg = await message.channel.send({ 
                embeds: [createEmbed(0)], 
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('giveaway_join')
                            .setLabel('Katıl (0)')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🎉')
                    )
                ] 
            });

            const collector = giveawayMsg.createMessageComponentCollector({ time: durationMs });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'giveaway_join') {
                    if (participants.has(interaction.user.id)) {
                        participants.delete(interaction.user.id);
                        
                        const updatedRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('giveaway_join')
                                .setLabel(`Katıl (${participants.size})`)
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('🎉')
                        );
                        
                        await interaction.update({ 
                            embeds: [createEmbed(participants.size)], 
                            components: [updatedRow] 
                        }).catch(() => {});
                        
                        const rep = await interaction.followUp({ content: '❌ Çekilişten başarıyla ayrıldın!', ephemeral: true });
                        setTimeout(() => rep.delete().catch(() => {}), 2000);
                    } else {
                        participants.add(interaction.user.id);

                        const updatedRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('giveaway_join')
                                .setLabel(`Katıl (${participants.size})`)
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('🎉')
                        );

                        await interaction.update({ 
                            embeds: [createEmbed(participants.size)], 
                            components: [updatedRow] 
                        }).catch(() => {});

                        const rep = await interaction.followUp({ content: '✅ Çekilişe başarıyla katıldın! Bol şans 🍀', ephemeral: true });
                        setTimeout(() => rep.delete().catch(() => {}), 2000);
                    }
                }
            });

            collector.on('end', async () => {
                const participantsArray = Array.from(participants);
                const endedEmbed = createEmbed(participantsArray.length);

                if (participantsArray.length === 0) {
                    endedEmbed.setTitle('🎉 ÇEKİLİŞ SONLANDI (Katılımcı Olmadı)')
                        .setDescription(`🎁 **Ödül:** \`${prize}\`\n👥 **Katılan Kişi:** \`0\`\n❌ Yeterli katılım olmadığı için kazanan seçilemedi.`);
                    
                    const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('giveaway_join').setLabel('Çekiliş Bitti').setStyle(ButtonStyle.Secondary).setDisabled(true).setEmoji('🔒')
                    );
                    return giveawayMsg.edit({ embeds: [endedEmbed], components: [disabledRow] }).catch(() => {});
                }

                const winners = [];
                const count = Math.min(winnerCount, participantsArray.length);
                for (let i = 0; i < count; i++) {
                    const randomIndex = Math.floor(Math.random() * participantsArray.length);
                    winners.push(participantsArray.splice(randomIndex, 1)[0]);
                }

                const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

                endedEmbed.setTitle('🎉 ÇEKİLİŞ SONLANDI 🎉')
                    .setDescription(
                        `🎁 **Ödül:** \`${prize}\`\n` +
                        `👥 **Toplam Katılımcı:** \`${participants.size}\`\n` +
                        `🏆 **Kazanan(lar):** ${winnerMentions}\n\n` +
                        `Tebrikler! 🎉`
                    )
                    .setColor('#FFD700');

                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('giveaway_join').setLabel('Çekiliş Sona Erdi').setStyle(ButtonStyle.Secondary).setDisabled(true).setEmoji('🔒')
                );

                await giveawayMsg.edit({ embeds: [endedEmbed], components: [disabledRow] }).catch(() => {});
                await giveawayMsg.reply(`🎊 Tebrikler ${winnerMentions}! **${prize}** ödülünü kazandınız!`);
            });
        }
    });
};