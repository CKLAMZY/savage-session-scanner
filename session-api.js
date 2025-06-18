
const express = require("express");
const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

const app = express();
const port = process.env.PORT || 3000;
const sessionPath = "./session.json";

const { state, saveState } = useSingleFileAuthState(sessionPath);

app.get("/generate-session", async (req, res) => {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
            res.json({ qr });
        }
        if (connection === "open") {
            saveState();
        }
    });

    sock.ev.on("creds.update", saveState);
});

app.listen(port, () => {
    console.log(`Session API running on http://localhost:${port}`);
});
