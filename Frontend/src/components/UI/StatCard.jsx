const StatCard = ({ title, value, icon, gradient, subtitle, delay = 0 }) => {
  return (
    <div
      className="glass-card card-hover p-5 fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: gradient || "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
          }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;