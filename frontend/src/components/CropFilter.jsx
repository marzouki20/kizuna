import { cropCatalog } from "../data/plants";

export default function CropFilter({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
      <span className="font-medium">Culture</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="max-w-48 bg-transparent font-semibold text-green-800 outline-none">
        <option value="all">Toutes les cultures</option>
        {cropCatalog.map((crop) => <option key={crop.key} value={crop.key}>{crop.name}</option>)}
      </select>
    </label>
  );
}
