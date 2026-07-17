# Regioni Tracker — Programma vs Realtà

Sito statico (solo HTML/CSS/JavaScript, nessun framework, nessun server) che confronta
il programma della giunta in carica di ogni Regione italiana con i dati ufficiali:
6 KPI per Regione (4 comuni a tutte — Sanità, Sicurezza, Lavoro, Ambiente — e 2 legati
alle priorità del programma regionale).

## Come far girare il sito

Nessuna installazione: **doppio clic su `index.html`** e il sito funziona in qualunque
browser, anche offline. I dati sono in file `.js` (non `.json`) proprio per evitare i
blocchi del browser sulle richieste `fetch` da `file://`.

Per navigare una singola Regione: `regione.html?r=lombardia` (la chiave `r` è il nome
del file in `data/` senza estensione).

## Struttura

```
regioni-tracker/
├── index.html          hub: Regioni raggruppate per macro-area (Nord / Centro / Sud e Isole)
├── regione.html        template unico della dashboard (regione.html?r=<chiave>)
├── assets/
│   ├── styles.css      stile condiviso (tema scuro)
│   └── app.js          motore: legge ?r=, costruisce nav, header, filtri e schede
├── data/
│   ├── piemonte.js     un file per Regione: window.DASH.<chiave> = { meta, ui, status, items }
│   └── …
└── README.md
```

Il motore (`app.js`) è generico: legge tutto da `window.DASH[<r>]` e non contiene
dati specifici. La lista `REGIONI` in cima ad `app.js` è condivisa da hub e dashboard.

## Come aggiungere o aggiornare una Regione

1. **Aggiornare**: modifica il file corrispondente in `data/` (valori `cur`, `base`,
   `delta`, `status`, `note`, `src`, `url`, `asof`). Nessun altro file va toccato.
2. **Aggiungere** (es. le Province autonome come voci separate):
   - copia un file esistente in `data/` (es. `data/trento.js`), cambia la chiave
     (`window.DASH.trento = …`) e i contenuti;
   - aggiungi `<script src="data/trento.js"></script>` in **entrambi** i file
     `index.html` e `regione.html` (prima di `assets/app.js`);
   - aggiungi la voce alla lista `REGIONI` in `assets/app.js`:
     `{ r: "trento", nome: "P.A. Trento", area: "Nord" }`.

### Regole sui dati (da rispettare)

- Ogni Regione ha **esattamente 6 items** (4 aree comuni: Sanità, Sicurezza, Lavoro,
  Ambiente — con questi nomi esatti — più 2 specifiche).
- `status` deve essere una tra `in-linea`, `in-corso`, `ritardo`, `fermo`.
- **Mai virgolette doppie dentro i testi**: usare `«…»` o l'apostrofo. Negli attributi
  HTML dentro le stringhe (es. `footerHtml`) usare apici singoli: `style='color:var(--green)'`.
- Ogni KPI cita fonte, link e data (`src`, `url`, `asof`); le stime vanno dichiarate
  come tali nella nota, i dati mancanti scritti come «dato non disponibile».

## Come pubblicarlo gratis

- **GitHub Pages**: crea un repository, carica la cartella `regioni-tracker/` e in
  *Settings → Pages* scegli il branch come sorgente. Il sito sarà su
  `https://<utente>.github.io/<repo>/`.
- **Netlify Drop**: vai su https://app.netlify.com/drop e trascina l'intera cartella
  `regioni-tracker/` nel browser. URL pubblico in pochi secondi, senza account a pagamento.

## Fonti principali e avvertenze

- **Sanità**: Ministero della Salute / Agenas — Nuovo Sistema di Garanzia LEA (anno di
  verifica 2023, relazione pubblicata nel 2025).
- **Sicurezza**: ISTAT / Ministero dell'Interno — delitti denunciati (per lo più 2022;
  alcuni valori regionali sono stime arrotondate, dichiarate nelle note).
- **Lavoro**: ISTAT — Rilevazione sulle forze di lavoro, tasso di occupazione 15-64 anni
  (2023, valori arrotondati).
- **Ambiente**: ISPRA — Rapporto Rifiuti Urbani (2022; 2023 dove disponibile).
- I 2 KPI specifici derivano dai programmi delle giunte in carica a luglio 2026
  (comprese le giunte elette nell'autunno 2025: Veneto, Campania, Puglia, Toscana,
  Marche, Calabria, Valle d'Aosta).

**Disclaimer**: il valore del KPI è misurato; lo «stato» (In linea / In corso / In
ritardo / Fermo) è una valutazione editoriale. Gli indicatori descrivono il contesto
regionale e non sono attribuibili per intero all'azione della giunta: correlazione
non è causalità.
