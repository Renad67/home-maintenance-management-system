import StatusPill from './StatusPill.jsx';

export default function TaskCard({
    task,
    onAccept,
    onReject,
    onComplete,
    mode = 'pool',
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            {/* ── Task details ── */}
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '17px', color: '#1F2937', fontWeight: 600 }}>
                    {task.problem || 'Maintenance Request'}
                </h4>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>
                    #{task.requestid} — {task.address}, {task.district}
                </p>

                {task.category_name && (
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#9CA3AF' }}>
                        Device: {task.brand_name} {task.category_name}
                    </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {task.customer_name && (
                        <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                            Customer: {task.customer_name} {task.customer_phone ? `(${task.customer_phone})` : ''}
                        </span>
                    )}
                    <StatusPill status={task.status_name ?? 'pending'} />
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: '10px', marginLeft: '16px', flexShrink: 0 }}>
                {mode === 'pool' && (
                    <>
                        <button
                            onClick={() => onAccept?.(task.requestid)}
                            style={btnStyle('#22C55E')}
                        >
                            ✓ Accept
                        </button>
                        <button
                            onClick={() => onReject?.(task.requestid)}
                            style={btnStyle('#EF4444')}
                        >
                            ✕ Reject
                        </button>
                    </>
                )}

                {mode === 'active' && (
                    <button
                        onClick={() => onComplete?.(task.requestid)}
                        style={btnStyle('#2F6BFF')}
                    >
                        ✓ Mark Complete
                    </button>
                )}
            </div>
        </div>
    );
}

const btnStyle = (bg) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: bg,
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
});