const COLORS = {
  Cocina: "#ea580c",
  Mesero: "#0ea5e9",
  Repartidor: "#22c55e",
  Caja: "#a855f7"
};

export default function RoleBadge({ role }) {
  const color = COLORS[role] || "#6b7280";
  const style = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: 12,
    background: `${color}22`,
    color,
    border: `1px solid ${color}`
  };
  return <span style={style}>{role}</span>;
}
