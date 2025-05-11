
/**
 * Encryption utilities for secure message handling
 */

// Function to generate a key from a family ID
export const generateFamilyKey = async (familyId: string): Promise<CryptoKey> => {
  // Convert family ID to a byte array for key generation
  const encoder = new TextEncoder();
  const data = encoder.encode(familyId);
  
  // Use SHA-256 to get a consistent hash from the family ID
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  // Import the hash as a key for AES-GCM encryption
  return crypto.subtle.importKey(
    'raw',
    hash,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
};

// Function to encrypt message content
export const encryptMessage = async (
  plaintext: string, 
  familyId: string
): Promise<string> => {
  try {
    const key = await generateFamilyKey(familyId);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the message
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Combine the IV and encrypted data for storage
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 string for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Function to decrypt message content
export const decryptMessage = async (
  encryptedMessage: string,
  familyId: string
): Promise<string> => {
  try {
    const key = await generateFamilyKey(familyId);
    
    // Convert from base64 to array buffer
    const combined = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Decrypt the message
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Convert the decrypted data back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Encrypted message - unable to decrypt]';
  }
};
