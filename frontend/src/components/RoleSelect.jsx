const ROLES = ["Cocina", "Mesero", "Repartidor", "Caja"];

export default function RoleSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        padding: "6px 8px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: disabled ? "#f3f4f6" : "white",
        cursor: disabled ? "not-allowed" : "pointer"
      }}
    >
      {ROLES.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
