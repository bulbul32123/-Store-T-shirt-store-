"use client";

const RULES = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /\d/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function PasswordStrengthMeter({ password }) {
  const passed = RULES.filter((r) => r.test(password)).length;
  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-500",
    "bg-green-600",
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1.5">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded ${i < passed ? colors[passed - 1] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-2 text-xs text-gray-500">
        {RULES.map((r) => (
          <li
            key={r.label}
            className={r.test(password) ? "text-green-600" : ""}
          >
            {r.test(password) ? "✓" : "○"} {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
