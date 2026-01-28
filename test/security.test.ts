import {
    hashData,
    verifyHash,
    hashDataWithRandomSalt,
    hashPassword,
    verifyPassword,
    encryptData,
    decryptData,
} from '../functions/security';

describe('Hash functions', () => {
    const data = 'testdata';
    const salt = 'saltsalt';

    it('hashData returns hex string', () => {
        const hash = hashData(data, salt);
        expect(typeof hash).toBe('string');
        expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('verifyHash returns true for correct hash', () => {
        const hash = hashData(data, salt);
        expect(verifyHash(data, salt, hash)).toBe(true);
    });

    it('verifyHash returns false for incorrect hash', () => {
        const hash = hashData(data, salt);
        expect(verifyHash('wrong', salt, hash)).toBe(false);
    });

    it('hashDataWithRandomSalt returns hash and salt', () => {
        const result = hashDataWithRandomSalt(data);
        expect(result.hash).toBeDefined();
        expect(result.salt).toBeDefined();
        expect(verifyHash(data, result.salt, result.hash)).toBe(true);
    });
});

describe('Password functions', () => {
    const password = 'SecureP@ss123';

    it('hashPassword returns salt:hash format', async () => {
        const hashed = await hashPassword(password);
        expect(hashed).toContain(':');
        expect(hashed.split(':').length).toBe(2);
    });

    it('verifyPassword returns true for correct password', async () => {
        const hashed = await hashPassword(password);
        expect(await verifyPassword(password, hashed)).toBe(true);
    });

    it('verifyPassword returns false for wrong password', async () => {
        const hashed = await hashPassword(password);
        expect(await verifyPassword('wrong', hashed)).toBe(false);
    });

    it('verifyPassword returns false for invalid format', async () => {
        expect(await verifyPassword(password, 'invalid')).toBe(false);
    });
});

describe('Encrypt functions', () => {
    const key = 'mysecretkey';
    const plaintext = 'Hello, World!';

    it('encryptData returns iv:tag:ciphertext', () => {
        const encrypted = encryptData(plaintext, key);
        expect(encrypted.split(':').length).toBe(3);
    });

    it('decryptData returns original plaintext', () => {
        const encrypted = encryptData(plaintext, key);
        const decrypted = decryptData(encrypted, key);
        expect(decrypted).toBe(plaintext);
    });

    it('decryptData throws on tampered ciphertext', () => {
        const encrypted = encryptData(plaintext, key);
        const parts = encrypted.split(':');
        if (parts[2]) {
            parts[2] = parts[2].slice(0, -2) + 'ff';
        }
        expect(() => decryptData(parts.join(':'), key)).toThrow();
    });

    it('decryptData throws on invalid format', () => {
        expect(() => decryptData('badformat', key)).toThrow('Invalid encrypted payload format.');
    });

    it('decryptData throws on wrong key', () => {
        const encrypted = encryptData(plaintext, key);
        expect(() => decryptData(encrypted, 'wrongkey')).toThrow();
    });
});
