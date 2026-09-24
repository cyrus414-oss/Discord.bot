const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Karşılama/çıkış sistemini çağırıyoruz
require('./karsilayici.js')(client);

// Ticket sistemini (tick.js) çağırıyoruz
require('./tick.js')(client);

// Çekiliş sistemini dahil et
require('./cekilis.js')(client); 

require('./oylama.js')(client);

require('./yanitlar.js')(client);

require('./kufurvbengel.js')(client);

client.once('ready', () => {
    console.log(`Bot aktif: ${client.user.tag}`);
});

// Botunun Token'ı
client.login('MTU1MjQxMjYzMzE0MTg3ODg0NQ.G5hx6G.ZyEaxOSK1fErI4jbX0iFlhtLJvb4aV8UT3eY-A');