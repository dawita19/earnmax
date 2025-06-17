export const generateInviteCode = (userId: string): string => {
  // Simple hash function to create a consistent invite code
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  // Convert to base36 and take first 6 characters
  return Math.abs(hash).toString(36).slice(0, 6).toUpperCase();
};

export const validateInviteCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

export const getInviteLink = (code: string): string => {
  return `${window.location.origin}/signup?ref=${code}`;
};