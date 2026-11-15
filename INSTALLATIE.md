# Thuis installeren

Duur: ongeveer 15 minuten. Alles is gratis. Een computer is het makkelijkst, maar het kan ook op je telefoon.

Wil je eerst rondkijken? Open de app en kies **Eerst uitproberen op deze telefoon**. Je gegevens kun je later meenemen naar het gezinsaccount.

## Deel 1: website aanzetten (GitHub Pages)

1. Ga in GitHub naar de repository **Thuis** → **Settings** → **Pages**.
2. Bij *Build and deployment* kies je **Deploy from a branch**, branch **main** en map **/ (root)**. Kies **Save**.
3. Na een paar minuten staat de app op `https://collinsluik956454-ship-it.github.io/Thuis/`.
   Open dat adres op je telefoon en kies in het browsermenu **Toevoegen aan startscherm** als je wilt.

## Deel 2: Firebase-project maken

1. Ga naar https://console.firebase.google.com en kies **Project toevoegen**. Naam: `Thuis`. Google Analytics mag uit. Kies **Project maken**.
2. **Inloggen aanzetten:** in het menu links kies je **Build → Authentication → Aan de slag**. Bij *Aanmeldmethode* kies je **E-mail/wachtwoord**, zet dat **aan** en kies **Opslaan**.
3. **Database maken:** kies **Build → Realtime Database → Database maken**.
   - Locatie: **België (europe-west1)**.
   - Kies **Starten in vergrendelde modus** en daarna **Inschakelen**.
4. **Regels:** open in Realtime Database het tabblad **Regels**. Vervang alles door de inhoud van `firebase-regels.json` en kies **Publiceren**.
   Hiermee kan alleen jullie gezinsaccount jullie gegevens lezen en schrijven.
5. **Gegevens voor de app:** kies het tandwiel naast *Projectoverzicht* → **Projectinstellingen**. Kies onderaan bij *Jouw apps* het web-icoon **`</>`**, vul als bijnaam `Thuis` in en kies **App registreren**. Firebase Hosting heb je niet nodig.
   Je ziet nu een stukje code met `firebaseConfig`. Daaruit heb je nodig:
   - `apiKey` (begint met `AIza…`)
   - `databaseURL` (eindigt op `firebasedatabase.app`)

   Staat `databaseURL` er niet bij? Dan kopieer je het adres dat bovenaan de pagina Realtime Database staat.

## Deel 3: de app instellen

1. Open de app en kies **Gezin instellen**. Plak de `databaseURL` en de `apiKey` en kies **Verder**.
2. Kies **Nieuw gezin** en vul een e-mailadres en een wachtwoord in. Dat wordt het gezinsaccount; het hele gezin gebruikt dit ene account.
3. Maak je eigen ouderprofiel met een pincode van 4 cijfers.
4. Voeg de kinderen toe. Een pincode is voor kinderen niet nodig.
5. Voeg in **Instellingen** ook de andere ouder toe (**+ Ouder**) met een eigen pincode. Die pincode kan later in Instellingen worden gewijzigd.
6. Kies in **Instellingen → Telefoon koppelen → Koppellink delen** en stuur de link naar je partner. Je partner opent de link, logt in met hetzelfde gezinsaccount en kiest het eigen profiel.

## Deel 4: Android-app (APK)

1. Elke keer dat de app verandert, bouwt GitHub automatisch een nieuwe APK. Je kunt dat ook zelf starten: **Actions → Thuis APK bouwen → Run workflow**.
2. Ga naar **Releases** (rechts op de voorpagina van de repository) en download **Thuis.apk** op je telefoon.
3. Open het bestand en sta installeren uit onbekende bronnen toe als je telefoon daarom vraagt.

De APK laadt altijd de nieuwste versie van de website. Voor nieuwe functies hoef je de app dus meestal niet opnieuw te installeren. Is er toch een nieuwe APK nodig, dan meldt Thuis dat zelf op het scherm **Vandaag** (en bij Instellingen) met een knop **Downloaden en installeren**. Android vraagt daarna altijd nog even om bevestiging; helemaal ongemerkt installeren kan niet.

## Deel 5: agenda's van je telefoon koppelen

De agenda's van je e-mailadressen (Gmail, Outlook/Hotmail) staan meestal al in de agenda van je telefoon. Thuis leest die in de Android-app en zet de afspraken van de komende 2 maanden in het gezin, zodat jullie elkaars afspraken zien.

1. Open de Thuis-app (APK) en kies je eigen ouderprofiel.
2. Ga naar **Agenda → Agenda koppelen** en geef toestemming voor de agenda.
3. Je ziet je agenda's per e-mailadres. Vink aan welke het gezin mag zien (bijvoorbeeld niet je werkagenda) en kies **Opslaan en delen**.
4. Je partner doet hetzelfde op de eigen telefoon.

Mist er een agenda?
- **Outlook / Hotmail:** open de Outlook-app → Instellingen → tik op je account → zet **Agenda's synchroniseren** aan.
- **Google / Gmail:** Instellingen van je telefoon → Accounts → Google → je account → Account synchroniseren → **Agenda** aan.
- **OneCalendar:** agenda's die je alleen in OneCalendar hebt toegevoegd, kan Thuis niet lezen. Voeg het e-mailaccount toe zoals hierboven; dan zien OneCalendar en Thuis het allebei.

Thuis leest alleen en verandert niets in je agenda. Vanaf app-versie 1.3 gaat het bijwerken vanzelf, ook als Thuis dicht is en na het herstarten van je telefoon: ongeveer elk kwartier, en kort nadat er iets in je agenda verandert. Als je telefoon lang stil ligt of in de batterijbesparing staat, kan Android dat wat uitstellen. Bij **Agenda** zie je per persoon wanneer het laatst is bijgewerkt.

Komt het bijwerken op jouw telefoon niet op gang? Zet dan bij Instellingen → Apps → Thuis → Batterij het gebruik op **Onbeperkt** (of: niet optimaliseren). Wil je stoppen? **Instellingen → Agenda op deze telefoon → Agenda's kiezen → Stoppen met delen**.

## Goed om te weten

- **Pincodes zijn een kinderslot**, geen echte beveiliging: ze houden kinderen uit het ouderscherm. Wie het gezinswachtwoord kent, kan bij alle gegevens.
- **Pincode vergeten?** Tik bij het invullen op **Vergeten?** en vul het wachtwoord van het gezinsaccount in. Daarna kies je een nieuwe pincode.
- **Klusjes goedkeuren** staat standaard aan: een kind tikt een klusje af, een ouder keurt het goed en dan pas komen de sterren. Je kunt dit uitzetten in Instellingen.
- **Om de beurt**: een klusje kan elke keer of elke week naar een ander kind gaan. Het weekrooster laat zien wie wanneer aan de beurt is.
- **Weekgeld** komt op maandag in de spaarpot, of de eerste keer dat iemand de app die week opent.
- **Zonder internet** werkt de app gewoon. Wijzigingen worden verstuurd zodra er weer verbinding is.
- **Voorlezen**: de luidspreker-knopjes lezen klusjes en beloningen voor, zodat kinderen die nog niet lezen ook weten wat er staat.
- Het gratis **Spark-abonnement** van Firebase is ruim genoeg voor een gezin.
- Zie je **“Database geeft geen toegang”**? Dan zijn de regels uit stap 2.4 nog niet gepubliceerd. De app laat ze zien met een knop om ze te kopiëren.
