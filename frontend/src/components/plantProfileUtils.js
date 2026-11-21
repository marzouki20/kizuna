export const plantStatuses = ["Healthy", "Anomaly Detected", "Disease Suspected", "Needs Verification"];

export function statusStyle(status) {
  if (status === "Healthy") return "bg-green-100 text-green-800";
  if (status === "Anomaly Detected") return "bg-red-100 text-red-800";
  if (status === "Disease Suspected") return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-700";
}

export function formatDate(date, includeTime = false) {
  if (!date) return "Not inspected yet";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(date));
}
