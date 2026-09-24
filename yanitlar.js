const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        const args = message.content.trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const content = message.content.toLowerCase();

        // 1. !ip komutu
        if (content === '!ip') {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ 
                    name: 'CraftingNW Sunucu Bilgileri', 
                    iconURL: 'https://r.resimlink.com/PJoH71ThC.png' 
                })
                .setDescription(`📍 **Sunucu IP**\n\`play.craftingnw.com\`\n\n` +
                                `🌐 **Desteklenen Sürümler**\n\`1.8 - 1.21\`\n\n` +
                                `🌐 **Web Site**\nBakımda 🚧`)
                .setThumbnail('https://r.resimlink.com/PJoH71ThC.png')
                .setFooter({ 
                    text: 'CraftingNW Network • Türkiye\'nin En İyi Minecraft Sunucusu', 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                });

            await message.reply({ 
                content: 'Hemen bağlan ve maceraya katıl! 🚀', 
                embeds: [embed] 
            });
        }

        // 2. "sa" yazınca cevap verme
        if (content === 'sa') {
            message.reply('Aleykümselam, hoş geldin! 👋');
        }

        // 3. "selamun aleyküm" yazınca cevap verme
        if (content === 'selamun aleyküm' || content === 'selamunaleykum') {
            message.reply('Aleykümselam, hoş geldin! Nasılsın? 😊');
        }

        // 4. c!ban <@kullanıcı> <sebep>
        if (command === 'c!ban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply('❌ Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine sahip olmalısın!');
            }

            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Lütfen banlanacak üyeyi etiketle! Örnek: `c!ban @kullanici Küfür`');

            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
            const member = message.guild.members.cache.get(user.id);

            if (!member.bannable) return message.reply('❌ Bu kullanıcıyı banlayamam, yetkim yetmiyor veya benden üst bir rolde.');

            try {
                await member.ban({ reason: reason });
                message.channel.send(`✅ **${user.tag}** sunucudan yasaklandı! | **Sebep:** ${reason}`);
            } catch (err) {
                message.reply('❌ Kullanıcı banlanırken bir hata oluştu.');
            }
        }

        // 5. c!unban <kullaniciAdi> <sebep>
        if (command === 'c!unban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply('❌ Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine sahip olmalısın!');
            }

            const targetName = args[0];
            if (!targetName) return message.reply('❌ Lütfen yasağı kaldırılacak kullanıcının adını yaz! Örnek: `c!unban cyrussyan_56670 Hatalı ban`');

            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';

            try {
                const banList = await message.guild.bans.fetch();
                const bannedUser = banList.find(b => b.user.username.toLowerCase() === targetName.toLowerCase());

                if (!bannedUser) {
                    return message.reply('❌ Bu kullanıcı adı ile eşleşen aktif bir ban bulunamadı!');
                }

                await message.guild.members.unban(bannedUser.user.id, reason);
                message.channel.send(`✅ **${bannedUser.user.tag}** adlı kullanıcının yasağı kaldırıldı! | **Sebep:** ${reason}`);
            } catch (err) {
                message.reply('❌ Kullanıcının yasağı kaldırılamadı.');
            }
        }

        // 6. c!üyeat <@kullanıcı> <sebep> (Kick)
        if (command === 'c!üyeat') {
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return message.reply('❌ Bu komutu kullanmak için **Üyeleri At** yetkisine sahip olmalısın!');
            }

            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Lütfen sunucudan atılacak üyeyi etiketle! Örnek: `c!üyeat @kullanici Spam`');

            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
            const member = message.guild.members.cache.get(user.id);

            if (!member.kickable) return message.reply('❌ Bu kullanıcıyı sunucudan atamam, yetkim yetmiyor veya benden üst bir rolde.');

            try {
                await member.kick(reason);
                message.channel.send(`✅ **${user.tag}** sunucudan atıldı! | **Sebep:** ${reason}`);
            } catch (err) {
                message.reply('❌ Kullanıcı atılırken bir hata oluştu.');
            }
        }

        // 7. c!sustur <@kullanıcı> <sebep> <süre>
        if (command === 'c!sustur') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return message.reply('❌ Bu komutu kullanmak için **Üyeleri Sustur** yetkisine sahip olmalısın!');
            }

            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Lütfen susturulacak üyeyi etiketle! Örnek: `c!sustur @kullanici yaramazlık yaptı 1h`');

            const timeArg = args[args.length - 1];
            if (!timeArg || !/[0-9]+[smhd]/.test(timeArg)) {
                return message.reply('❌ Lütfen cümlenin en sonuna geçerli bir süre yaz! Örnek: `1h`, `10m`, `30s`, `1d`.');
            }

            const amount = parseInt(timeArg);
            const unit = timeArg.slice(-1);
            let duration = 0;

            if (unit === 's') duration = amount * 1000;
            else if (unit === 'm') duration = amount * 60 * 1000;
            else if (unit === 'h') duration = amount * 60 * 60 * 1000;
            else if (unit === 'd') duration = amount * 24 * 60 * 60 * 1000;

            const reason = args.slice(1, args.length - 1).join(' ') || 'Sebep belirtilmedi.';
            const member = message.guild.members.cache.get(user.id);

            try {
                await member.timeout(duration, reason);
                message.channel.send(`✅ **${user.tag}** başarıyla **${timeArg}** süreyle susturuldu! | **Sebep:** ${reason}`);
            } catch (err) {
                message.reply('❌ Kullanıcı susturulurken bir hata oluştu.');
            }
        }

        // 8. c!unsustur <@kullanıcı> <sebep>
        if (command === 'c!unsustur') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return message.reply('❌ Bu komutu kullanmak için **Üyeleri Sustur** yetkisine sahip olmalısın!');
            }

            const user = message.mentions.users.first();
            if (!user) return message.reply('❌ Lütfen susturması kaldırılacak üyeyi etiketle! Örnek: `c!unsustur @kullanici Süresi bitti`');

            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
            const member = message.guild.members.cache.get(user.id);

            try {
                await member.timeout(null, reason);
                message.channel.send(`✅ **${user.tag}** adlı kullanıcının susturması kaldırıldı! | **Sebep:** ${reason}`);
            } catch (err) {
                message.reply('❌ Kullanıcının susturması kaldırılamaz.');
            }
        }

        // 9. c!sil <sayı> (1 ile 1000 Arası)
        if (command === 'c!sil') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return message.reply('❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın!');
            }

            const count = parseInt(args[0]);
            if (isNaN(count) || count < 1 || count > 1000) {
                return message.reply('❌ Lütfen 1 ile 1000 arasında silinecek mesaj sayısı belirt! Örnek: `c!sil 500`');
            }

            try {
                await message.delete(); // Komut mesajını sil
                let deletedTotal = 0;

                while (deletedTotal < count) {
                    const fetchLimit = Math.min(count - deletedTotal, 100);
                    const fetched = await message.channel.messages.fetch({ limit: fetchLimit });
                    
                    if (fetched.size === 0) break;

                    const deleted = await message.channel.bulkDelete(fetched, true);
                    deletedTotal += deleted.size;

                    if (deleted.size < fetchLimit) break; // Silinecek başka mesaj kalmadıysa dur
                }
                
                const msg = await message.channel.send(`✅ Başarıyla toplam **${deletedTotal}** adet mesaj silindi.`);
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            } catch (err) {
                message.reply('❌ Mesajlar silinirken bir hata oluştu (14 günden eski mesajlar toplu silinemez).');
            }
        }
    });
};