const STATUS_LABELS = {
    pending:       'Pending',
    assigned:      'Assigned',
    in_progress:   'In Progress',
    completed:     'Completed',
    cancelled:     'Cancelled',
    rejected:      'Rejected',
    on_hold:       'On Hold',
    waiting_parts: 'Waiting Parts',
    active:        'Active',
};

export default function StatusPill({ status }) {
    const label = STATUS_LABELS[status] ?? status?.toUpperCase() ?? 'Unknown';

    return (
        <span className={`status-pill ${status ?? 'pending'}`}>
            {label}
        </span>
    );
}