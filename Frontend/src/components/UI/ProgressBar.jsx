const ProgressBar = ({ value, max, color = "#6366f1", height = 8, showLabel = false, animated = true }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{value} / {max} EXP</span>
          <span className="font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          background: "rgba(0,0,0,0.08)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: animated ? "width 1s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            boxShadow: `0 0 10px ${color}60`,
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              animation: "shimmer 2s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;