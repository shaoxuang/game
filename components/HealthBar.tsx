import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  level?: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, level = 50 }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  let colorClass = 'bg-green-500';
  if (percentage < 50) colorClass = 'bg-yellow-400';
  if (percentage < 20) colorClass = 'bg-red-500';

  return (
    <div className="bg-slate-700/80 p-3 rounded-lg border border-slate-600 shadow-md backdrop-blur-sm w-full max-w-[240px]">
      <div className="flex justify-between items-end mb-1">
        <span className="font-bold text-lg text-white drop-shadow-md tracking-wide">{label}</span>
        <span className="text-xs text-slate-300 font-mono">Lv.{level}</span>
      </div>
      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs mt-1 font-mono text-slate-300">
        {Math.ceil(current)} / {max}
      </div>
    </div>
  );
};

export default HealthBar;
