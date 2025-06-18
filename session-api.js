
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeWALegacySocket, useSingleFileLegacyAuthState, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        browser: ['CKLAMZY-XMD', 'Safari', '1.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr, pairingCode } = update;

        if (connection === 'open') {
            console.log('✅ Bot is connected!');
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) startSock();
        }

        if (update.pairingCode) {
            console.log('\n🔗 Pairing Code (use this to link your number):');
            console.log(update.pairingCode + '\n');
        }
    });
};

startSock();

app.get('/', (req, res) => {
    res.send('CKLAMZY-XMD PAIRING SERVER RUNNING ✅');
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
