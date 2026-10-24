# Jak wrzucić formularz do internetu (Render – darmowy hosting)

## 1. Hasło aplikacji do Gmaila (grackomi@gmail.com)
Gmail nie pozwala używać zwykłego hasła w programach.
1. Wejdź na https://myaccount.google.com/security
2. Włącz **Weryfikację dwuetapową** (jeśli nie masz).
3. Wejdź na https://myaccount.google.com/apppasswords
4. Wpisz nazwę (np. "formularz") i kliknij Utwórz.
5. Skopiuj 16-znakowe hasło (bez spacji).

## 2. Wrzuć pliki na GitHub
1. Załóż konto na https://github.com
2. Kliknij **New repository** → nazwa np. `formularz` → Create.
3. Kliknij **uploading an existing file** i przeciągnij WSZYSTKIE pliki z folderu
   (server.js, package.json, .gitignore, folder public). **Nie wrzucaj pliku .env.**
4. Kliknij **Commit changes**.

## 3. Hosting na Render
1. Wejdź na https://render.com i zaloguj się przez GitHub.
2. **New +** → **Web Service** → wybierz repozytorium `formularz`.
3. Ustawienia:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
4. W sekcji **Environment Variables** dodaj trzy zmienne:
   - `GMAIL_USER` = `grackomi@gmail.com`
   - `GMAIL_APP_PASSWORD` = (hasło aplikacji z kroku 1)
   - `MAIL_TO` = `informatyk.cmg@gmail.com` (adres od nauczyciela, na który idą oferty)
   - `COPY_TO` = `grackomi@gmail.com` (opcjonalnie: Twoja kopia, żebyś widział, że mail wyszedł)
5. Kliknij **Create Web Service**. Po paru minutach dostaniesz adres
   w stylu `https://formularz.onrender.com` – to Twoja strona.

## Jak działa wysyłka
- Każdy, kto wpisze w formularzu swój adres e-mail (np. dowolny Gmail) i ofertę pracy,
  wysyła ją na adres z `MAIL_TO` (informatyk.cmg@gmail.com). Mail wychodzi z grackomi@gmail.com,
  a przycisk "Odpowiedz" w Gmailu odpowiada do osoby z formularza.
- Nie masz dostępu do informatyk.cmg@gmail.com? Dowód wysyłki masz w grackomi@gmail.com
  w folderze **Wysłane** (a z `COPY_TO` także w skrzynce odbiorczej).
- Limity w `server.js`: 5 maili na godzinę z jednego IP i 300 na dobę łącznie
  (zmienisz w `MAX_NA_IP_NA_GODZINE` i `MAX_DZIENNIE`). Chronią przed spamem.

## Uwagi
- Darmowy Render "usypia" stronę po 15 min bez ruchu – pierwsze wejście po
  przerwie ładuje się ok. 30-60 sekund.
- Test lokalny (opcjonalnie): skopiuj `.env.example` jako `.env`, uzupełnij hasło,
  uruchom `npm install` i `npm start`, wejdź na http://localhost:3000
