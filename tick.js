const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = (client) => {
    const YETKILI_ROLU_ID = 'YETKILI_ROLU_ID_BURAYA'; // Buraya yetkili rolünün ID'sini yaz

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        if (message.content === '!tick') {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.reply('Bu komutu kullanmak için yetkin yok.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🎟️ Destek Sistemi')
                .setDescription('Sunucu ile ilgili yardıma ihtiyacın varsa aşağıdaki butona basarak destek talebi oluşturma adımlarını başlatabilirsin.')
                .setColor('#5865F2');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_menu_ac')
                        .setLabel('Destek Talebi Aç')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎫')
                );

            await message.channel.send({ embeds: [embed], components: [row] });
            await message.delete();
        }
    });

    client.on('interactionCreate', async interaction => {
        // 1. Kategori Seçim Menüsü
        if (interaction.isButton() && interaction.customId === 'ticket_menu_ac') {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_kategori_sec')
                .setPlaceholder('Lütfen bir destek kategorisi seçin...')
                .addOptions([
                    { label: 'Genel Destek', value: 'genel', emoji: '💬' },
                    { label: 'Şikayet', value: 'sikayet', emoji: '⚠️' },
                    { label: 'Oyun İçi Destek', value: 'oyunici', emoji: '⛏️' },
                    { label: 'Basvuru', value: 'basvuru', emoji: '📝' },
                    { label: 'İade', value: 'iade', emoji: '💰' }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: 'Lütfen aşağıdan talebinizle ilgili uygun kategoriyi seçin:', components: [row], ephemeral: true });
        }

        // 2. Modal Açma
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_kategori_sec') {
            const secilenKategori = interaction.values[0];
            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${secilenKategori}`)
                .setTitle('Destek Talebi Detayı');

            const sorunInput = new TextInputBuilder()
                .setCustomId('sorun_aciklama')
                .setLabel('Yaşadığınız sorunu / talebi detaylı yazın:')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Sorununuzu buraya yazın...')
                .setRequired(true)
                .setMaxLength(1000);

            modal.addComponents(new ActionRowBuilder().addComponents(sorunInput));
            await interaction.showModal(modal);
        }

        // 3. Kanal Oluşturma ve Yetkililere Özel Panel Gönderme
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
            const kategoriTip = interaction.customId.split('_')[2];
            const aciklama = interaction.fields.getTextInputValue('sorun_aciklama');

            await interaction.reply({ content: 'Destek talebiniz oluşturuluyor, lütfen bekleyin...', ephemeral: true });

            try {
                const guild = interaction.guild;
                const member = interaction.member;

                const permissionOverwrites = [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    }
                ];

                if (YETKILI_ROLU_ID !== 'YETKILI_ROLU_ID_BURAYA') {
                    permissionOverwrites.push({
                        id: YETKILI_ROLU_ID,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    });
                }

                const ticketChannel = await guild.channels.create({
                    name: `${kategoriTip}-${member.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: permissionOverwrites,
                });

                // Normal kullanıcı mesajı (Sadece Kapat butonu var)
                const embed = new EmbedBuilder()
                    .setTitle(`Destek Talebi: ${kategoriTip.toUpperCase()}`)
                    .setDescription(`**Kullanıcı:** <@${member.id}>\n**Kategori:** ${kategoriTip}\n\n**Sorun / Açıklama:**\n> ${aciklama}`)
                    .setColor('#00FF00')
                    .setTimestamp();

                const userRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                    );

                await ticketChannel.send({ content: `<@${member.id}>`, embeds: [embed], components: [userRow] });

                // SADECE YETKİLİLERİN KULLANABileceği Panel
                const yetkiliEmbed = new EmbedBuilder()
                    .setTitle('🛠️ Yetkili Yönetim Paneli')
                    .setDescription('Bu butonlar **sadece yetkililer** içindir.')
                    .setColor('#FFA500');

                const yetkiliRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('ticket_devral').setLabel('Devral').setStyle(ButtonStyle.Primary).setEmoji('🙋‍♂️'),
                        new ButtonBuilder().setCustomId('ticket_uye_ekle_modal').setLabel('Üye Ekle').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
                        new ButtonBuilder().setCustomId('ticket_uye_cikar_modal').setLabel('Üye Çıkar').setStyle(ButtonStyle.Secondary).setEmoji('➖')
                    );

                await ticketChannel.send({ embeds: [yetkiliEmbed], components: [yetkiliRow] });

                await interaction.editReply({ content: `Özel destek kanalınız başarıyla oluşturuldu: ${ticketChannel}` });
            } catch (error) {
                console.error('Ticket oluşturulurken hata:', error);
                await interaction.editReply({ content: 'Kanal oluşturulurken hata oluştu!' });
            }
        }

        // Katı Yetki Kontrolü (Yetkili olmayan basarsa direkt engeller)
        const yetkiKontrol = (interaction) => {
            const isYetkili = YETKILI_ROLU_ID !== 'YETKILI_ROLU_ID_BURAYA' && interaction.member.roles.cache.has(YETKILI_ROLU_ID);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!isYetkili && !isAdmin) {
                interaction.reply({ content: '❌ Bu butonları sadece yetkililer kullanabilir!', ephemeral: true });
                return false;
            }
            return true;
        };

        // 4. Devral Butonu
        if (interaction.isButton() && interaction.customId === 'ticket_devral') {
            if (!yetkiKontrol(interaction)) return;
            const member = interaction.member;
            await interaction.reply({ content: `🙋‍♂️ Bu destek talebi **${member.user.username}** adlı yetkili tarafından devralındı!` });
            await interaction.channel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        }

        // 5. Üye Ekle Modal
        if (interaction.isButton() && interaction.customId === 'ticket_uye_ekle_modal') {
            if (!yetkiKontrol(interaction)) return;
            const modal = new ModalBuilder().setCustomId('ticket_uye_ekle_submit').setTitle('Talebe Üye Ekle');
            const userInput = new TextInputBuilder().setCustomId('eklenecek_id').setLabel('Eklenecek Üyenin Kullanıcı ID:').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(userInput));
            await interaction.showModal(modal);
        }

        // 6. Üye Ekleme İşlemi
        if (interaction.isModalSubmit() && interaction.customId === 'ticket_uye_ekle_submit') {
            const userID = interaction.fields.getTextInputValue('eklenecek_id').trim();
            try {
                const targetMember = await interaction.guild.members.fetch(userID);
                await interaction.channel.permissionOverwrites.edit(targetMember.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
                await interaction.reply({ content: `✅ Başarıyla <@${targetMember.id}> destek kanalına eklendi!` });
            } catch (err) {
                await interaction.reply({ content: '❌ Belirtilen ID ile ilgili sunucuda üye bulunamadı!', ephemeral: true });
            }
        }

        // 7. Üye Çıkar Modal
        if (interaction.isButton() && interaction.customId === 'ticket_uye_cikar_modal') {
            if (!yetkiKontrol(interaction)) return;
            const modal = new ModalBuilder().setCustomId('ticket_uye_cikar_submit').setTitle('Talepten Üye Çıkar');
            const userInput = new TextInputBuilder().setCustomId('cikarilacak_id').setLabel('Çıkarılacak Üyenin Kullanıcı ID:').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(userInput));
            await interaction.showModal(modal);
        }

        // 8. Üye Çıkarma İşlemi
        if (interaction.isModalSubmit() && interaction.customId === 'ticket_uye_cikar_submit') {
            const userID = interaction.fields.getTextInputValue('cikarilacak_id').trim();
            try {
                const targetMember = await interaction.guild.members.fetch(userID);
                await interaction.channel.permissionOverwrites.delete(targetMember.id);
                await interaction.reply({ content: `🚫 <@${targetMember.id}> destek kanalından çıkarıldı!` });
            } catch (err) {
                await interaction.reply({ content: '❌ İşlem başarısız!', ephemeral: true });
            }
        }

        // 9. Talebi Kapat (Herkes kapatabilir)
        if (interaction.isButton() && interaction.customId === 'ticket_kapat') {
            const channel = interaction.channel;
            await interaction.reply('Destek talebi kapatılıyor, kanal 3 saniye sonra silinecek...');
            setTimeout(() => { channel.delete().catch(() => {}); }, 3000);
        }
    });
};