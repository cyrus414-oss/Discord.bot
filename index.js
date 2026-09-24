const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot aktif!');
});

app.listen(port, () => {
    console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);
});

// Tüm modüllerini buraya bağlıyoruz
require('./kufurvbengel.js')(client);
require('./cekilis.js')(client);
require('./karsilayici.js')(client);
require('./oylama.js')(client);
require('./tick.js')(client);
require('./yanitlar.js')(client);

client.login(process.env.TOKEN);
