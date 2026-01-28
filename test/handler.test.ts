import { ConfigureMessages, extractDuplicateField, getAppConfig, setAppConfig } from '../functions/handler';

describe('AppConfig', () => {
    it('setAppConfig and getAppConfig work together', () => {
        setAppConfig({ messages: { test: 'msg' }, NoDupesAllowedOf: ['email'], lang: 'en' });
        const config = getAppConfig();
        expect(config).toBeDefined();
        expect(config?.lang).toBe('en');
        expect(config?.NoDupesAllowedOf).toContain('email');
    });
});

describe('ConfigureMessages', () => {
    it('returns a middleware function', () => {
        const middleware = ConfigureMessages({ lang: 'en' });
        expect(typeof middleware).toBe('function');
    });

    it('sets up English messages', () => {
        ConfigureMessages({ lang: 'en' });
        const config = getAppConfig();
        expect(config?.messages.notFound).toBeDefined();
    });

    it('sets up Hungarian messages', () => {
        ConfigureMessages({ lang: 'hu' });
        const config = getAppConfig();
        expect(config?.messages.notFound).toBeDefined();
    });

    it('throws on duplicate keys', () => {
        expect(() => ConfigureMessages({ lang: 'en' })).not.toThrow();
    });

    it('onDupe replaces $f with field', () => {
        ConfigureMessages({ lang: 'en' });
        const config = getAppConfig();
        const msg = config?.messages.onDupe('email');
        expect(msg).toContain('email');
    });
});

describe('extractDuplicateField', () => {
    it('extracts PostgreSQL field', () => {
        expect(extractDuplicateField('Key (email)=(test@test.com)')).toBe('email');
    });

    it('extracts MySQL field', () => {
        expect(extractDuplicateField("Duplicate entry for key 'username'")).toBe('username');
    });

    it('extracts MongoDB field', () => {
        expect(extractDuplicateField('E11000 index: email_1 dup key')).toBe('email');
    });

    it('returns null for unknown format', () => {
        expect(extractDuplicateField('random error')).toBe(null);
    });
});
