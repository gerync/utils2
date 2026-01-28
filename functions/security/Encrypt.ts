import crypto from 'crypto';

// #region Derive 256-bit key from string
function deriveKey(key: string): Buffer {
    return crypto.createHash('sha256').update(key, 'utf8').digest();
}
// #endregion

// #region Encryption
export function encryptData(data: string, key: string): string {
    // Random 12-byte IV
    const iv = crypto.randomBytes(12);
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(key), iv);
    // Encrypt data
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    // Get auth tag
    const authTag = cipher.getAuthTag();
    // Return iv:tag:ciphertext (hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
// #endregion

// #region Decryption
export function decryptData(data: string, key: string): string {
    const [ivHex, tagHex, encryptedHex] = data.split(':');
    if (!ivHex || !tagHex || !encryptedHex) {
        throw new Error('Invalid encrypted payload format.');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(key), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
// #endregion