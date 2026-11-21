const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Add crop configurations here to make a new crop available throughout the UI.
export const cropCatalog = [
  { key: "olive", name: "Olivier", code: "OL", symbol: "OL", model: "demo-crop-vision-v1" },
  { key: "tomato", name: "Tomate", code: "TOM", symbol: "TM", model: "demo-crop-vision-v1" },
  { key: "potato", name: "Pomme de terre", code: "POT", symbol: "PT", model: "demo-crop-vision-v1" },
  { key: "grape", name: "Vigne", code: "VIG", symbol: "VG", model: "demo-crop-vision-v1" },
  { key: "wheat", name: "Blé", code: "BLE", symbol: "BL", model: "demo-crop-vision-v1" },
  { key: "citrus", name: "Agrumes", code: "CIT", symbol: "AG", model: "demo-crop-vision-v1" },
  { key: "pepper", name: "Poivron", code: "PEP", symbol: "PO", model: "demo-crop-vision-v1" },
  { key: "strawberry", name: "Fraisier", code: "FRA", symbol: "FR", model: "demo-crop-vision-v1" },
  { key: "corn", name: "Maïs", code: "MAI", symbol: "MZ", model: "demo-crop-vision-v1" },
  { key: "other", name: "Autre culture", code: "AUT", symbol: "AU", model: "demo-crop-vision-v1" },
];

export function getCropConfig(cropType) {
  return cropCatalog.find((crop) => crop.key === cropType)
    || { key: cropType || "other", name: cropType || "Autre culture", code: "AUT", symbol: "AU", model: "demo-crop-vision-v1" };
}

function cropIllustration(crop) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#dce8ca"/><stop offset="1" stop-color="#9caf78"/></linearGradient></defs><rect width="800" height="440" fill="url(#g)"/><path d="M0 350Q200 270 400 350T800 350V440H0Z" fill="#8c8058"/><g stroke="#345d36" stroke-width="10" stroke-linecap="round" fill="none" opacity=".83"><path d="M80 350V205m0 70-48-38m48 14 49-43M210 335V170m0 90-50-44m50 10 45-52M360 345V190m0 95-52-46m52 17 52-49M510 345V170m0 97-47-52m47 18 54-47M665 350V190m0 91-50-46m50 15 55-47"/></g><g fill="#527b46" opacity=".8"><circle cx="80" cy="190" r="45"/><circle cx="206" cy="160" r="50"/><circle cx="360" cy="180" r="46"/><circle cx="510" cy="160" r="50"/><circle cx="663" cy="180" r="48"/></g><rect x="24" y="24" width="752" height="392" rx="24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><rect x="30" y="30" width="118" height="43" rx="21" fill="#24452f"/><text x="89" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="white">SIMULATION</text><text x="400" y="403" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#fff">${crop.name} · Image illustrative</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const demoStates = ["Healthy", "Potential Anomaly", "Unknown / Verify", "Healthy", "Potential Anomaly", "Healthy"];
const symptomSamples = [
  { issue: "Variation visuelle à examiner", symptoms: "Une variation de couleur est visible sur une petite zone de l’image simulée." },
  { issue: "Couverture foliaire à vérifier", symptoms: "La couverture végétale semble irrégulière dans cette image de démonstration." },
  { issue: "Inconnu / à vérifier", symptoms: "Les éléments visuels simulés ne suffisent pas à établir une classification fiable." },
];

function makeProfile(crop, cropIndex, sampleIndex) {
  const sequence = sampleIndex + 1;
  const status = demoStates[(sampleIndex + cropIndex) % demoStates.length];
  const sample = status === "Healthy" ? { issue: "Aucune anomalie visuelle signalée", symptoms: "Aucune anomalie visible n’est signalée dans cette image simulée." }
    : status === "Unknown / Verify" ? symptomSamples[2] : symptomSamples[(cropIndex + sampleIndex) % 2];
  const inspectedAt = daysAgo((cropIndex * 3 + sampleIndex + 1) % 24 + 1);
  const photo = cropIllustration(crop);
  const confidence = status === "Unknown / Verify" ? null : 68 + ((cropIndex * 7 + sampleIndex * 5) % 29);
  const id = `${crop.code}-${String(sequence).padStart(3, "0")}`;
  const model = crop.model;

  return {
    id,
    cropType: crop.key,
    cropName: crop.name,
    name: `${crop.name} ${String(sequence).padStart(3, "0")}`,
    x: Number((2 * (8 + ((cropIndex * 17 + sampleIndex * 19) % 84))).toFixed(1)),
    y: Number((2 * (7 + ((cropIndex * 23 + sampleIndex * 13) % 86))).toFixed(1)),
    photo,
    lastInspection: inspectedAt,
    status,
    history: [{ id: `sim-${id}`, date: inspectedAt, status, confidence, summary: sample.issue, simulated: true }],
    detection: {
      cropType: crop.key,
      cropName: crop.name,
      cropConfidence: 82 + ((cropIndex * 5 + sampleIndex * 3) % 17),
      issueName: sample.issue,
      diseaseName: null,
      symptoms: sample.symptoms,
      result: status,
      analyzedPhoto: photo,
      confidence,
      model,
      detectedAt: inspectedAt,
      simulated: true,
    },
    treatment: {
      suspectedProblem: status === "Healthy" ? "Aucun problème suspecté" : sample.issue,
      preventiveMeasures: "Poursuivre la surveillance régulière et conserver des images comparables de la culture.",
      recommendedActions: "Réaliser une nouvelle observation nette, examiner plusieurs plantes voisines et consigner les changements constatés.",
      product: null,
      activeSubstance: null,
      authorizedUse: "Non vérifié — aucun produit indiqué.",
      source: null,
      precautions: "Ne pas appliquer de produit sur la base de cette simulation. Toute intervention doit être vérifiée par un agronome local et sur l’étiquette officielle autorisée pour cette culture.",
      status: "Vérification agronomique nécessaire",
      simulated: true,
    },
  };
}

export const initialPlants = cropCatalog.flatMap((crop, cropIndex) =>
  Array.from({ length: crop.key === "other" ? 2 : 4 }, (_, sampleIndex) => makeProfile(crop, cropIndex, sampleIndex)),
);

export function getMapColor(status) {
  if (status === "Healthy") return "#16a34a";
  if (status === "Potential Anomaly") return "#f97316";
  return "#6b7280";
}

export function inspectPlant(plant) {
  const inspectedAt = new Date().toISOString();
  const status = "Unknown / Verify";
  const confidence = null;
  const summary = "Inconnu / à vérifier — aucun modèle connecté";
  const record = { id: crypto.randomUUID(), date: inspectedAt, status, confidence, summary, simulated: true };
  return {
    ...plant,
    lastInspection: inspectedAt,
    status,
    history: [...(plant.history || []), record],
    detection: { ...plant.detection, issueName: summary, diseaseName: null, symptoms: "Aucun modèle IA connecté pour analyser cette nouvelle inspection. Enregistrer l’image pour une vérification ultérieure.", result: status, confidence, cropConfidence: null, model: null, detectedAt: inspectedAt, simulated: true },
    treatment: { ...plant.treatment, suspectedProblem: summary, product: null, activeSubstance: null, authorizedUse: "Non vérifié — aucun produit indiqué." },
  };
}
