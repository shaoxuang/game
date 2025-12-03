import React from 'react';
import { ElementType, Move } from '../types';

interface MoveButtonProps {
  move: Move;
  onClick: () => void;
  disabled: boolean;
}

const typeColors: Record<ElementType, string> = {
  [ElementType.Fire]: 'bg-red-600 hover:bg-red-500 border-red-800 text-white',
  [ElementType.Water]: 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white',
  [ElementType.Grass]: 'bg-green-600 hover:bg-green-500 border-green-800 text-white',
  [ElementType.Electric]: 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700 text-black',
  [ElementType.Normal]: 'bg-stone-500 hover:bg-stone-400 border-stone-700 text-white',
  [ElementType.Psychic]: 'bg-pink-600 hover:bg-pink-500 border-pink-800 text-white',
  [ElementType.Fighting]: 'bg-orange-700 hover:bg-orange-600 border-orange-900 text-white',
  [ElementType.Dark]: 'bg-slate-800 hover:bg-slate-700 border-black text-white',
  [ElementType.Dragon]: 'bg-indigo-700 hover:bg-indigo-600 border-indigo-900 text-white',
  [ElementType.Steel]: 'bg-gray-500 hover:bg-gray-400 border-gray-700 text-white',
  [ElementType.Fairy]: 'bg-rose-400 hover:bg-rose-300 border-rose-600 text-black',
};

const MoveButton: React.FC<MoveButtonProps> = ({ move, onClick, disabled }) => {
  const colorClass = typeColors[move.type] || 'bg-gray-600 border-gray-800';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3 rounded-lg border-b-4 active:border-b-0 active:translate-y-1 
        transition-all font-bold text-sm sm:text-base shadow-lg
        flex flex-col items-center justify-center gap-1
        ${colorClass}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <span>{move.name}</span>
      <span className="text-[10px] opacity-80 font-mono tracking-tighter uppercase">{move.type} / PW:{move.power}</span>
    </button>
  );
};

export default MoveButton;
