export const hashPassword = async (password) => {
    // Simple hash for demo - in production use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  
  export const verifyPassword = async (password, hash) => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  };