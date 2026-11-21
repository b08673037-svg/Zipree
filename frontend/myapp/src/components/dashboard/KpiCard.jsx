export default function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="zipree-kpi">
      <div className="zipree-kpi__icon" style={{ color: color, background: `${color}15` }}>
        <Icon />
      </div>
      <div>
        <p className="zipree-kpi__value">{value}</p>
        <p className="zipree-kpi__label">{label}</p>
      </div>
    </div>
  );
}