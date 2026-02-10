import pkg from 'jsonwebtoken';
import type { Response, Request, NextFunction } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

// #region secretGen
const { sign, verify, decode } = pkg;
export function generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
}

export const generatedSecret = generateSecret();
// #endregion
// #region sign
export function signToken(payload: object, options?: SignOptions): string {
    return sign(payload, generatedSecret, options);
}
// #endregion
// #region verifyTokenMiddleware
export async function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    const auth = req.cookies.auth || req.headers['authorization'];
    if (!auth) {
        throw new Error('Unauthorized');
    }
    try {
        const decoded = decode(auth);
        if (decoded && typeof decoded === 'object' && decoded.exp) {
            const isExpired = decoded.exp * 1000 < Date.now();
            if (isExpired) {
                throw new Error('jwt expired');
            }
        }
        const token = verify(auth, generatedSecret);
        (req as any).user = token;
        next();
    } catch (err) {
        throw new Error('Unauthorized');
    }
}
// #endregion