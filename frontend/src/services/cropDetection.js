const cropModels = new Map();

// Register one detector per crop key when a real model/API becomes available.
export function registerCropModel(cropType, detector) {
  if (!cropType || typeof detector !== "function") throw new TypeError("cropType et detector sont requis.");
  cropModels.set(cropType, detector);
  return () => cropModels.delete(cropType);
}

export async function detectCropPlant({ cropType, image, context = {} }) {
  const detector = cropModels.get(cropType);
  if (!detector) {
    return {
      cropType: cropType || null,
      result: "Unknown / Verify",
      diseaseName: null,
      issueName: "Inconnu / à vérifier",
      symptoms: "Aucun modèle IA compatible n’est connecté pour cette culture.",
      confidence: null,
      model: null,
      simulated: true,
    };
  }
  const result = await detector({ image, cropType, ...context });
  return {
    cropType,
    result: result?.result || "Unknown / Verify",
    diseaseName: result?.diseaseName || null,
    issueName: result?.issueName || "Inconnu / à vérifier",
    symptoms: result?.symptoms || "Aucun symptôme décrit par le modèle.",
    confidence: Number.isFinite(result?.confidence) ? result.confidence : null,
    model: result?.model || null,
    simulated: Boolean(result?.simulated),
  };
}
