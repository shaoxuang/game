import React, { useEffect, useRef } from 'react';

interface BattleLogProps {
  logs: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-black/50 border-t-2 border-slate-600 h-32 p-4 overflow-y-auto font-mono text-sm leading-relaxed backdrop-blur-md">
      {logs.length === 0 ? (
        <p className="text-slate-400 italic">战斗开始...</p>
      ) : (
        logs.map((log, i) => (
          <p key={i} className="mb-1 last:mb-0 animate-fadeIn">
            <span className="text-yellow-400 mr-2">➤</span>
            {log}
          </p>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

export default BattleLog;
