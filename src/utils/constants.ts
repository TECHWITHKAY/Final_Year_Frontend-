export const COMMODITIES = ['Maize', 'Rice', 'Tomato', 'Yam', 'Plantain', 'Groundnut'] as const;
export const CITIES = ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast'] as const;

export const COMMODITY_EMOJIS: Record<string, string> = {
  Maize: '🌽',
  Rice: '🌾',
  Tomato: '🍅',
  Yam: '🍠',
  Plantain: '🍌',
  Groundnut: '🥜',
};

export const CHART_COLORS = [
  '#1B5E20', '#2E7D32', '#F9A825', '#E65100', '#4A6741', '#C62828',
];

export const GRADE_COLORS: Record<string, string> = {
  A: '#1B5E20',
  B: '#33691E',
  C: '#F57F17',
  D: '#E65100',
  F: '#B71C1C',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  ANALYST: 'ANALYST',
  FIELD_AGENT: 'FIELD_AGENT',
} as const;
