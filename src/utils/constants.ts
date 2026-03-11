export const COMMODITIES = [
  'Maize (White)', 'Maize (Yellow)', 'Rice (Local)', 'Rice (Imported)',
  'Millet', 'Sorghum', 'Yam (Pona)', 'Cassava', 'Plantain (Apem)',
  'Plantain (Apantu)', 'Tomato', 'Onion', 'Pepper (Fresh)', 'Garden Eggs',
  'Cowpea (White)', 'Soya Beans', 'Gari', 'Groundnut', 'Pineapple', 'Mango'
] as const;

export const CITIES = ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Sunyani', 'Wa', 'Koforidua'] as const;

export const COMMODITY_EMOJIS: Record<string, string> = {
  'Maize (White)': '🌽',
  'Maize (Yellow)': '🌽',
  'Rice (Local)': '🌾',
  'Rice (Imported)': '🌾',
  'Tomato': '🍅',
  'Yam (Pona)': '🍠',
  'Plantain (Apem)': '🍌',
  'Plantain (Apantu)': '🍌',
  'Groundnut': '🥜',
  'Onion': '🧅',
  'Cassava': '🥔',
  'Mango': '🥭',
  'Pineapple': '🍍',
  'Gari': '🥣',
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
