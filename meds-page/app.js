const assetBase = "https://cdn.jsdelivr.net/gh/simossene/mooodle-g.s.sanaa@master/meds-page/assets/";

const medicines = [
  {
    id: "tyrosine",
    name: "L-Tyrosine",
    dose: "1 gélule",
    slot: "morning",
    time: "Réveil / matin à jeun",
    instructions: "Éviter le soir.",
    image: `${assetBase}l-tyrosine.jpg`,
    condition: "daily",
  },
  {
    id: "akker",
    name: "Akker Métab",
    dose: "1 gélule",
    slot: "breakfast",
    time: "Pendant le petit-déjeuner",
    instructions: "À prendre au cours du repas.",
    image: `${assetBase}akker-metab.jpg`,
    condition: "daily",
  },
  {
    id: "action-diete",
    name: "Action Diète 4",
    dose: "1/2 comprimé",
    slot: "breakfast",
    time: "Juste après le petit-déjeuner",
    instructions: "Une fois par jour.",
    image: `${assetBase}action-diete-4.jpg`,
    condition: "daily",
  },
  {
    id: "mag7",
    name: "MAG7",
    dose: "1 gélule",
    slot: "breakfast",
    time: "2h après le petit-déjeuner",
    instructions: "Magnésium.",
    image: `${assetBase}mag7.jpg`,
    condition: "daily",
  },
  {
    id: "permea",
    name: "PERMÉA+ / L-glutamine",
    dose: "1 dose",
    slot: "midday",
    time: "15 min avant le déjeuner",
    instructions: "Équivalent L-glutamine à confirmer.",
    image: `${assetBase}permea-plus.jpg`,
    condition: "weekdays",
  },
  {
    id: "he-breakfast",
    name: "Physiomance HE",
    dose: "1 gélule",
    slot: "breakfast",
    time: "Après le petit-déjeuner",
    instructions: "Huiles essentielles. Seulement pendant le cycle.",
    image: `${assetBase}physiomance-he.jpg`,
    condition: "cycle",
  },
  {
    id: "he-lunch",
    name: "Physiomance HE",
    dose: "1 gélule",
    slot: "midday",
    time: "Après le déjeuner",
    instructions: "Deuxième prise de la journée, seulement pendant le cycle.",
    image: `${assetBase}physiomance-he.jpg`,
    condition: "cycle",
  },
  {
    id: "acide-lipoique",
    name: "Acide Lipoïque Gold",
    dose: "1 gélule",
    slot: "afternoon",
    time: "Après-midi",
    instructions: "Tous les jours pendant 3 mois.",
    image: `${assetBase}acide-lipoique-gold.jpg`,
    condition: "daily",
  },
  {
    id: "he-dinner",
    name: "Physiomance HE",
    dose: "1 gélule",
    slot: "evening",
    time: "Après le dîner",
    instructions: "Troisième prise de la journée, seulement pendant le cycle.",
    image: `${assetBase}physiomance-he.jpg`,
    condition: "cycle",
  },
  {
    id: "detox",
    name: "Detoxssentiel Perturbateurs Endocriniens",
    dose: "1 sachet",
    slot: "evening",
    time: "Au coucher",
    instructions: "Seulement pendant le cycle 10 jours/mois.",
    image: `${assetBase}detoxssentiel.jpg`,
    condition: "cycle",
  },
];

const slotLabels = {
  morning: "Matin",
  breakfast: "Petit-déjeuner",
  midday: "Midi",
  afternoon: "Après-midi",
  evening: "Soir",
};

const slotHours = [
  ["morning", 0, 8],
  ["breakfast", 8, 12],
  ["midday", 12, 15],
  ["afternoon", 15, 19],
  ["evening", 19, 24],
];

const state = {
  slot: "morning",
  today: new Date(),
};

const activeList = document.querySelector("#activeList");
const fullSchedule = document.querySelector("#fullSchedule");
const activeTitle = document.querySelector("#activeTitle");
const startDateInput = document.querySelector("#startDate");
const cycleStatus = document.querySelector("#cycleStatus");
const weekStatus = document.querySelector("#weekStatus");
const timeNow = document.querySelector("#timeNow");
const dateNow = document.querySelector("#dateNow");
const photoDialog = document.querySelector("#photoDialog");
const dialogImage = document.querySelector("#dialogImage");
const dialogTitle = document.querySelector("#dialogTitle");

const savedStart = localStorage.getItem("treatmentStartDate");
if (savedStart) startDateInput.value = savedStart;

function getCurrentSlot(date = new Date()) {
  const hour = date.getHours();
  return slotHours.find(([, start, end]) => hour >= start && hour < end)?.[0] || "morning";
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayDiff(a, b) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((end - start) / 86400000);
}

function cycleInfo(date) {
  const start = parseLocalDate(startDateInput.value);
  const elapsed = dayDiff(start, date);
  if (elapsed < 0) return { active: false, text: "Pas commencé" };
  if (elapsed >= 92) return { active: false, text: "Terminé" };
  const cycleDay = (elapsed % 30) + 1;
  return {
    active: cycleDay <= 10,
    text: cycleDay <= 10 ? `Jour ${cycleDay}/10` : "Pause",
  };
}

function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function isActiveToday(medicine, date) {
  if (medicine.condition === "daily") return true;
  if (medicine.condition === "weekdays") return isWeekday(date);
  if (medicine.condition === "cycle") return cycleInfo(date).active;
  return true;
}

function card(medicine, compact = false) {
  const active = isActiveToday(medicine, state.today);
  const article = document.createElement("article");
  article.className = `medicine-card ${active ? "" : "inactive"}`;
  article.innerHTML = `
    <img src="${medicine.image}" alt="${medicine.name}" loading="lazy">
    <div class="medicine-body">
      <div class="medicine-top">
        <div class="medicine-name">${medicine.name}</div>
        <span class="dose">${medicine.dose}</span>
      </div>
      <div class="time">${medicine.time}</div>
      <div class="instructions">${medicine.instructions}</div>
      ${compact ? `<div class="condition">${slotLabels[medicine.slot]}</div>` : ""}
      ${active ? "" : `<div class="condition">Pas aujourd'hui</div>`}
    </div>
  `;
  article.querySelector("img").addEventListener("click", () => openPhoto(medicine));
  return article;
}

function openPhoto(medicine) {
  dialogImage.src = medicine.image;
  dialogImage.alt = medicine.name;
  dialogTitle.textContent = `${medicine.name} - ${medicine.dose}`;
  photoDialog.showModal();
}

function render() {
  const cycle = cycleInfo(state.today);
  const weekdayActive = isWeekday(state.today);
  cycleStatus.textContent = cycle.text;
  weekStatus.textContent = weekdayActive ? "Oui aujourd'hui" : "Non week-end";
  activeTitle.textContent = slotLabels[state.slot];

  document.querySelectorAll(".time-tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.slot === state.slot);
  });

  const activeMeds = medicines.filter((medicine) => medicine.slot === state.slot && isActiveToday(medicine, state.today));
  activeList.replaceChildren();
  if (activeMeds.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Rien à prendre sur ce créneau aujourd'hui.";
    activeList.append(empty);
  } else {
    activeMeds.forEach((medicine) => activeList.append(card(medicine)));
  }

  fullSchedule.replaceChildren();
  medicines.forEach((medicine) => fullSchedule.append(card(medicine, true)));
}

function tick() {
  state.today = new Date();
  state.slot = getCurrentSlot(state.today);
  timeNow.textContent = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(state.today);
  dateNow.textContent = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "short" }).format(state.today);
  render();
}

document.querySelectorAll(".time-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    state.slot = button.dataset.slot;
    render();
  });
});

startDateInput.addEventListener("change", () => {
  localStorage.setItem("treatmentStartDate", startDateInput.value);
  render();
});

document.querySelector("#closeDialog").addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});

tick();
setInterval(tick, 60000);
