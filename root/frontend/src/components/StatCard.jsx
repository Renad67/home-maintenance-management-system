export default function StatCard({ label, value, icon, variant = 'blue' }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-label">
                <span className="icon">{icon}</span>
                {label}
            </div>
            <div className="stat-value">{value ?? 0}</div>
        </div>
    );
}