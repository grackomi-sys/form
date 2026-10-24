require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.set('trust proxy', 1); // potrzebne na Render, żeby widzieć prawdziwy adres IP
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z Gmailem (hasło aplikacji ustawiasz w zmiennych środowiskowych)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// --- Proste limity, żeby nikt nie nadużył Twojego konta ---
const MAX_NA_IP_NA_GODZINE = 5;   // ile maili z jednego IP w ciągu godziny
const MAX_DZIENNIE = 300;         // ile maili łącznie na dobę (Gmail pozwala ok. 500)
const ipLog = new Map();          // ip -> lista czasów wysyłek
let dzien = new Date().toDateString();
let licznikDnia = 0;

function limitOk(ip) {
  const teraz = Date.now();
  if (new Date().toDateString() !== dzien) {
    dzien = new Date().toDateString();
    licznikDnia = 0;
  }
  if (licznikDnia >= MAX_DZIENNIE) return false;

  const czasy = (ipLog.get(ip) || []).filter((t) => teraz - t < 3600 * 1000);
  if (czasy.length >= MAX_NA_IP_NA_GODZINE) {
    ipLog.set(ip, czasy);
    return false;
  }
  czasy.push(teraz);
  ipLog.set(ip, czasy);
  licznikDnia++;
  return true;
}

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

app.post('/send', async (req, res) => {
  const { imie, email, stanowisko, wiadomosc, website } = req.body;

  // Pole "website" jest ukryte - boty je wypełniają, ludzie nie
  if (website) return res.json({ ok: true });

  const clean = (s, max) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
  const imieC = clean(imie, 100);
  const emailC = clean(email, 100);
  const stanowiskoC = clean(stanowisko, 100);
  const wiadomoscC = String(wiadomosc || '').trim();

  if (!imieC || !wiadomoscC || !EMAIL_RE.test(emailC)) {
    return res.status(400).json({ ok: false, error: 'Wypełnij poprawnie wszystkie pola.' });
  }
  if (wiadomoscC.length > 5000) {
    return res.status(400).json({ ok: false, error: 'Wiadomość jest za długa.' });
  }
  if (!limitOk(req.ip)) {
    return res.status(429).json({ ok: false, error: 'Za dużo wysyłek. Spróbuj później.' });
  }

  try {
    await transporter.sendMail({
      from: `"Formularz ofert pracy" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO || 'informatyk.cmg@gmail.com', // adres od nauczyciela
      bcc: process.env.COPY_TO || undefined, // opcjonalna ukryta kopia dla Ciebie (do sprawdzania)
      replyTo: emailC, // odpowiedź w Gmailu trafi do osoby z formularza
      subject: `Oferta pracy: ${stanowiskoC || 'brak stanowiska'} - ${imieC}`,
      text:
        `Imię i nazwisko / firma: ${imieC}\n` +
        `Email nadawcy: ${emailC}\n` +
        `Stanowisko: ${stanowiskoC || '-'}\n\n` +
        `Wiadomość:\n${wiadomoscC}\n`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Błąd wysyłki:', err.message);
    res.status(500).json({ ok: false, error: 'Nie udało się wysłać. Spróbuj później.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
