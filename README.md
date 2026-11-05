# English Quest – De forsvunne ordene

Nettleserspill for å samle og lære 88 engelske verb. Bygget uten tredjepartsbiblioteker.

## Publisering på GitHub Pages
Last opp innholdet i denne mappen til **roten** av repositoryet `English-Quest`. Behold undermappene `js/` og `data/`. I Settings → Pages velger du Deploy from a branch, main og /(root).

## Test lokalt
ES-moduler krever en lokal webserver, for eksempel `python3 -m http.server 8000` og åpne `http://localhost:8000`.

## Kontroller
Piltaster/WASD på PC. Berøringsknapper på mobil. Mellomrom/Enter eller «Undersøk» ved en oppgave. B åpner ordboken.

## Lagring
Fremgang lagres i `localStorage` på enheten. Ingen konto eller server. Sletting skjer med «Start på nytt».

## Struktur
- `index.html` – oppstart
- `style.css` – design
- `data/verbs.js` – 88 verb
- `js/world.js` – kart, hindringer, oppgaver
- `js/player.js` – avatar
- `js/challenges.js` – utfordringer
- `js/dictionary.js` – ordbok
- `js/audio.js` – taleopplesning
- `js/save.js` – lagring
- `js/main.js` – spillmotor

## Merknader
Dette er en spillbar større testversjon. Det er ikke et ferdig kommersielt spill. Mestringsstjerner er en enkel modell, og uttale avhenger av tilgjengelige systemstemmer.
