const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState("sessions");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, require("pino")({ level: "silent" })),
    },
    browser: ["CKLAMZY-XMD", "Safari", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) {
        sock = makeWASocket({ auth: state });
      }
    } else if (connection === "open") {
      console.log("connected to WA");
    }
  });

  res.send("CKLAMZY-XMD PAIRING SERVER RUNNING ✓");
});

app.listen(PORT, () => console.log("Server running on Port " + PORT));