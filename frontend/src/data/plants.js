const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

function simulatedProfile(index, status) {
  const issue = status === "Anomaly Detected"
    ? { name: "Canopy discoloration pattern", symptoms: "A small area of irregular leaf color was flagged for review in the simulated image." }
    : status === "Disease Suspected"
      ? { name: "Possible leaf spot symptoms", symptoms: "Several small marks are visible in the simulated canopy image; this is an unverified visual observation." }
      : status === "Needs Verification"
        ? { name: "Image requires review", symptoms: "Image quality or visual evidence was insufficient for a reliable simulated classification." }
        : { name: "No anomaly flagged", symptoms: "No visible anomaly was flagged during this simulated scan." };
  const issueStatus = status === "Healthy" ? "Healthy" : status;
  const inspectedAt = status === "Needs Verification" ? null : daysAgo((index % 18) + 1);

  return {
    id: `OL-${String(index + 1).padStart(3, "0")}`,
    name: `Olivier ${String(index + 1).padStart(3, "0")}`,
    x: Number((5.5 + (index % 10) * 10).toFixed(1)),
    y: Number((94.5 - Math.floor(index / 10) * 20).toFixed(1)),
    photo: "/fields/olive-tree.svg",
    lastInspection: inspectedAt,
    status: issueStatus,
    history: inspectedAt ? [{
      id: `seed-${index + 1}`,
      date: inspectedAt,
      status: issueStatus,
      confidence: status === "Healthy" ? 94 : 70 + (index % 20),
      summary: issue.name,
      simulated: true,
    }] : [],
    detection: {
      issueName: issue.name,
      symptoms: issue.symptoms,
      analyzedPhoto: "/fields/olive-tree.svg",
      confidence: status === "Healthy" ? 94 : 70 + (index % 20),
      detectedAt: inspectedAt,
      simulated: true,
    },
    treatment: {
      suspectedProblem: status === "Healthy" ? "No problem suspected" : issue.name,
      preventiveMeasures: "Continue routine observation and record clear photographs of any changing symptoms.",
      product: "Agronomic verification required",
      activeSubstance: "Not verified",
      precautions: "Do not apply a product based on this simulated result. Consult a qualified local agronomist and verify the official product label and local authorization.",
      status: "Pending Verification",
      simulated: true,
    },
  };
}

const initialStates = Array.from({ length: 50 }, (_, index) => {
  if ((index + 1) % 13 === 0) return "Anomaly Detected";
  if ((index + 1) % 11 === 0) return "Disease Suspected";
  if ((index + 1) % 7 === 0) return "Needs Verification";
  return "Healthy";
});

export const initialPlants = initialStates.map((status, index) => simulatedProfile(index, status));

export function getMapColor(status) {
  if (status === "Healthy") return "#16a34a";
  if (status === "Anomaly Detected") return "#dc2626";
  if (status === "Disease Suspected") return "#f97316";
  return "#6b7280";
}

export function inspectPlant(plant) {
  const inspectedAt = new Date().toISOString();
  const status = plant.status === "Needs Verification" ? "Healthy" : plant.status;
  const nextConfidence = status === "Healthy" ? 93 : Math.min(96, (plant.detection?.confidence || 76) + 1);
  const summary = status === "Healthy" ? "No anomaly flagged" : plant.detection?.issueName || "Visual observation flagged for review";
  const record = {
    id: crypto.randomUUID(),
    date: inspectedAt,
    status,
    confidence: nextConfidence,
    summary,
    simulated: true,
  };

  return {
    ...plant,
    lastInspection: inspectedAt,
    status,
    history: [...(plant.history || []), record],
    detection: {
      ...plant.detection,
      issueName: status === "Healthy" ? "No anomaly flagged" : plant.detection?.issueName,
      symptoms: status === "Healthy"
        ? "No visible anomaly was flagged during this simulated scan."
        : plant.detection?.symptoms,
      confidence: nextConfidence,
      detectedAt: inspectedAt,
      simulated: true,
    },
    treatment: status === "Healthy"
      ? { ...plant.treatment, suspectedProblem: "No problem suspected" }
      : plant.treatment,
  };
}
