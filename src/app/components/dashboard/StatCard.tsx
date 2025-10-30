interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    main?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, description, main = false }) => (
    <div className={`bg-component-background border border-border p-5 rounded-lg shadow-sm ${main ? 'border-yellow-500/50' : ''}`}>
        <h3 className="text-sm font-medium text-text-secondary truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-text-primary">{value}</p>
        {description && <p className="text-xs text-text-tertiary mt-2">{description}</p>}
    </div>
);
