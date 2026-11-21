export const plantStatuses = ["Healthy", "Potential Anomaly", "Unknown / Verify"];

export function statusStyle(status) {
  if (status === "Healthy") return "bg-green-100 text-green-800";
  if (status === "Potential Anomaly" || status === "Anomaly Detected" || status === "Disease Suspected") return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-700";
}

export function formatDate(date, includeTime = false) {
  if (!date) return "Not inspected yet";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(date));
}
