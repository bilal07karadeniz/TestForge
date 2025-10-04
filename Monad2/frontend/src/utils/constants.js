export const MONAD_EXPLORER = 'https://testnet.monadscan.com';

export const getExplorerUrl = (type, hash) => {
  const routes = {
    address: 'address',
    tx: 'tx',
    token: 'token'
  };

  return `${MONAD_EXPLORER}/${routes[type]}/${hash}`;
};

export const API_URL = import.meta.env.VITE_API_URL || 'https://impartially-uncommunicating-zane.ngrok-free.dev';

export const SCORE_COLORS = {
  excellent: { min: 90, color: '#10B981', label: 'Excellent' },
  good: { min: 70, color: '#F59E0B', label: 'Good' },
  fair: { min: 50, color: '#EF4444', label: 'Fair' },
  poor: { min: 0, color: '#DC2626', label: 'Critical' }
};

export const getScoreColor = (score) => {
  if (score >= 90) return SCORE_COLORS.excellent;
  if (score >= 70) return SCORE_COLORS.good;
  if (score >= 50) return SCORE_COLORS.fair;
  return SCORE_COLORS.poor;
};
