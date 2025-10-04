import { API_URL } from '../utils/constants';

export const analyzeContract = async (file) => {
  const formData = new FormData();
  formData.append('contract', file);

  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze contract');
  }

  return response.json();
};

export const analyzeContractCode = async (contractCode) => {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contractCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze contract');
  }

  return response.json();
};
