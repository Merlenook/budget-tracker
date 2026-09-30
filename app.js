// ---------- Grunddaten ----------
const KATEGORIEN = {
  ausgabe: [
    "🛒 Lebensmittel",
    "🏠 Miete & Wohnen",
    "🚌 Mobilität",
    "🎉 Freizeit",
    "🛍️ Shopping",
    "💊 Gesundheit",
    "📱 Abos",
    "🛡️ Versicherungen",
    "📦 Sonstiges",
  ],
  einnahme: ["💼 Gehalt", "🎁 Geschenk", "📦 Sonstiges"],
};

const FARBEN = [
  "#7c9cff", "#4ade80", "#fbbf24", "#f87171",
  "#c084fc", "#22d3ee", "#fb923c", "#94a3b8",
];

const INTERVALLE = {
  1: "monatlich",
  3: "vierteljährlich",
  6: "halbjährlich",
  12: "jährlich",
};

// ---------- Hilfsfunktionen ----------
// Heutiges Datum als Text, z. B. "2026-09-30"
function heute() {
  const d = new Date();
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// "2026-09-30" wird zu "30.09.2026"
function datumDE(datum) {
  return datum.slice(8, 10) + "." + datum.slice(5, 7) + "." + datum.slice(0, 4);
}

// Zu einem Datum n Monate addieren (der Tag bleibt, notfalls der letzte des Monats)
function addMonate(startDatum, n) {
  const teile = startDatum.split("-").map(Number);
  const ziel = new Date(teile[0], teile[1] - 1 + n, 1);
  const letzterTag = new Date(ziel.getFullYear(), ziel.getMonth() + 1, 0).getDate();
  const tag = Math.min(teile[2], letzterTag);
  return (
    ziel.getFullYear() + "-" +
    String(ziel.getMonth() + 1).padStart(2, "0") + "-" +
    String(tag).padStart(2, "0")
  );
}

// Wie viele Tage sind es von heute bis zu einem Datum?
function tageBis(datum) {
  const a = new Date(heute() + "T00:00:00");
  const b = new Date(datum + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function euro(zahl) {
  return zahl.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// ---------- Gespeicherte Daten ----------
let buchungen = JSON.parse(localStorage.getItem("buchungen")) || [];
let budgets = JSON.parse(localStorage.getItem("budgets")) || {};
let regeln = JSON.parse(localStorage.getItem("regeln")) || [];
let monat = heute().slice(0, 7);

buchungen.forEach(function (b) {
  if (!b.datum) b.datum = heute();
});

function speichern() {
  localStorage.setItem("buchungen", JSON.stringify(buchungen));
  localStorage.setItem("regeln", JSON.stringify(regeln));
}

function sortieren() {
  buchungen.sort(function (a, b) {
    return b.datum.localeCompare(a.datum);
  });
}

// ---------- Elemente der Seite ----------
const saldoAnzeige = document.getElementById("saldo");
const liste = document.getElementById("liste");
const typFeld = document.getElementById("typ");
const kategorieFeld = document.getElementById("kategorie");
const beschreibungFeld = document.getElementById("beschreibung");
const betragFeld = document.getElementById("betrag");
const datumFeld = document.getElementById("datum");
const knopf = document.getElementById("hinzufuegen");
const monatName = document.getElementById("monatName");
const summeEin = document.getElementById("summeEin");
const summeAus = document.getElementById("summeAus");
const donut = document.getElementById("donut");
const legende = document.getElementById("legende");
const budgetListe = document.getElementById("budgetListe");
const verlauf = document.getElementById("verlauf");
const verlaufInfo = document.getElementById("verlaufInfo");

const wTyp = document.getElementById("wTyp");
const wKategorie = document.getElementById("wKategorie");
const wBeschreibung = document.getElementById("wBeschreibung");
const wBetrag = document.getElementById("wBetrag");
const wIntervall = document.getElementById("wIntervall");
const wStart = document.getElementById("wStart");
const wKnopf = document.getElementById("wKnopf");
const wListe = document.getElementById("wListe");

const vName = document.getElementById("vName");
const vBetrag = document.getElementById("vBetrag");
const vIntervall = document.getElementById("vIntervall");
const vStart = document.getElementById("vStart");
const vKuendigung = document.getElementById("vKuendigung");
const vKnopf = document.getElementById("vKnopf");
const vListe = document.getElementById("vListe");
const vSummeMonat = document.getElementById("vSummeMonat");
const vSummeJahr = document.getElementById("vSummeJahr");

// ---------- Reiter ----------
document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("aktiv");
    });
    tab.classList.add("aktiv");
    document.querySelectorAll(".tab-inhalt").forEach(function (inhalt) {
      inhalt.hidden = inhalt.id !== "tab-" + tab.dataset.tab;
    });
  });
});

// ---------- Kategorien ----------
function kategorienLaden(typEl, katEl) {
  katEl.innerHTML = "";
  KATEGORIEN[typEl.value].forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    katEl.appendChild(option);
  });
}

typFeld.addEventListener("change", function () {
  kategorienLaden(typFeld, kategorieFeld);
});
wTyp.addEventListener("change", function () {
  kategorienLaden(wTyp, wKategorie);
});

// ---------- Monat wechseln ----------
function monatWechseln(richtung) {
  const teile = monat.split("-");
  const d = new Date(Number(teile[0]), Number(teile[1]) - 1 + richtung, 1);
  monat = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  anzeigen();
}

document.getElementById("zurueck").addEventListener("click", function () {
  monatWechseln(-1);
});
document.getElementById("vor").addEventListener("click", function () {
  monatWechseln(1);
});

// ---------- Regelbuchungen automatisch eintragen ----------
function regelnAnwenden() {
  let neu = false;

  regeln.forEach(function (r) {
    if (!r.erzeugt) r.erzeugt = [];

    for (let k = 0; k < 600; k++) {
      const datum = addMonate(r.start, k * r.monate);
      if (datum > heute()) break; // Zukunft: noch nicht eintragen

      if (!r.erzeugt.includes(datum)) {
        buchungen.push({
          typ: r.typ,
          kategorie: r.kategorie,
          beschreibung: r.beschreibung,
          betrag: r.betrag,
          datum: datum,
        });
        r.erzeugt.push(datum);
        neu = true;
      }
    }
  });

  if (neu) {
    sortieren();
    speichern();
  }
}

// Wann wird die Regel das nächste Mal fällig?
function naechsteFaelligkeit(r) {
  for (let k = 0; k < 600; k++) {
    const datum = addMonate(r.start, k * r.monate);
    if (datum > heute()) return datum;
  }
  return heute();
}

// ---------- Donut ----------
function donutZeichnen(ausgaben) {
  const proKategorie = {};
  let gesamt = 0;
  ausgaben.forEach(function (b) {
    const k = b.kategorie || "📦 Sonstiges";
    proKategorie[k] = (proKategorie[k] || 0) + b.betrag;
    gesamt += b.betrag;
  });

  const eintraege = Object.entries(proKategorie).sort(function (a, b) {
    return b[1] - a[1];
  });

  let svg = '<svg viewBox="0 0 42 42">';
  svg += '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="#2c3040" stroke-width="5"></circle>';

  legende.innerHTML = "";
  let verschiebung = 0;

  eintraege.forEach(function (eintrag, i) {
    const anteil = (eintrag[1] / gesamt) * 100;
    const farbe = FARBEN[i % FARBEN.length];

    svg +=
      '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="' + farbe + '"' +
      ' stroke-width="5" stroke-dasharray="' + anteil + " " + (100 - anteil) + '"' +
      ' stroke-dashoffset="' + -verschiebung + '"' +
      ' transform="rotate(-90 21 21)"></circle>';
    verschiebung += anteil;

    const zeile = document.createElement("li");
    const punkt = document.createElement("span");
    punkt.className = "punkt";
    punkt.style.background = farbe;
    const name = document.createElement("span");
    name.className = "legende-name";
    name.textContent = eintrag[0];
    const wert = document.createElement("span");
    wert.textContent = euro(eintrag[1]) + " · " + Math.round(anteil) + " %";
    zeile.append(punkt, name, wert);
    legende.appendChild(zeile);
  });

  const mitte = gesamt > 0 ? euro(gesamt) : "Keine Ausgaben";
  svg += '<text x="21" y="21.8" text-anchor="middle" fill="#e8eaf0" font-size="3.4" font-weight="700">' + mitte + "</text>";
  svg += "</svg>";
  donut.innerHTML = svg;
}

// ---------- Verlauf: Balkendiagramm der letzten 6 Monate ----------
function verlaufZeichnen() {
  const teile = monat.split("-");
  const monate = [];

  // Die 6 Monate bis einschließlich des gewählten Monats
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Number(teile[0]), Number(teile[1]) - 1 - i, 1);
    monate.push({
      key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"),
      label: d.toLocaleDateString("de-DE", { month: "short" }),
      ein: 0,
      aus: 0,
    });
  }

  buchungen.forEach(function (b) {
    const m = monate.find(function (x) {
      return b.datum.startsWith(x.key);
    });
    if (!m) return;
    if (b.typ === "einnahme") m.ein += b.betrag;
    else m.aus += b.betrag;
  });

  // Höchster Wert bestimmt die Skalierung
  let max = 1;
  let summeAus = 0;
  monate.forEach(function (m) {
    max = Math.max(max, m.ein, m.aus);
    summeAus += m.aus;
  });

  let svg = '<svg viewBox="0 0 300 140">';
  monate.forEach(function (m, i) {
    const x = i * 50 + 9;
    const hEin = (m.ein / max) * 100;
    const hAus = (m.aus / max) * 100;
    svg += '<rect x="' + x + '" y="' + (110 - hEin) + '" width="14" height="' + hEin + '" rx="3" fill="#4ade80"></rect>';
    svg += '<rect x="' + (x + 16) + '" y="' + (110 - hAus) + '" width="14" height="' + hAus + '" rx="3" fill="#f87171"></rect>';
    svg += '<text x="' + (x + 15) + '" y="130" text-anchor="middle" fill="#8a90a2" font-size="10">' + m.label + "</text>";
  });
  svg += "</svg>";
  verlauf.innerHTML = svg;

  verlaufInfo.textContent = "Ø Ausgaben: " + euro(summeAus / 6) + " pro Monat (letzte 6 Monate)";
}

// ---------- Budgetgrenzen ----------
function budgetsZeichnen(ausgaben) {
  budgetListe.innerHTML = "";

  KATEGORIEN.ausgabe.forEach(function (kat) {
    let ausgegeben = 0;
    ausgaben.forEach(function (b) {
      if ((b.kategorie || "📦 Sonstiges") === kat) {
        ausgegeben += b.betrag;
      }
    });

    const limit = budgets[kat] || 0;

    const zeile = document.createElement("li");
    zeile.className = "budget-zeile";

    const kopf = document.createElement("div");
    kopf.className = "budget-kopf";

    const name = document.createElement("span");
    name.textContent = kat;

    const eingabe = document.createElement("input");
    eingabe.type = "number";
    eingabe.min = "0";
    eingabe.step = "1";
    eingabe.placeholder = "Limit €";
    eingabe.value = limit || "";
    eingabe.addEventListener("change", function () {
      const wert = parseFloat(eingabe.value);
      if (isNaN(wert) || wert <= 0) {
        delete budgets[kat];
      } else {
        budgets[kat] = wert;
      }
      localStorage.setItem("budgets", JSON.stringify(budgets));
      anzeigen();
    });

    kopf.append(name, eingabe);
    zeile.appendChild(kopf);

    const info = document.createElement("small");
    info.className = "kategorie-label";

    if (limit > 0) {
      const anteil = (ausgegeben / limit) * 100;

      const spur = document.createElement("div");
      spur.className = "balken";
      const fuellung = document.createElement("div");
      fuellung.className = "fuellung";
      fuellung.style.width = Math.min(anteil, 100) + "%";
      if (anteil >= 100) fuellung.classList.add("rot");
      else if (anteil >= 80) fuellung.classList.add("gelb");
      spur.appendChild(fuellung);
      zeile.appendChild(spur);

      if (anteil > 100) {
        info.textContent = euro(ausgegeben) + " von " + euro(limit) + " · " + euro(ausgegeben - limit) + " drüber";
      } else {
        info.textContent = euro(ausgegeben) + " von " + euro(limit) + " · noch " + euro(limit - ausgegeben);
      }
      zeile.appendChild(info);
    } else if (ausgegeben > 0) {
      info.textContent = euro(ausgegeben) + " ausgegeben (kein Limit)";
      zeile.appendChild(info);
    }

    budgetListe.appendChild(zeile);
  });
}

// ---------- Listen für Regeln und Versicherungen ----------
// Eine Zeile mit Name, Zusatzinfos und Löschen-Knopf
function regelZeile(r, infos) {
  const eintrag = document.createElement("li");

  const links = document.createElement("div");
  const name = document.createElement("div");
  name.textContent = r.beschreibung;
  links.appendChild(name);

  infos.forEach(function (info) {
    const zeile = document.createElement("div");
    zeile.className = "kategorie-label" + (info.warnung ? " warnung" : "");
    zeile.textContent = info.text;
    links.appendChild(zeile);
  });

  const betrag = document.createElement("span");
  betrag.textContent = (r.typ === "ausgabe" ? "−" : "+") + euro(r.betrag);
  betrag.className = r.typ;

  const loeschen = document.createElement("button");
  loeschen.textContent = "✕";
  loeschen.className = "loeschen";
  loeschen.addEventListener("click", function () {
    const ok = confirm(
      "„" + r.beschreibung + "“ löschen? Bereits eingetragene Buchungen bleiben bestehen."
    );
    if (!ok) return;
    regeln.splice(regeln.indexOf(r), 1);
    speichern();
    anzeigen();
  });

  const rechts = document.createElement("span");
  rechts.className = "rechts";
  rechts.append(betrag, loeschen);

  eintrag.append(links, rechts);
  return eintrag;
}

function leerZeile(text) {
  const leer = document.createElement("li");
  leer.className = "leer";
  leer.textContent = text;
  return leer;
}

function regelnZeichnen() {
  wListe.innerHTML = "";
  vListe.innerHTML = "";
  let proMonat = 0;
  let anzahlW = 0;
  let anzahlV = 0;

  regeln.forEach(function (r) {
    const naechste = naechsteFaelligkeit(r);

    if (r.versicherung) {
      anzahlV++;
      const infos = [
        { text: INTERVALLE[r.monate] + " · nächste Fälligkeit " + datumDE(naechste) },
      ];
      if (r.kuendigung) {
        const tage = tageBis(r.kuendigung);
        if (tage < 0) {
          infos.push({ text: "Kündigungstermin war " + datumDE(r.kuendigung) });
        } else {
          infos.push({
            text: "Kündigen bis " + datumDE(r.kuendigung) + " (noch " + tage + " Tage)",
            warnung: tage <= 60,
          });
        }
      }
      vListe.appendChild(regelZeile(r, infos));
      proMonat += r.betrag / r.monate;
    } else {
      anzahlW++;
      wListe.appendChild(
        regelZeile(r, [
          { text: r.kategorie + " · " + INTERVALLE[r.monate] + " · nächste Buchung " + datumDE(naechste) },
        ])
      );
    }
  });

  if (anzahlW === 0) wListe.appendChild(leerZeile("Noch keine Regelbuchungen."));
  if (anzahlV === 0) vListe.appendChild(leerZeile("Noch keine Versicherungen."));

  vSummeMonat.textContent = euro(proMonat);
  vSummeJahr.textContent = euro(proMonat * 12);
}

// ---------- Alles neu zeichnen ----------
function anzeigen() {
  let saldo = 0;
  buchungen.forEach(function (b) {
    saldo += b.typ === "einnahme" ? b.betrag : -b.betrag;
  });
  saldoAnzeige.textContent = euro(saldo);

  const imMonat = buchungen.filter(function (b) {
    return b.datum.startsWith(monat);
  });

  const teile = monat.split("-");
  monatName.textContent = new Date(Number(teile[0]), Number(teile[1]) - 1, 1)
    .toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  let ein = 0;
  let aus = 0;
  imMonat.forEach(function (b) {
    if (b.typ === "einnahme") ein += b.betrag;
    else aus += b.betrag;
  });
  summeEin.textContent = euro(ein);
  summeAus.textContent = euro(aus);

  const ausgabenImMonat = imMonat.filter(function (b) {
    return b.typ === "ausgabe";
  });
  donutZeichnen(ausgabenImMonat);
  budgetsZeichnen(ausgabenImMonat);
  verlaufZeichnen();
  regelnZeichnen();

  // Buchungsliste
  liste.innerHTML = "";
  if (imMonat.length === 0) {
    liste.appendChild(leerZeile("Keine Buchungen in diesem Monat."));
  }

  imMonat.forEach(function (b) {
    const eintrag = document.createElement("li");

    const links = document.createElement("div");
    const name = document.createElement("div");
    name.textContent = b.beschreibung;
    const kat = document.createElement("small");
    kat.className = "kategorie-label";
    const tagMonat = b.datum.slice(8, 10) + "." + b.datum.slice(5, 7) + ".";
    kat.textContent = (b.kategorie || "📦 Sonstiges") + " · " + tagMonat;
    links.append(name, kat);

    const betrag = document.createElement("span");
    betrag.textContent = (b.typ === "ausgabe" ? "−" : "+") + euro(b.betrag);
    betrag.className = b.typ;

    const loeschen = document.createElement("button");
    loeschen.textContent = "✕";
    loeschen.className = "loeschen";
    loeschen.addEventListener("click", function () {
      buchungen.splice(buchungen.indexOf(b), 1);
      speichern();
      anzeigen();
    });

    const rechts = document.createElement("span");
    rechts.className = "rechts";
    rechts.append(betrag, loeschen);

    eintrag.append(links, rechts);
    liste.appendChild(eintrag);
  });
}

// ---------- Neue Buchung ----------
knopf.addEventListener("click", function () {
  const beschreibung = beschreibungFeld.value.trim();
  const betrag = parseFloat(betragFeld.value);
  const datum = datumFeld.value || heute();

  if (beschreibung === "" || isNaN(betrag) || betrag <= 0) {
    return;
  }

  buchungen.unshift({
    typ: typFeld.value,
    kategorie: kategorieFeld.value,
    beschreibung: beschreibung,
    betrag: betrag,
    datum: datum,
  });
  sortieren();

  beschreibungFeld.value = "";
  betragFeld.value = "";
  monat = datum.slice(0, 7);
  speichern();
  anzeigen();
});

// ---------- Neue Regelbuchung ----------
wKnopf.addEventListener("click", function () {
  const beschreibung = wBeschreibung.value.trim();
  const betrag = parseFloat(wBetrag.value);

  if (beschreibung === "" || isNaN(betrag) || betrag <= 0 || !wStart.value) {
    return;
  }

  regeln.push({
    id: Date.now(),
    typ: wTyp.value,
    kategorie: wKategorie.value,
    beschreibung: beschreibung,
    betrag: betrag,
    monate: Number(wIntervall.value),
    start: wStart.value,
    erzeugt: [],
    versicherung: false,
    kuendigung: "",
  });

  wBeschreibung.value = "";
  wBetrag.value = "";
  regelnAnwenden();
  speichern();
  anzeigen();
});

// ---------- Neue Versicherung ----------
vKnopf.addEventListener("click", function () {
  const name = vName.value.trim();
  const betrag = parseFloat(vBetrag.value);

  if (name === "" || isNaN(betrag) || betrag <= 0 || !vStart.value) {
    return;
  }

  regeln.push({
    id: Date.now(),
    typ: "ausgabe",
    kategorie: "🛡️ Versicherungen",
    beschreibung: name,
    betrag: betrag,
    monate: Number(vIntervall.value),
    start: vStart.value,
    erzeugt: [],
    versicherung: true,
    kuendigung: vKuendigung.value || "",
  });

  vName.value = "";
  vBetrag.value = "";
  vKuendigung.value = "";
  regelnAnwenden();
  speichern();
  anzeigen();
});

// ---------- Backup ----------
const exportKnopf = document.getElementById("exportKnopf");
const importKnopf = document.getElementById("importKnopf");
const importDatei = document.getElementById("importDatei");
const backupMeldung = document.getElementById("backupMeldung");

exportKnopf.addEventListener("click", function () {
  const daten = { buchungen: buchungen, budgets: budgets, regeln: regeln };
  const blob = new Blob([JSON.stringify(daten, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "budget-backup-" + heute() + ".json";
  link.click();
  URL.revokeObjectURL(link.href);
  backupMeldung.textContent = "Backup gespeichert (" + buchungen.length + " Buchungen).";
});

importKnopf.addEventListener("click", function () {
  importDatei.click();
});

importDatei.addEventListener("change", function () {
  const datei = importDatei.files[0];
  if (!datei) return;

  const leser = new FileReader();
  leser.onload = function () {
    try {
      const daten = JSON.parse(leser.result);
      if (!Array.isArray(daten.buchungen)) throw new Error("Falsches Format");

      const ok = confirm(
        "Achtung: Die aktuellen Daten werden durch das Backup ersetzt (" +
        daten.buchungen.length + " Buchungen). Fortfahren?"
      );
      if (!ok) return;

      buchungen = daten.buchungen;
      budgets = daten.budgets || {};
      regeln = Array.isArray(daten.regeln) ? daten.regeln : [];
      buchungen.forEach(function (b) {
        if (!b.datum) b.datum = heute();
      });
      regeln.forEach(function (r) {
        if (!r.erzeugt) r.erzeugt = [];
      });
      localStorage.setItem("budgets", JSON.stringify(budgets));
      speichern();
      anzeigen();
      backupMeldung.textContent = "Backup geladen (" + buchungen.length + " Buchungen).";
    } catch (fehler) {
      backupMeldung.textContent = "Diese Datei konnte nicht gelesen werden.";
    }
    importDatei.value = "";
  };
  leser.readAsText(datei);
});

// ---------- Neustart ----------
const resetKnopf = document.getElementById("resetKnopf");

resetKnopf.addEventListener("click", function () {
  const ok1 = confirm(
    "Wirklich ALLES löschen? Buchungen, Regelbuchungen, Versicherungen und Budgetgrenzen gehen verloren."
  );
  if (!ok1) return;

  const ok2 = confirm("Letzte Nachfrage: Das kann nicht rückgängig gemacht werden. Fortfahren?");
  if (!ok2) return;

  buchungen = [];
  budgets = {};
  regeln = [];
  monat = heute().slice(0, 7);

  localStorage.setItem("budgets", JSON.stringify(budgets));
  speichern();
  anzeigen();
  backupMeldung.textContent = "Alles zurückgesetzt.";
});
// ---------- Start ----------
datumFeld.value = heute();
wStart.value = heute();
vStart.value = heute();
kategorienLaden(typFeld, kategorieFeld);
kategorienLaden(wTyp, wKategorie);
regelnAnwenden();
speichern();
anzeigen();

// Service Worker registrieren (für Offline-Modus und Installierbarkeit)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}