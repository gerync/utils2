import crypto from 'crypto';


// #region HMAC Hashing
// HMAC-SHA256 for data integrity (not passwords)
export function hashData(data: string, salt: string): string {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(data);
    return hash.digest('hex');
}
// Timing-safe HMAC comparison
export function verifyHash(data: string, salt: string, hashToCompare: string): boolean {
    const hash = hashData(data, salt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(hashToCompare, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}
// Hash with random salt
export function hashDataWithRandomSalt(data: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashData(data, salt);
    return { hash, salt };
}
// #endregion

// #region Password Hashing (scrypt)
// Scrypt for secure password storage
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16); // 128-bit random salt
    const hash = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
    // Store salt and hash as colon-separated hex strings
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
// Verify scrypt password hash
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');
    const derived = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(password, salt, storedHash.length, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(storedHash, derived);
}
// #endregion