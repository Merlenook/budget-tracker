// ---------- Grunddaten ----------
const STANDARD_KATEGORIEN = {
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
  "#a8bef7", "#cfeaa5", "#f7e0a3", "#ef9da2",
  "#c9a8f0", "#9fdde6", "#f7c59f", "#b8bfd6",
];

const INTERVALLE = {
  1: "monatlich",
  3: "vierteljährlich",
  6: "halbjährlich",
  12: "jährlich",
};
const ZAHLUNGSARTEN = [
  "💳 EC-Karte",
  "💶 Bar",
  "📲 PayPal",
  "🏦 Online-Überweisung",
  "🍎 Apple Pay",
  "🧾 Lastschrift",
  "Google Pay",
  "Wero",
];

// ---------- Hilfsfunktionen ----------
function heute() {
  const d = new Date();
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function datumDE(datum) {
  return datum.slice(8, 10) + "." + datum.slice(5, 7) + "." + datum.slice(0, 4);
}

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

function tageBis(datum) {
  const a = new Date(heute() + "T00:00:00");
  const b = new Date(datum + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function euro(zahl) {
  return zahl.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// Kopie eines Objekts (damit die Standardliste unverändert bleibt)
function kopie(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------- Gespeicherte Daten ----------
let buchungen = JSON.parse(localStorage.getItem("buchungen")) || [];
let budgets = JSON.parse(localStorage.getItem("budgets")) || {};
let regeln = JSON.parse(localStorage.getItem("regeln")) || [];
let sparziele = JSON.parse(localStorage.getItem("sparziele")) || [];
let monatsziel = Number(localStorage.getItem("monatsziel")) || 0;
let KATEGORIEN = JSON.parse(localStorage.getItem("kategorien")) || kopie(STANDARD_KATEGORIEN);
let monat = heute().slice(0, 7);

// Feste Kategorien, die andere Funktionen brauchen
function istFest(typ, name) {
  return name === "📦 Sonstiges" || (typ === "ausgabe" && name === "🛡️ Versicherungen");
}

// Sorgt dafür, dass die Kategorienlisten vollständig und die festen Einträge da sind
function kategorienPruefen() {
  if (!KATEGORIEN || !Array.isArray(KATEGORIEN.ausgabe)) {
    KATEGORIEN = KATEGORIEN || {};
    KATEGORIEN.ausgabe = kopie(STANDARD_KATEGORIEN.ausgabe);
  }
  if (!Array.isArray(KATEGORIEN.einnahme)) {
    KATEGORIEN.einnahme = kopie(STANDARD_KATEGORIEN.einnahme);
  }
  ["📦 Sonstiges", "🛡️ Versicherungen"].forEach(function (k) {
    if (!KATEGORIEN.ausgabe.includes(k)) KATEGORIEN.ausgabe.push(k);
  });
  if (!KATEGORIEN.einnahme.includes("📦 Sonstiges")) {
    KATEGORIEN.einnahme.push("📦 Sonstiges");
  }
}

kategorienPruefen();

buchungen.forEach(function (b) {
  if (!b.datum) b.datum = heute();
});

function speichern() {
  localStorage.setItem("buchungen", JSON.stringify(buchungen));
  localStorage.setItem("budgets", JSON.stringify(budgets));
  localStorage.setItem("regeln", JSON.stringify(regeln));
  localStorage.setItem("sparziele", JSON.stringify(sparziele));
  localStorage.setItem("kategorien", JSON.stringify(KATEGORIEN));
  localStorage.setItem("monatsziel", String(monatsziel));
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
const zahlungFeld = document.getElementById("zahlung");
const knopf = document.getElementById("hinzufuegen");
const monatName = document.getElementById("monatName");
const summeEin = document.getElementById("summeEin");
const summeAus = document.getElementById("summeAus");
const donut = document.getElementById("donut");
const legende = document.getElementById("legende");
const budgetListe = document.getElementById("budgetListe");
const zahlungListe = document.getElementById("zahlungListe");
const verlauf = document.getElementById("verlauf");
const verlaufInfo = document.getElementById("verlaufInfo");

const katTypWahl = document.getElementById("katTypWahl");
const katListe = document.getElementById("katListe");
const katNeu = document.getElementById("katNeu");
const katKnopf = document.getElementById("katKnopf");

const wTyp = document.getElementById("wTyp");
const wKategorie = document.getElementById("wKategorie");
const wBeschreibung = document.getElementById("wBeschreibung");
const wBetrag = document.getElementById("wBetrag");
const wIntervall = document.getElementById("wIntervall");
const wStart = document.getElementById("wStart");
const wZahlung = document.getElementById("wZahlung");
const wKnopf = document.getElementById("wKnopf");
const wListe = document.getElementById("wListe");

const vName = document.getElementById("vName");
const vBetrag = document.getElementById("vBetrag");
const vIntervall = document.getElementById("vIntervall");
const vStart = document.getElementById("vStart");
const vKuendigung = document.getElementById("vKuendigung");
const vZahlung = document.getElementById("vZahlung");
const vKnopf = document.getElementById("vKnopf");
const vListe = document.getElementById("vListe");
const vSummeMonat = document.getElementById("vSummeMonat");
const vSummeJahr = document.getElementById("vSummeJahr");

const zName = document.getElementById("zName");
const zBetrag = document.getElementById("zBetrag");
const zStart = document.getElementById("zStart");
const zDatum = document.getElementById("zDatum");
const zKnopf = document.getElementById("zKnopf");
const zListe = document.getElementById("zListe");
const zSummeGespart = document.getElementById("zSummeGespart");
const zSummeZiel = document.getElementById("zSummeZiel");

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

// ---------- Kategorien in den Auswahlfeldern ----------
function kategorienLaden(typEl, katEl) {
  const alt = katEl.value; // aktuelle Auswahl merken
  katEl.innerHTML = "";
  KATEGORIEN[typEl.value].forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    katEl.appendChild(option);
  });
  if (KATEGORIEN[typEl.value].includes(alt)) katEl.value = alt;
}

function kategorienAktualisieren() {
  kategorienLaden(typFeld, kategorieFeld);
  kategorienLaden(wTyp, wKategorie);
  filterOptionenLaden();
}

typFeld.addEventListener("change", function () {
  kategorienLaden(typFeld, kategorieFeld);
});
wTyp.addEventListener("change", function () {
  kategorienLaden(wTyp, wKategorie);
});
// ---------- Zahlungsarten in den Auswahlfeldern ----------
function zahlungenLaden() {
  [zahlungFeld, wZahlung, vZahlung].forEach(function (feld) {
    feld.innerHTML = "";
    ZAHLUNGSARTEN.forEach(function (art) {
      const option = document.createElement("option");
      option.value = art;
      option.textContent = art;
      feld.appendChild(option);
    });
  });
}
// ---------- Kategorien verwalten ----------
function kategorienZeichnen() {
  katListe.innerHTML = "";
  const typ = katTypWahl.value;

  KATEGORIEN[typ].forEach(function (name) {
    const eintrag = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = name;

    const rechts = document.createElement("span");
    rechts.className = "rechts";

    if (istFest(typ, name)) {
      const fest = document.createElement("small");
      fest.className = "kategorie-label";
      fest.textContent = "fest";
      rechts.appendChild(fest);
    } else {
      const bearbeiten = document.createElement("button");
      bearbeiten.textContent = "✎";
      bearbeiten.className = "loeschen";
      bearbeiten.addEventListener("click", function () {
        kategorieUmbenennen(typ, name);
      });

      const loeschen = document.createElement("button");
      loeschen.textContent = "✕";
      loeschen.className = "loeschen";
      loeschen.addEventListener("click", function () {
        kategorieLoeschen(typ, name);
      });

      rechts.append(bearbeiten, loeschen);
    }

    eintrag.append(label, rechts);
    katListe.appendChild(eintrag);
  });
}

function kategorieUmbenennen(typ, alt) {
  const eingabe = prompt("Neuer Name für die Kategorie:", alt);
  if (eingabe === null) return;
  const neu = eingabe.trim();
  if (neu === "" || neu === alt) return;
  if (KATEGORIEN[typ].includes(neu)) {
    alert("Diese Kategorie gibt es schon.");
    return;
  }

  KATEGORIEN[typ][KATEGORIEN[typ].indexOf(alt)] = neu;

  buchungen.forEach(function (b) {
    if (b.typ === typ && b.kategorie === alt) b.kategorie = neu;
  });
  regeln.forEach(function (r) {
    if (r.typ === typ && r.kategorie === alt) r.kategorie = neu;
  });
  if (typ === "ausgabe" && budgets[alt] !== undefined) {
    budgets[neu] = budgets[alt];
    delete budgets[alt];
  }

  speichern();
  kategorienAktualisieren();
  anzeigen();
}

function kategorieLoeschen(typ, name) {
  const ok = confirm(
    "„" + name + "“ löschen? Zugehörige Buchungen werden „📦 Sonstiges“ zugeordnet."
  );
  if (!ok) return;

  KATEGORIEN[typ] = KATEGORIEN[typ].filter(function (k) {
    return k !== name;
  });

  buchungen.forEach(function (b) {
    if (b.typ === typ && b.kategorie === name) b.kategorie = "📦 Sonstiges";
  });
  regeln.forEach(function (r) {
    if (r.typ === typ && r.kategorie === name) r.kategorie = "📦 Sonstiges";
  });
  if (typ === "ausgabe") delete budgets[name];

  speichern();
  kategorienAktualisieren();
  anzeigen();
}

katKnopf.addEventListener("click", function () {
  const typ = katTypWahl.value;
  const name = katNeu.value.trim();
  if (name === "") return;
  if (KATEGORIEN[typ].includes(name)) {
    alert("Diese Kategorie gibt es schon.");
    return;
  }

  // vor "Sonstiges" einfügen, damit das immer am Ende bleibt
  const pos = KATEGORIEN[typ].indexOf("📦 Sonstiges");
  KATEGORIEN[typ].splice(pos, 0, name);

  katNeu.value = "";
  speichern();
  kategorienAktualisieren();
  anzeigen();
});

katNeu.addEventListener("keydown", function (e) {
  if (e.key === "Enter") katKnopf.click();
});

katTypWahl.addEventListener("change", kategorienZeichnen);

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
      if (datum > heute()) break;

      if (!r.erzeugt.includes(datum)) {
        buchungen.push({
          typ: r.typ,
          kategorie: r.kategorie,
          beschreibung: r.beschreibung,
          betrag: r.betrag,
          zahlung: r.zahlung,
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
  svg += '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e6d2f7" stroke-width="5"></circle>';

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
  svg += '<text x="21" y="21.8" text-anchor="middle" fill="#3d3560" font-size="3.4" font-weight="700">' + mitte + "</text>";
  svg += "</svg>";
  donut.innerHTML = svg;
}
// ---------- Ausgaben nach Zahlungsart ----------
function zahlungenZeichnen(ausgaben) {
  zahlungListe.innerHTML = "";

  const summen = {};
  let gesamt = 0;
  ausgaben.forEach(function (b) {
    const art = b.zahlung || "Ohne Angabe";
    summen[art] = (summen[art] || 0) + b.betrag;
    gesamt += b.betrag;
  });

  const eintraege = Object.entries(summen).sort(function (a, b) {
    return b[1] - a[1];
  });

  if (eintraege.length === 0) {
    zahlungListe.appendChild(leerZeile("Keine Ausgaben in diesem Monat."));
    return;
  }

  eintraege.forEach(function (eintrag) {
    const anteil = (eintrag[1] / gesamt) * 100;

    const zeile = document.createElement("li");
    zeile.className = "budget-zeile";

    const kopf = document.createElement("div");
    kopf.className = "budget-kopf";
    const name = document.createElement("span");
    name.textContent = eintrag[0];
    const wert = document.createElement("span");
    wert.textContent = euro(eintrag[1]) + " · " + Math.round(anteil) + " %";
    kopf.append(name, wert);

    const spur = document.createElement("div");
    spur.className = "balken";
    const fuellung = document.createElement("div");
    fuellung.className = "fuellung akzent";
    fuellung.style.width = anteil + "%";
    spur.appendChild(fuellung);

    zeile.append(kopf, spur);
    zahlungListe.appendChild(zeile);
  });
}
// ---------- Verlauf: Balkendiagramm der letzten 6 Monate ----------
function verlaufZeichnen() {
  const teile = monat.split("-");
  const monate = [];

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
    svg += '<rect x="' + x + '" y="' + (110 - hEin) + '" width="14" height="' + hEin + '" rx="3" fill="#cfeaa5"></rect>';
    svg += '<rect x="' + (x + 16) + '" y="' + (110 - hAus) + '" width="14" height="' + hAus + '" rx="3" fill="#ef9da2"></rect>';
    svg += '<text x="' + (x + 15) + '" y="130" text-anchor="middle" fill="#6f68a3" font-size="10">' + m.label + "</text>";
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
      speichern();
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

// ---------- Sparziele ----------
function sparzielAendern(z, feld, richtung) {
  const wert = parseFloat(feld.value);
  if (isNaN(wert) || wert <= 0) return;
  z.gespart = Math.max(0, Math.round((z.gespart + richtung * wert) * 100) / 100);
  speichern();
  anzeigen();
}

function sparzielBearbeiten(z) {
  const name = prompt("Name des Sparziels:", z.name);
  if (name === null) return;
  const zielText = prompt("Zielbetrag in €:", String(z.ziel));
  if (zielText === null) return;

  const ziel = parseFloat(zielText.replace(",", "."));
  if (name.trim() !== "") z.name = name.trim();
  if (!isNaN(ziel) && ziel > 0) z.ziel = ziel;

  speichern();
  anzeigen();
}

function sparzieleZeichnen() {
  zListe.innerHTML = "";
  let gesamtGespart = 0;
  let gesamtZiel = 0;

  if (sparziele.length === 0) {
    zListe.appendChild(leerZeile("Noch keine Sparziele."));
  }

  sparziele.forEach(function (z) {
    gesamtGespart += z.gespart;
    gesamtZiel += z.ziel;

    const zeile = document.createElement("li");
    zeile.className = "budget-zeile";

    // Kopf: Name und Knöpfe
    const kopf = document.createElement("div");
    kopf.className = "budget-kopf";

    const name = document.createElement("span");
    name.textContent = z.name;

    const knoepfe = document.createElement("span");
    knoepfe.className = "rechts";

    const bearbeiten = document.createElement("button");
    bearbeiten.textContent = "✎";
    bearbeiten.className = "loeschen";
    bearbeiten.addEventListener("click", function () {
      sparzielBearbeiten(z);
    });

    const loeschen = document.createElement("button");
    loeschen.textContent = "✕";
    loeschen.className = "loeschen";
    loeschen.addEventListener("click", function () {
      const ok = confirm("Sparziel „" + z.name + "“ löschen?");
      if (!ok) return;
      sparziele.splice(sparziele.indexOf(z), 1);
      speichern();
      anzeigen();
    });

    knoepfe.append(bearbeiten, loeschen);
    kopf.append(name, knoepfe);
    zeile.appendChild(kopf);

    // Fortschrittsbalken
    const anteil = (z.gespart / z.ziel) * 100;
    const erreicht = anteil >= 100;

    const spur = document.createElement("div");
    spur.className = "balken";
    const fuellung = document.createElement("div");
    fuellung.className = "fuellung" + (erreicht ? "" : " akzent");
    fuellung.style.width = Math.min(anteil, 100) + "%";
    spur.appendChild(fuellung);
    zeile.appendChild(spur);

    // Infotext
    const info = document.createElement("small");
    info.className = "kategorie-label";
    info.textContent =
      euro(z.gespart) + " von " + euro(z.ziel) + " · " + Math.floor(anteil) + " %";
    zeile.appendChild(info);

    const rest = z.ziel - z.gespart;
    const extra = document.createElement("small");
    extra.className = "kategorie-label";

    if (erreicht) {
      extra.textContent = "🎉 Ziel erreicht!";
      zeile.appendChild(extra);
    } else {
      let text = "Noch " + euro(rest);
      if (z.datum) {
        const tage = tageBis(z.datum);
        if (tage < 0) {
          text += " · Zieldatum " + datumDE(z.datum) + " überschritten";
          extra.classList.add("warnung");
        } else {
          const monateRest = Math.max(1, Math.ceil(tage / 30.44));
          text += " · ca. " + euro(rest / monateRest) + " pro Monat bis " + datumDE(z.datum);
        }
      }
      extra.textContent = text;
      zeile.appendChild(extra);
    }

    // Einzahlen / Entnehmen
    const aktion = document.createElement("div");
    aktion.className = "ziel-aktion";

    const feld = document.createElement("input");
    feld.type = "number";
    feld.min = "0";
    feld.step = "0.01";
    feld.placeholder = "Betrag €";

    const plus = document.createElement("button");
    plus.textContent = "+ Einzahlen";
    plus.addEventListener("click", function () {
      sparzielAendern(z, feld, 1);
    });

    const minus = document.createElement("button");
    minus.textContent = "− Entnehmen";
    minus.className = "zweit";
    minus.addEventListener("click", function () {
      sparzielAendern(z, feld, -1);
    });

    aktion.append(feld, plus, minus);
    zeile.appendChild(aktion);

    zListe.appendChild(zeile);
  });

  zSummeGespart.textContent = euro(gesamtGespart);
  zSummeZiel.textContent = euro(gesamtZiel);
}
// ---------- Monatsabschluss ----------
const abTitel = document.getElementById("abTitel");
const abUebrig = document.getElementById("abUebrig");
const abLabel = document.getElementById("abLabel");
const abSpur = document.getElementById("abSpur");
const abFuellung = document.getElementById("abFuellung");
const abZielInfo = document.getElementById("abZielInfo");
const abText = document.getElementById("abText");
const abDetails = document.getElementById("abDetails");
const abZiel = document.getElementById("abZiel");

// Texte für abgeschlossene Monate. {x} wird durch den Betrag ersetzt.
// Hier kannst du gern eigene Sätze ergänzen.
const TEXTE_ABGESCHLOSSEN = {
  top: [
    "Wow, du hast dein Ziel weit übertroffen! Mit {x} übrig darfst du dir heute etwas Schönes gönnen. 🌟",
    "Starker Monat! {x} sind übrig geblieben, richtig gut gemacht. 🎉",
  ],
  ziel: [
    "Ziel erreicht! {x} sind übrig geblieben. Genau so geht das. ✨",
    "Geschafft, du hast dein Monatsziel erreicht. Sei stolz auf dich! 💜",
  ],
  teil: [
    "Ein Plus von {x}. Dein Ziel hast du knapp verfehlt, aber du warst im grünen Bereich. Nächsten Monat klappt's! 🌱",
    "Es ist etwas übrig geblieben ({x}). Jeder Euro zählt, du bist auf einem guten Weg. 🌸",
  ],
  plus: [
    "Am Ende sind {x} übrig geblieben. Ein solider Monat! 🌿 Leg unten ein Ziel fest, dann siehst du, wie nah du dran bist.",
    "Du hast {x} übrig behalten, das ist ein gutes Ergebnis. 🌷",
  ],
  null: [
    "Punktlandung: Einnahmen und Ausgaben haben sich genau die Waage gehalten. 🎯",
  ],
  minus: [
    "Diesmal war es ein Minus von {x}. Das passiert jedem mal. Schau dir die größte Ausgaben-Kategorie an, dort steckt oft das meiste Potenzial. 🌷",
    "Ein Minus von {x} ist kein Beinbruch. Neuer Monat, neue Chance! 💪",
  ],
};

// Texte für den laufenden Monat (Zwischenstand)
const TEXTE_LAUFEND = {
  top: ["Läuft super: Du liegst jetzt schon weit über deinem Ziel ({x} übrig). Bleib dran! 🌟"],
  ziel: ["Dein Ziel hast du schon erreicht, {x} sind bisher übrig. Weiter so! ✨"],
  teil: ["Bisher {x} übrig. Du bist auf dem Weg zu deinem Ziel, bleib dran. 🌱"],
  plus: ["Bisher {x} übrig. Ein guter Zwischenstand! 🌿"],
  null: ["Aktuell stehen Einnahmen und Ausgaben genau gleich. Achte auf die nächsten Ausgaben. 🎯"],
  minus: ["Aktuell im Minus ({x}). Noch ist der Monat nicht vorbei, du kannst gegensteuern. 💪"],
};

// Eine Zeile mit Bezeichnung und Wert in der Kennzahlen-Liste
function abDetail(name, wert, klasse) {
  const zeile = document.createElement("li");
  const links = document.createElement("span");
  links.textContent = name;
  const rechts = document.createElement("span");
  rechts.textContent = wert;
  if (klasse) rechts.className = klasse;
  zeile.append(links, rechts);
  abDetails.appendChild(zeile);
}

function abschlussZeichnen(imMonat, ein, aus) {
  const aktuell = heute().slice(0, 7);
  const laufend = monat === aktuell;
  const zukunft = monat > aktuell;
  const uebrig = Math.round((ein - aus) * 100) / 100;

  abZiel.value = monatsziel || "";
  abDetails.innerHTML = "";
  abTitel.textContent = laufend ? "Zwischenstand" : "Monatsabschluss";

  // Nichts zu zeigen
  if (zukunft || imMonat.length === 0) {
    abUebrig.textContent = "–";
    abUebrig.className = "saldo abschluss-zahl";
    abLabel.textContent = "übrig";
    abSpur.hidden = true;
    abZielInfo.textContent = "";
    abText.textContent = zukunft
      ? "Dieser Monat hat noch nicht begonnen."
      : "In diesem Monat gibt es noch keine Buchungen.";
    return;
  }

  abUebrig.textContent = euro(uebrig);
  abUebrig.className = "saldo abschluss-zahl " + (uebrig < 0 ? "ausgabe" : "einnahme");
  abLabel.textContent = (laufend ? "bisher übrig" : "übrig geblieben") + " (Einnahmen − Ausgaben)";

  // Fortschritt zum Monatsziel
  if (monatsziel > 0) {
    abSpur.hidden = false;
    const anteil = Math.max(0, (uebrig / monatsziel) * 100);
    abFuellung.style.width = Math.min(anteil, 100) + "%";
    abFuellung.className = "fuellung" + (anteil >= 100 ? "" : " akzent");
    abZielInfo.textContent =
      uebrig >= monatsziel
        ? "Ziel von " + euro(monatsziel) + " erreicht ✓"
        : "Ziel: " + euro(monatsziel) + " · noch " + euro(monatsziel - uebrig) + " bis dahin";
  } else {
    abSpur.hidden = true;
    abZielInfo.textContent = "";
  }

  // Welche Stufe passt?
  let status;
  if (uebrig < 0) status = "minus";
  else if (uebrig === 0) status = "null";
  else if (monatsziel > 0 && uebrig >= monatsziel * 1.5) status = "top";
  else if (monatsziel > 0 && uebrig >= monatsziel) status = "ziel";
  else if (monatsziel > 0) status = "teil";
  else status = "plus";

  // Text auswählen (pro Monat immer derselbe, damit er nicht dauernd wechselt)
  const varianten = (laufend ? TEXTE_LAUFEND : TEXTE_ABGESCHLOSSEN)[status];
  const nr = Number(monat.replace("-", "")) % varianten.length;
  abText.textContent = varianten[nr].replace("{x}", euro(Math.abs(uebrig)));

  // Kennzahlen
  if (ein > 0) {
    abDetail("Sparquote", Math.round((uebrig / ein) * 100) + " % der Einnahmen");
  }

  const ausgaben = imMonat.filter(function (b) {
    return b.typ === "ausgabe";
  });
  if (ausgaben.length > 0) {
    let groesste = ausgaben[0];
    const summen = {};
    ausgaben.forEach(function (b) {
      if (b.betrag > groesste.betrag) groesste = b;
      const k = b.kategorie || "📦 Sonstiges";
      summen[k] = (summen[k] || 0) + b.betrag;
    });
    const top = Object.entries(summen).sort(function (a, b) {
      return b[1] - a[1];
    })[0];
    abDetail("Größte Ausgabe", groesste.beschreibung + " · " + euro(groesste.betrag));
    abDetail("Meiste Ausgaben", top[0] + " · " + euro(top[1]));
  }

  // Vergleich mit dem Vormonat (nur bei abgeschlossenen Monaten)
  if (!laufend) {
    const vorKey = addMonate(monat + "-01", -1).slice(0, 7);
    let vorAus = 0;
    buchungen.forEach(function (b) {
      if (b.typ === "ausgabe" && b.datum.startsWith(vorKey)) vorAus += b.betrag;
    });
    if (vorAus > 0) {
      const diff = aus - vorAus;
      abDetail(
        "Ausgaben zum Vormonat",
        (diff <= 0 ? "−" : "+") + euro(Math.abs(diff)),
        diff <= 0 ? "einnahme" : "ausgabe"
      );
    }
  }
}
// ---------- Buchungen: Suche, Filter und Bearbeiten ----------
const suchFeld = document.getElementById("suche");
const filterTyp = document.getElementById("filterTyp");
const filterKategorie = document.getElementById("filterKategorie");
const filterZahlung = document.getElementById("filterZahlung");
const filterAlle = document.getElementById("filterAlle");
const filterReset = document.getElementById("filterReset");
const listeInfo = document.getElementById("listeInfo");

const editDialog = document.getElementById("editDialog");
const eTyp = document.getElementById("eTyp");
const eKategorie = document.getElementById("eKategorie");
const eZahlung = document.getElementById("eZahlung");
const eBeschreibung = document.getElementById("eBeschreibung");
const eBetrag = document.getElementById("eBetrag");
const eDatum = document.getElementById("eDatum");
const eSpeichern = document.getElementById("eSpeichern");
const eAbbrechen = document.getElementById("eAbbrechen");

let bearbeiteteBuchung = null;

function optionHinzufuegen(feld, wert, text) {
  const option = document.createElement("option");
  option.value = wert;
  option.textContent = text;
  feld.appendChild(option);
}

// Auswahlfelder der Filter füllen (Auswahl bleibt erhalten, wenn möglich)
function filterOptionenLaden() {
  const altK = filterKategorie.value;
  const altZ = filterZahlung.value;

  filterKategorie.innerHTML = "";
  optionHinzufuegen(filterKategorie, "", "Alle Kategorien");
  const namen = [];
  ["ausgabe", "einnahme"].forEach(function (typ) {
    KATEGORIEN[typ].forEach(function (n) {
      if (!namen.includes(n)) namen.push(n);
    });
  });
  namen.forEach(function (n) {
    optionHinzufuegen(filterKategorie, n, n);
  });
  filterKategorie.value = altK;
  if (filterKategorie.selectedIndex === -1) filterKategorie.selectedIndex = 0;

  filterZahlung.innerHTML = "";
  optionHinzufuegen(filterZahlung, "", "Alle Zahlungsarten");
  ZAHLUNGSARTEN.forEach(function (art) {
    optionHinzufuegen(filterZahlung, art, art);
  });
  optionHinzufuegen(filterZahlung, "__ohne", "Ohne Angabe");
  filterZahlung.value = altZ;
  if (filterZahlung.selectedIndex === -1) filterZahlung.selectedIndex = 0;
}

function filterAktiv() {
  return (
    suchFeld.value.trim() !== "" ||
    filterTyp.value !== "" ||
    filterKategorie.value !== "" ||
    filterZahlung.value !== "" ||
    filterAlle.checked
  );
}

// Welche Buchungen passen zu Suche und Filtern?
function gefiltert(imMonat) {
  const quelle = filterAlle.checked ? buchungen : imMonat;
  const suche = suchFeld.value.trim().toLowerCase();

  return quelle.filter(function (b) {
    if (filterTyp.value && b.typ !== filterTyp.value) return false;
    if (filterKategorie.value && (b.kategorie || "📦 Sonstiges") !== filterKategorie.value) {
      return false;
    }
    if (filterZahlung.value === "__ohne") {
      if (b.zahlung) return false;
    } else if (filterZahlung.value && b.zahlung !== filterZahlung.value) {
      return false;
    }
    if (suche) {
      const text = (
        b.beschreibung + " " +
        (b.kategorie || "") + " " +
        (b.zahlung || "") + " " +
        String(b.betrag).replace(".", ",")
      ).toLowerCase();
      if (!text.includes(suche)) return false;
    }
    return true;
  });
}

// Die Buchungsliste zeichnen
function listeZeichnen() {
  const imMonat = buchungen.filter(function (b) {
    return b.datum.startsWith(monat);
  });
  const treffer = gefiltert(imMonat);
  const aktiv = filterAktiv();

  let sumE = 0;
  let sumA = 0;
  treffer.forEach(function (b) {
    if (b.typ === "einnahme") sumE += b.betrag;
    else sumA += b.betrag;
  });

  if (aktiv) {
    listeInfo.textContent =
      treffer.length + " Treffer · Einnahmen " + euro(sumE) + " · Ausgaben " + euro(sumA);
  } else {
    listeInfo.textContent =
      treffer.length === 1 ? "1 Buchung in diesem Monat" : treffer.length + " Buchungen in diesem Monat";
  }
  filterReset.hidden = !aktiv;

  liste.innerHTML = "";
  if (treffer.length === 0) {
    liste.appendChild(leerZeile(aktiv ? "Keine Treffer." : "Keine Buchungen in diesem Monat."));
    return;
  }

  treffer.forEach(function (b) {
    const eintrag = document.createElement("li");

    const links = document.createElement("div");
    const name = document.createElement("div");
    name.textContent = b.beschreibung;
    const kat = document.createElement("small");
    kat.className = "kategorie-label";
    const datumText = filterAlle.checked
      ? datumDE(b.datum)
      : b.datum.slice(8, 10) + "." + b.datum.slice(5, 7) + ".";
    kat.textContent =
      (b.kategorie || "📦 Sonstiges") + " · " + datumText + (b.zahlung ? " · " + b.zahlung : "");
    links.append(name, kat);

    const betrag = document.createElement("span");
    betrag.textContent = (b.typ === "ausgabe" ? "−" : "+") + euro(b.betrag);
    betrag.className = b.typ;

    const bearbeitenKnopf = document.createElement("button");
    bearbeitenKnopf.textContent = "✎";
    bearbeitenKnopf.className = "loeschen";
    bearbeitenKnopf.addEventListener("click", function () {
      bearbeiten(b);
    });

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
    rechts.append(betrag, bearbeitenKnopf, loeschen);

    eintrag.append(links, rechts);
    liste.appendChild(eintrag);
  });
}

// Filter bedienen
suchFeld.addEventListener("input", listeZeichnen);
[filterTyp, filterKategorie, filterZahlung, filterAlle].forEach(function (el) {
  el.addEventListener("change", listeZeichnen);
});

filterReset.addEventListener("click", function () {
  suchFeld.value = "";
  filterTyp.selectedIndex = 0;
  filterKategorie.selectedIndex = 0;
  filterZahlung.selectedIndex = 0;
  filterAlle.checked = false;
  listeZeichnen();
});

// ----- Bearbeiten -----
function bearbeiten(b) {
  bearbeiteteBuchung = b;

  eTyp.value = b.typ;
  kategorienLaden(eTyp, eKategorie);
  eKategorie.value = KATEGORIEN[b.typ].includes(b.kategorie) ? b.kategorie : "📦 Sonstiges";

  eZahlung.innerHTML = "";
  optionHinzufuegen(eZahlung, "", "Keine Angabe");
  ZAHLUNGSARTEN.forEach(function (art) {
    optionHinzufuegen(eZahlung, art, art);
  });
  if (b.zahlung && !ZAHLUNGSARTEN.includes(b.zahlung)) {
    optionHinzufuegen(eZahlung, b.zahlung, b.zahlung);
  }
  eZahlung.value = b.zahlung || "";

  eBeschreibung.value = b.beschreibung;
  eBetrag.value = b.betrag;
  eDatum.value = b.datum;
  editDialog.showModal();
}

eTyp.addEventListener("change", function () {
  kategorienLaden(eTyp, eKategorie);
});

eAbbrechen.addEventListener("click", function () {
  editDialog.close();
});

eSpeichern.addEventListener("click", function () {
  const beschreibung = eBeschreibung.value.trim();
  const betrag = parseFloat(eBetrag.value);

  if (beschreibung === "" || isNaN(betrag) || betrag <= 0 || !eDatum.value) {
    alert("Bitte Beschreibung, Betrag und Datum ausfüllen.");
    return;
  }

  const b = bearbeiteteBuchung;
  b.typ = eTyp.value;
  b.kategorie = eKategorie.value;
  b.beschreibung = beschreibung;
  b.betrag = betrag;
  b.datum = eDatum.value;
  if (eZahlung.value) b.zahlung = eZahlung.value;
  else delete b.zahlung;

  monat = b.datum.slice(0, 7); // zum Monat der geänderten Buchung springen
  sortieren();
  speichern();
  editDialog.close();
  anzeigen();
});
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
    zahlungenZeichnen(ausgabenImMonat);
  budgetsZeichnen(ausgabenImMonat);
  verlaufZeichnen();
  abschlussZeichnen(imMonat, ein, aus);   // <-- NEU
  kategorienZeichnen();
  regelnZeichnen();
  sparzieleZeichnen();
  backupZeichnen();
  listeZeichnen();
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
    zahlung: zahlungFeld.value,
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
    zahlung: wZahlung.value,
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
    zahlung: vZahlung.value,
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

// ---------- Neues Sparziel ----------
zKnopf.addEventListener("click", function () {
  const name = zName.value.trim();
  const ziel = parseFloat(zBetrag.value);
  const start = parseFloat(zStart.value);

  if (name === "" || isNaN(ziel) || ziel <= 0) {
    return;
  }

  sparziele.push({
    id: Date.now(),
    name: name,
    ziel: ziel,
    gespart: isNaN(start) || start < 0 ? 0 : start,
    datum: zDatum.value || "",
  });

  zName.value = "";
  zBetrag.value = "";
  zStart.value = "";
  zDatum.value = "";
  speichern();
  anzeigen();
});

// ---------- Backup ----------
const BACKUP_ERINNERUNG_TAGE = 7; // nach so vielen Tagen erinnert die App
const MAX_SNAPSHOTS = 10;

const teilenKnopf = document.getElementById("teilenKnopf");
const exportKnopf = document.getElementById("exportKnopf");
const importKnopf = document.getElementById("importKnopf");
const importDatei = document.getElementById("importDatei");
const backupMeldung = document.getElementById("backupMeldung");
const backupStatus = document.getElementById("backupStatus");
const backupHinweis = document.getElementById("backupHinweis");
const backupHinweisText = document.getElementById("backupHinweisText");
const backupHinweisKnopf = document.getElementById("backupHinweisKnopf");
const snapshotListe = document.getElementById("snapshotListe");

// Alle Daten in einem Paket
function datenPaket() {
  return {
    buchungen: buchungen,
    budgets: budgets,
    regeln: regeln,
    sparziele: sparziele,
    kategorien: KATEGORIEN,
    monatsziel: monatsziel,
  };
}

// Ein Datenpaket einspielen (für Import und Wiederherstellung)
function datenAnwenden(daten) {
  buchungen = Array.isArray(daten.buchungen) ? daten.buchungen : [];
  budgets = daten.budgets || {};
  regeln = Array.isArray(daten.regeln) ? daten.regeln : [];
  sparziele = Array.isArray(daten.sparziele) ? daten.sparziele : [];
  monatsziel = Number(daten.monatsziel) || 0;
  KATEGORIEN =
    daten.kategorien && typeof daten.kategorien === "object"
      ? daten.kategorien
      : kopie(STANDARD_KATEGORIEN);
  kategorienPruefen();

  buchungen.forEach(function (b) {
    if (!b.datum) b.datum = heute();
  });
  regeln.forEach(function (r) {
    if (!r.erzeugt) r.erzeugt = [];
  });

  speichern();
  kategorienAktualisieren();
  anzeigen();
}

// ----- Backup-Datei erzeugen, teilen, herunterladen -----
function backupDatei() {
  const text = JSON.stringify(datenPaket(), null, 2);
  return new File([text], "budget-backup-" + heute() + ".json", { type: "application/json" });
}

function herunterladen(datei) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(datei);
  link.download = datei.name;
  link.click();
  setTimeout(function () {
    URL.revokeObjectURL(link.href);
  }, 1000);
}

function backupMerken() {
  localStorage.setItem("letztesBackup", heute());
  backupZeichnen();
}

teilenKnopf.addEventListener("click", async function () {
  const datei = backupDatei();
  try {
    if (navigator.canShare && navigator.canShare({ files: [datei] })) {
      await navigator.share({ files: [datei], title: "Budget-Backup " + heute() });
      backupMerken();
      backupMeldung.textContent = "Backup geteilt.";
      return;
    }
  } catch (fehler) {
    if (fehler && fehler.name === "AbortError") return; // du hast abgebrochen
  }
  herunterladen(datei);
  backupMerken();
  backupMeldung.textContent = "Teilen wird hier nicht unterstützt, die Datei wurde heruntergeladen.";
});

exportKnopf.addEventListener("click", function () {
  herunterladen(backupDatei());
  backupMerken();
  backupMeldung.textContent = "Backup gespeichert (" + buchungen.length + " Buchungen).";
});

backupHinweisKnopf.addEventListener("click", function () {
  teilenKnopf.click();
});

// ----- Import -----
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

      snapshotAnlegen("vor Import");
      datenAnwenden(daten);
      backupMeldung.textContent = "Backup geladen (" + buchungen.length + " Buchungen).";
    } catch (fehler) {
      backupMeldung.textContent = "Diese Datei konnte nicht gelesen werden.";
    }
    importDatei.value = "";
  };
  leser.readAsText(datei);
});

// ----- Automatische Sicherungen im Browser -----
function snapshotsLaden() {
  try {
    return JSON.parse(localStorage.getItem("snapshots")) || [];
  } catch (fehler) {
    return [];
  }
}

// Ohne Grund: höchstens einmal pro Tag. Mit Grund: immer (z. B. vor Import oder Neustart).
function snapshotAnlegen(grund) {
  const hatDaten = buchungen.length > 0 || regeln.length > 0 || sparziele.length > 0;
  if (!hatDaten) return;

  const liste = snapshotsLaden();
  if (!grund && liste.length > 0 && liste[0].datum === heute() && !liste[0].grund) return;

  liste.unshift({ datum: heute(), grund: grund || "", daten: datenPaket() });

  try {
    localStorage.setItem("snapshots", JSON.stringify(liste.slice(0, MAX_SNAPSHOTS)));
  } catch (fehler) {
    // Speicher voll: dann eben keine Sicherung
  }
}

function snapshotsZeichnen() {
  snapshotListe.innerHTML = "";
  const liste = snapshotsLaden();

  if (liste.length === 0) {
    snapshotListe.appendChild(leerZeile("Noch keine automatischen Sicherungen."));
    return;
  }

  liste.forEach(function (s) {
    const zeile = document.createElement("li");

    const links = document.createElement("div");
    const name = document.createElement("div");
    name.textContent = datumDE(s.datum) + (s.grund ? " · " + s.grund : "");
    const info = document.createElement("small");
    info.className = "kategorie-label";
    info.textContent = s.daten.buchungen.length + " Buchungen";
    links.append(name, info);

    const knopfWieder = document.createElement("button");
    knopfWieder.textContent = "Wiederherstellen";
    knopfWieder.className = "zweit";
    knopfWieder.addEventListener("click", function () {
      const ok = confirm(
        "Stand vom " + datumDE(s.datum) + " wiederherstellen? Die aktuellen Daten werden ersetzt."
      );
      if (!ok) return;
      snapshotAnlegen("vor Wiederherstellung");
      datenAnwenden(s.daten);
      backupMeldung.textContent = "Sicherung vom " + datumDE(s.datum) + " wiederhergestellt.";
    });

    zeile.append(links, knopfWieder);
    snapshotListe.appendChild(zeile);
  });
}

// ----- Status und Erinnerung -----
function backupZeichnen() {
  const letztes = localStorage.getItem("letztesBackup");
  const hatDaten = buchungen.length > 0 || regeln.length > 0 || sparziele.length > 0;
  const alter = letztes ? -tageBis(letztes) : null;

  if (!letztes) {
    backupStatus.textContent = "Noch kein Backup erstellt.";
  } else if (alter <= 0) {
    backupStatus.textContent = "Letztes Backup: heute";
  } else {
    backupStatus.textContent =
      "Letztes Backup: " + datumDE(letztes) + " (vor " + alter + (alter === 1 ? " Tag)" : " Tagen)");
  }

  const faellig = hatDaten && (!letztes || alter >= BACKUP_ERINNERUNG_TAGE);
  backupHinweis.hidden = !faellig;
  if (faellig) {
    backupHinweisText.textContent = letztes
      ? "Dein letztes Backup ist " + alter + " Tage alt."
      : "Du hast noch kein Backup erstellt.";
  }

  snapshotsZeichnen();
}

// ---------- Neustart ----------
const resetKnopf = document.getElementById("resetKnopf");

resetKnopf.addEventListener("click", function () {
  const ok1 = confirm(
    "Wirklich ALLES löschen? Buchungen, Regelbuchungen, Versicherungen, Sparziele, Budgetgrenzen und eigene Kategorien gehen verloren."
  );
  if (!ok1) return;

  const ok2 = confirm("Letzte Nachfrage: Das kann nicht rückgängig gemacht werden. Fortfahren?");
  if (!ok2) return;
    snapshotAnlegen("vor Neustart");

  buchungen = [];
  budgets = {};
  regeln = [];
  sparziele = [];
  monatsziel = 0; 
  KATEGORIEN = kopie(STANDARD_KATEGORIEN);
  monat = heute().slice(0, 7);

  speichern();
  kategorienAktualisieren();
  anzeigen();
  backupMeldung.textContent = "Alles zurückgesetzt.";
});

// ---------- Start ----------
snapshotAnlegen();
zahlungenLaden();
abZiel.addEventListener("change", function () {
  const wert = parseFloat(abZiel.value);
  monatsziel = isNaN(wert) || wert <= 0 ? 0 : wert;
  speichern();
  anzeigen();
});
datumFeld.value = heute();
wStart.value = heute();
vStart.value = heute();
kategorienAktualisieren();
regelnAnwenden();
speichern();
anzeigen();

// Service Worker registrieren (für Offline-Modus und Installierbarkeit)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}