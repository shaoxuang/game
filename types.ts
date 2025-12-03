export enum ElementType {
  Fire = 'Fire',
  Water = 'Water',
  Grass = 'Grass',
  Electric = 'Electric',
  Normal = 'Normal',
  Psychic = 'Psychic',
  Fighting = 'Fighting',
  Dark = 'Dark',
  Dragon = 'Dragon',
  Steel = 'Steel',
  Fairy = 'Fairy'
}

export interface Move {
  name: string;
  type: ElementType;
  power: number;
  accuracy: number; // 0-100
  description: string;
}

export interface Pokemon {
  id: string;
  name: string;
  type: ElementType;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
  description: string; // Visual description for image generation
  imageUrl?: string; // Base64 or URL
  isPlayer: boolean;
}

export interface BattleState {
  player: Pokemon;
  opponent: Pokemon;
  turn: 'player' | 'opponent';
  gameStatus: 'loading' | 'battle' | 'won' | 'lost';
  logs: string[];
}

export interface GenerationResponse {
  playerPokemon: Pokemon;
  opponentPokemon: Pokemon;
}