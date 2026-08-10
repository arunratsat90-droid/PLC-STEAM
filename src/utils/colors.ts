export const GROUP_COLOR_MAP: Record<string, { bg: string; text: string; border: string; hex: string; lightHex: string }> = {
  "วีรชน": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", hex: "#4f46e5", lightHex: "#e0e7ff" },
  "พระอินทร์": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hex: "#9333ea", lightHex: "#f3e8ff" },
  "พระนอน": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hex: "#059669", lightHex: "#d1fae5" },
  "ทองน้ำงาม": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", hex: "#d97706", lightHex: "#fef3c7" },
  "จตุรมิตร": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", hex: "#e11d48", lightHex: "#ffe4e6" },
  "สิงห์เจ้าพระยา": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", hex: "#0d9488", lightHex: "#ccfbf1" },
  "เตาเผาแม่น้ำน้อย": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", hex: "#ea580c", lightHex: "#ffedd5" },
  "พรหมพัฒนา": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", hex: "#0284c7", lightHex: "#e0f2fe" },
  "บางระจัน": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hex: "#2563eb", lightHex: "#dbeafe" },
};

export function getGroupColor(groupName: string) {
  return GROUP_COLOR_MAP[groupName] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    hex: "#64748b",
    lightHex: "#f1f5f9"
  };
}
