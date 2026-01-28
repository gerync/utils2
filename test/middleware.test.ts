import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { generateSecret, generatedSecret, signToken, verifyTokenMiddleware, ErrorHandler } from '../functions/middleware';
import { ConfigureMessages } from '../functions/handler';
import { UserError } from '../models/UserError';

describe('JWT functions', () => {
    it('generateSecret returns a 128-char hex string', () => {
        const secret = generateSecret();
        expect(typeof secret).toBe('string');
        expect(secret.length).toBe(128);
    });

    it('generatedSecret is defined', () => {
        expect(generatedSecret).toBeDefined();
        expect(generatedSecret.length).toBe(128);
    });

    it('signToken returns a JWT string', () => {
        const token = signToken({ userId: 1 });
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3);
    });
});

describe('verifyTokenMiddleware', () => {
    // Wrap async middleware to catch thrown errors
    const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

    function makeApp() {
        const app = express();
        app.use(cookieParser());
        app.use(ConfigureMessages({ lang: 'en' }));
        app.get('/protected', asyncHandler(verifyTokenMiddleware), (req, res) => res.json({ ok: true }));
        app.use(ErrorHandler);
        return app;
    }

    it('rejects request without token', async () => {
        const app = makeApp();
        const res = await request(app).get('/protected');
        expect(res.status).toBe(401);
    });

    it('accepts valid token', async () => {
        const app = makeApp();
        const token = signToken({ userId: 1 }, { expiresIn: '1h' });
        const res = await request(app).get('/protected').set('Authorization', token);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });
});

describe('ErrorHandler middleware', () => {
    function makeApp(trigger: (req: express.Request, res: express.Response, next: express.NextFunction) => void) {
        const app = express();
        app.use(ConfigureMessages({ lang: 'en' }));
        app.get('/', trigger);
        app.use(ErrorHandler);
        return app;
    }

    it('handles generic error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('internal server error')));
        const res = await request(app).get('/');
        expect(res.status).toBe(500);
    });

    it('handles UserError', async () => {
        const app = makeApp((_req, _res, next) => next(new UserError('Custom error', 422)));
        const res = await request(app).get('/');
        expect(res.status).toBe(422);
        expect(res.body.error).toBe('Custom error');
    });

    it('handles duplicate key error (PostgreSQL)', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('Key (email)=(x) duplicate key')));
        const res = await request(app).get('/');
        expect(res.status).toBe(400);
    });

    it('handles duplicate key error (MongoDB)', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('E11000 index: email_1 dup key')));
        const res = await request(app).get('/');
        expect(res.status).toBe(400);
    });

    it('handles unauthorized error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('unauthorized')));
        const res = await request(app).get('/');
        expect(res.status).toBe(401);
    });

    it('handles forbidden error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('forbidden')));
        const res = await request(app).get('/');
        expect(res.status).toBe(403);
    });

    it('handles not found error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('not found')));
        const res = await request(app).get('/');
        expect(res.status).toBe(404);
    });

    it('handles bad request error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('bad request')));
        const res = await request(app).get('/');
        expect(res.status).toBe(400);
    });

    it('handles jwt expired error', async () => {
        const app = makeApp((_req, _res, next) => next(new Error('jwt expired')));
        const res = await request(app).get('/');
        expect(res.status).toBe(401);
    });
});
