# Orchestrarium

**Instruments of the Orchestra** — an offline-first, bilingual (English + Português-BR) web app for K-8 students to explore the instruments of the orchestra through interactive anatomy diagrams, real recordings, orchestral excerpts, and games.

## Features

- **Tiered for K-8** — three grade bands (Little Kids, Explorers, Big Kids) adjust vocabulary, hotspot density, and fact count via a `data-tier` attribute.
- **27 instruments** across five families: strings, woodwinds, brass, percussion, and other.
- **Interactive anatomy** — tap hotspots on procedurally generated SVG diagrams with DK Eyewitness-style leader lines and bite-size fact nuggets.
- **Real audio** — CC BY-SA 3.0 Philharmonia Orchestra samples plus a Web Audio synthesis fallback for instruments without a recording.
- **Orchestral excerpts** — Mozart's *Marriage of Figaro* Overture with individual stems for interactive listening.
- **Three games** — "What Instrument Is This?", Instrument Bingo, and Build the Orchestra, with progressive unlock tied to exploration progress.
- **No build step** — plain multi-file vanilla JS, PWA with a service worker for offline use.

## Running locally

No build required. Serve the directory over HTTP (the service worker and audio fetching need it):

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## Tests

```sh
node test/run.js          # unit tests (data model, games, graphics)
node test/integration.js  # navigation smoke test across all screens
```

## Audio assets

Samples live in `audio/samples/` with provenance in `audio/samples/manifest.json`.
Fetch scripts (idempotent):

```sh
node tools/fetch-samples.js   # from the skratchdot/philharmonia-samples GitHub mirror
node tools/fetch-wayback.js   # violin/viola/trumpet/tuba/harp/timpani via the Wayback Machine
```

## Credits

- Instrument recordings: [Philharmonia Orchestra](https://philharmonia.co.uk/) sample library, CC BY-SA 3.0.
- Orchestral excerpt: W. A. Mozart, *Le nozze di Figaro* Overture, via [Musopen](https://archive.org/) (public domain / CC0).

## License

Application code is released for educational use. Audio samples retain their respective licenses (see `audio/samples/manifest.json`).
