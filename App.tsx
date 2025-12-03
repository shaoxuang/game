import React, { useState, useEffect, useCallback } from 'react';
import { generateBattleData, generatePokemonImage } from './services/geminiService';
import { Pokemon, BattleState, Move } from './types';
import HealthBar from './components/HealthBar';
import BattleLog from './components/BattleLog';
import MoveButton from './components/MoveButton';
import { Sword, RotateCcw, Sparkles, Loader2, Trophy, Skull } from 'lucide-react';

const App: React.FC = () => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [playerShake, setPlayerShake] = useState(false);
  const [opponentShake, setOpponentShake] = useState(false);

  // Initialize Game
  const initGame = useCallback(async () => {
    setBattleState(null);
    setLoadingStep('正在连接 AI 生成器...');
    
    try {
      setLoadingStep('正在构思新的宝可梦 (Stats)...');
      const data = await generateBattleData();
      
      setLoadingStep(`正在绘制 ${data.player.name}...`);
      const playerImg = await generatePokemonImage(data.player.description);
      
      setLoadingStep(`正在绘制 ${data.opponent.name}...`);
      const opponentImg = await generatePokemonImage(data.opponent.description);

      const player: Pokemon = {
        ...data.player,
        id: 'player',
        currentHp: data.player.maxHp,
        imageUrl: playerImg,
        isPlayer: true
      };

      const opponent: Pokemon = {
        ...data.opponent,
        id: 'opponent',
        currentHp: data.opponent.maxHp,
        imageUrl: opponentImg,
        isPlayer: false
      };

      setBattleState({
        player,
        opponent,
        turn: player.speed >= opponent.speed ? 'player' : 'opponent',
        gameStatus: 'battle',
        logs: [`遭遇了野生的 ${opponent.name}!`, player.speed >= opponent.speed ? `速度更快! ${player.name} 先手!` : `${opponent.name} 速度更快抢到了先手!`]
      });
      setLoadingStep('');

    } catch (error) {
      console.error(error);
      setLoadingStep('生成失败，请检查 API Key 或重试。');
    }
  }, []);

  // Damage Logic
  const calculateDamage = (attacker: Pokemon, defender: Pokemon, move: Move): number => {
    // Basic formula: (Attack / Defense) * Power * RandomVariance
    const baseDamage = (attacker.attack / defender.defense) * move.power * 0.5;
    const variance = (Math.random() * 0.4) + 0.8; // 0.8 to 1.2
    let damage = Math.floor(baseDamage * variance);
    
    // Critical Hit chance (1/16)
    if (Math.random() < 0.0625) {
      damage = Math.floor(damage * 1.5);
    }
    
    return Math.max(1, damage);
  };

  const handleTurn = async (moveIndex: number) => {
    if (!battleState || battleState.gameStatus !== 'battle' || battleState.turn !== 'player') return;

    const { player, opponent } = battleState;
    const move = player.moves[moveIndex];

    // Player Move
    const damage = calculateDamage(player, opponent, move);
    const newOpponentHp = Math.max(0, opponent.currentHp - damage);
    
    setOpponentShake(true);
    setTimeout(() => setOpponentShake(false), 500);

    const logMsg = `${player.name} 使用了 ${move.name}! 造成了 ${damage} 点伤害。`;
    const newLogs = [...battleState.logs, logMsg];

    if (newOpponentHp <= 0) {
      setBattleState(prev => prev ? ({
        ...prev,
        opponent: { ...prev.opponent, currentHp: 0 },
        logs: [...newLogs, `${opponent.name} 倒下了! 你赢了!`],
        gameStatus: 'won'
      }) : null);
      return;
    }

    setBattleState(prev => prev ? ({
      ...prev,
      opponent: { ...prev.opponent, currentHp: newOpponentHp },
      logs: newLogs,
      turn: 'opponent'
    }) : null);

    // AI Turn (Delayed)
    setTimeout(() => {
        executeAiTurn(player, { ...opponent, currentHp: newOpponentHp });
    }, 1500);
  };

  const executeAiTurn = (currentPlayer: Pokemon, currentOpponent: Pokemon) => {
    // Simple AI: Random move
    const moveIndex = Math.floor(Math.random() * currentOpponent.moves.length);
    const move = currentOpponent.moves[moveIndex];

    const damage = calculateDamage(currentOpponent, currentPlayer, move);
    const newPlayerHp = Math.max(0, currentPlayer.currentHp - damage);

    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 500);

    setBattleState(prev => {
      if (!prev) return null;
      const aiLog = `${currentOpponent.name} 使用了 ${move.name}! 造成了 ${damage} 点伤害。`;
      const finalLogs = [...prev.logs, aiLog];

      if (newPlayerHp <= 0) {
        return {
          ...prev,
          player: { ...prev.player, currentHp: 0 },
          logs: [...finalLogs, `${currentPlayer.name} 倒下了! 你输了...`],
          gameStatus: 'lost'
        };
      }

      return {
        ...prev,
        player: { ...prev.player, currentHp: newPlayerHp },
        logs: finalLogs,
        turn: 'player'
      };
    });
  };

  // Intro Screen
  if (!battleState && !loadingStep) {
    return (
      <div className="h-full min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1630132808064-70966a33c169?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 bg-slate-800/80 p-8 rounded-2xl border border-slate-600 shadow-2xl backdrop-blur-md max-w-sm w-full">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50">
               <Sword size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 game-font">
            AI 宝可梦
          </h1>
          <p className="text-slate-400 mb-8">
            Generative AI Battle System
          </p>
          <button 
            onClick={initGame}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 group"
          >
            <Sparkles className="group-hover:rotate-12 transition-transform" />
            开始生成对战
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loadingStep) {
    return (
      <div className="h-full min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">正在准备战场</h2>
        <p className="text-slate-400 animate-pulse">{loadingStep}</p>
      </div>
    );
  }

  // Battle Screen
  if (battleState) {
    const { player, opponent, turn, gameStatus } = battleState;

    return (
      <div className="flex flex-col h-screen max-h-screen sm:h-[800px] relative bg-slate-900">
        {/* Battle Arena Visuals */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
           {/* Background Decorations */}
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
           
           {/* Opponent Area (Top Right) */}
           <div className="absolute top-8 right-4 sm:right-12 flex flex-col items-end z-10 w-full px-4">
              <HealthBar current={opponent.currentHp} max={opponent.maxHp} label={opponent.name} />
              <div className={`mt-4 relative transition-transform duration-500 ${opponentShake ? 'shake' : ''}`}>
                 {opponent.imageUrl ? (
                    <img 
                      src={opponent.imageUrl} 
                      alt={opponent.name} 
                      className="w-40 h-40 sm:w-56 sm:h-56 object-contain drop-shadow-2xl filter brightness-110"
                    />
                 ) : (
                    <div className="w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
                 )}
              </div>
           </div>

           {/* Player Area (Bottom Left) */}
           <div className="absolute bottom-8 left-4 sm:left-12 flex flex-col items-start z-10 w-full px-4">
              <div className={`mb-4 ml-8 relative transition-transform duration-500 ${playerShake ? 'shake' : ''}`}>
                  {player.imageUrl ? (
                    <img 
                      src={player.imageUrl} 
                      alt={player.name} 
                      className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
                  )}
              </div>
              <HealthBar current={player.currentHp} max={player.maxHp} label={player.name} />
           </div>
        </div>

        {/* Message Log */}
        <BattleLog logs={battleState.logs} />

        {/* Controls */}
        <div className="bg-slate-800 p-4 pb-8 border-t border-slate-700">
          {gameStatus === 'battle' ? (
             <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
               <div className="col-span-2 text-center text-slate-400 text-sm mb-1 flex justify-between px-2">
                  <span>{turn === 'player' ? "请选择指令..." : "对手正在思考..."}</span>
                  <span className="font-mono text-xs opacity-50">Turn: {turn.toUpperCase()}</span>
               </div>
               {player.moves.map((move, idx) => (
                 <MoveButton 
                   key={idx} 
                   move={move} 
                   onClick={() => handleTurn(idx)} 
                   disabled={turn !== 'player'}
                 />
               ))}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
               {gameStatus === 'won' ? (
                 <div className="text-center mb-4">
                    <Trophy className="mx-auto text-yellow-400 mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-white">胜利!</h2>
                    <p className="text-slate-400">你击败了 {opponent.name}</p>
                 </div>
               ) : (
                 <div className="text-center mb-4">
                    <Skull className="mx-auto text-slate-500 mb-2" size={48} />
                    <h2 className="text-2xl font-bold text-red-500">失败...</h2>
                    <p className="text-slate-400">{player.name} 失去了战斗能力</p>
                 </div>
               )}
               <button 
                 onClick={initGame}
                 className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 px-8 rounded-full transition-colors"
               >
                 <RotateCcw size={20} />
                 再次挑战 (生成新的宝可梦)
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default App;
