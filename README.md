# Thuis

Gezinsapp voor ouders en jonge kinderen. Werkt in de browser en als Android-app.

- **Weekrooster**: klusjes per dag, voor iedereen samen of om de beurt (per keer of per week).
- **Klusjes met sterren**: kinderen tikken af op grote plaatjes; een ouder keurt goed.
- **Beloningen**: ouders maken beloningen (bijv. *IJsje = 12 sterren*); kinderen kiezen zelf.
- **Spaarpot per kind**: sterren omzetten naar euro's, weekgeld, spaardoel met voortgang.
- **Gezinsuitgaven**: uitgaven per maand, per soort en per kind, met maandbudget.
- **Agenda**: de telefoonagenda's van de ouders (Gmail, Outlook) gedeeld in het gezin, met vandaag en morgen op het startscherm. Je kiest zelf welke agenda's meedoen.
- **Prikbord**: briefjes voor elkaar en belangrijke datums (verjaardagen met leeftijd, en voor kinderen ‘nog 3 nachtjes slapen’).

Iedereen kiest op de telefoon zijn eigen profiel. Ouders hebben een pincode, voor kinderen is die niet nodig. Knopjes met een luidspreker lezen de tekst voor.

Installeren: zie [INSTALLATIE.md](INSTALLATIE.md).

## Bestanden

| Bestand | Wat |
| --- | --- |
| `index.html`, `style.css` | De pagina en de vormgeving (licht en donker) |
| `js/app.js` | Alle schermen en knoppen |
| `js/sync.js` | Opslag op het toestel en synchronisatie met Firebase (ook offline) |
| `native/*.java` | Android-onderdeel dat de telefoonagenda leest (ook terugkerende afspraken) en op de achtergrond bijwerkt |
| `firebase-regels.json` | Regels voor de Realtime Database |
| `.github/workflows/apk.yml` | Bouwt de Android-app (Capacitor) bij elke wijziging |
| `.github/debug.keystore` | Vaste handtekening, zodat een nieuwe APK over de oude heen installeert |

De gegevens staan in Firebase onder `families/<account-id>/` (profielen, klusjes, afgevinkte klusjes, sterren, beloningen, spaarpot, uitgaven, prikbord, datums en gedeelde agenda's).
