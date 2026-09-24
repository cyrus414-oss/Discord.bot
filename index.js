const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('CraftingNW Bot Aktif! 🚀');
});

app.listen(port, () => {
    console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Sistem modüllerini çağırıyoruz
require('./karsilayici.js')(client);
require('./tick.js')(client);
require('./cekilis.js')(client); 
require('./oylama.js')(client);
require('./yanitlar.js')(client);
require('./kufurvbengel.js')(client);

client.once('ready', () => {
    console.log(`Bot aktif: ${client.user.tag}`);
});

// Token'ı gizli tutmak için Render Environment değişkeninden alıyoruz
client.login(process.env.TOKEN);
