const KATEGORIEN = {
  ausgabe: [
    "🛒 Lebensmittel",
    "🏠 Miete & Wohnen",
    "🚌 Mobilität",
    "🎉 Freizeit",
    "🛍️ Shopping",
    "💊 Gesundheit",
    "📱 Abos",
    "📦 Sonstiges",
  ],
  einnahme: ["💼 Gehalt", "🎁 Geschenk", "📦 Sonstiges"],
};

// Farben für die Donut-Segmente
const FARBEN = [
  "#7c9cff", "#4ade80", "#fbbf24", "#f87171",
  "#c084fc", "#22d3ee", "#fb923c", "#94a3b8",
];

// Heutiges Datum als Text im Format "2026-09-30"
function heute() {
  const d = new Date();
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

let buchungen = JSON.parse(localStorage.getItem("buchungen")) || [];

// Alte Buchungen ohne Datum bekommen das heutige Datum
buchungen.forEach(function (b) {
  if (!b.datum) b.datum = heute();
});

// Der Monat, der gerade angezeigt wird, z. B. "2026-09"
let monat = heute().slice(0, 7);
// Gespeicherte Budgetgrenzen, z. B. { "🛒 Lebensmittel": 300 }
let budgets = JSON.parse(localStorage.getItem("budgets")) || {};

// Elemente der Seite
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

function speichern() {
  localStorage.setItem("buchungen", JSON.stringify(buchungen));
}

function euro(zahl) {
  return zahl.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function kategorienLaden() {
  kategorieFeld.innerHTML = "";
  KATEGORIEN[typFeld.value].forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    kategorieFeld.appendChild(option);
  });
}

typFeld.addEventListener("change", kategorienLaden);

// Monat wechseln: richtung ist -1 (zurück) oder +1 (vor)
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

// Das Donut-Diagramm und die Legende zeichnen
function donutZeichnen(ausgaben) {
  // Ausgaben pro Kategorie zusammenzählen
  const proKategorie = {};
  let gesamt = 0;
  ausgaben.forEach(function (b) {
    const k = b.kategorie || "📦 Sonstiges";
    proKategorie[k] = (proKategorie[k] || 0) + b.betrag;
    gesamt += b.betrag;
  });

  // Nach Höhe sortieren: größte Kategorie zuerst
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

  // Text in der Mitte
  const mitte = gesamt > 0 ? euro(gesamt) : "Keine Ausgaben";
  svg += '<text x="21" y="21.8" text-anchor="middle" fill="#e8eaf0" font-size="3.4" font-weight="700">' + mitte + "</text>";
  svg += "</svg>";
  donut.innerHTML = svg;
}
// Budgetgrenzen mit Fortschrittsbalken zeichnen
function budgetsZeichnen(ausgaben) {
  budgetListe.innerHTML = "";

  KATEGORIEN.ausgabe.forEach(function (kat) {
    // Wie viel wurde in dieser Kategorie ausgegeben?
    let ausgegeben = 0;
    ausgaben.forEach(function (b) {
      if ((b.kategorie || "📦 Sonstiges") === kat) {
        ausgegeben += b.betrag;
      }
    });

    const limit = budgets[kat] || 0;

    const zeile = document.createElement("li");
    zeile.className = "budget-zeile";

    // Obere Zeile: Kategoriename und Eingabefeld für das Limit
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
        delete budgets[kat]; // Limit entfernen
      } else {
        budgets[kat] = wert;
      }
      localStorage.setItem("budgets", JSON.stringify(budgets));
      anzeigen();
    });

    kopf.append(name, eingabe);
    zeile.appendChild(kopf);

    // Balken und Text darunter
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
// Alles neu zeichnen
function anzeigen() {
  // Gesamter Kontostand über alle Monate
  let saldo = 0;
  buchungen.forEach(function (b) {
    saldo += b.typ === "einnahme" ? b.betrag : -b.betrag;
  });
  saldoAnzeige.textContent = euro(saldo);

  // Nur Buchungen des gewählten Monats
  const imMonat = buchungen.filter(function (b) {
    return b.datum.startsWith(monat);
  });

  // Monatsname, z. B. "September 2026"
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

  donutZeichnen(imMonat.filter(function (b) { return b.typ === "ausgabe"; }));
    budgetsZeichnen(imMonat.filter(function (b) { return b.typ === "ausgabe"; }));

  // Liste der Buchungen dieses Monats
  liste.innerHTML = "";
  if (imMonat.length === 0) {
    const leer = document.createElement("li");
    leer.className = "leer";
    leer.textContent = "Keine Buchungen in diesem Monat.";
    liste.appendChild(leer);
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

  // Nach Datum sortieren, neueste zuerst
  buchungen.sort(function (a, b) {
    return b.datum.localeCompare(a.datum);
  });

  beschreibungFeld.value = "";
  betragFeld.value = "";
  monat = datum.slice(0, 7); // zum Monat der neuen Buchung springen
  speichern();
  anzeigen();
});

datumFeld.value = heute();
kategorienLaden();
speichern(); // speichert auch die Datums-Ergänzung für alte Buchungen
anzeigen();
// Service Worker registrieren (für Offline-Modus und Installierbarkeit)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}