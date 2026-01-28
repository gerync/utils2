# @gerync/utils2

## 1.0.0

Express.js utilities: error handling, JWT, encryption, hashing.

## Install

```bash
npm install @gerync/utils2
```

## Quick Start

```typescript
import { ConfigureMessages, ErrorHandler, UserError } from '@gerync/utils2';

app.use(ConfigureMessages({ lang: 'en' }));
// ... routes
app.use(ErrorHandler);

// Throw custom errors
throw new UserError('Email required', 400);
```

## Error Messages

```typescript
ConfigureMessages({
    lang: 'en',                      // 'en' | 'hu'
    OnDupe: '$f already exists',     // $f = field name
    OnNotFound: 'Not found',
    OnBadRequest: 'Bad request',
    OnUnauthorized: 'Unauthorized',
    OnForbidden: 'Forbidden',
    OnServerError: 'Server error',
    // Fields to track for duplicate errors
    NoDupesAllowedOf: ['email', 'username']
})
```

When a duplicate key error occurs (e.g., `Key (email)=(x) already exists`), the handler extracts `email`, checks if it's in `NoDupesAllowedOf`, and returns `{ error: 'email already exists' }`.

## Security Utils

```typescript
import { encryptData, decryptData, hashPassword, verifyPassword } from '@gerync/utils2';

// Encryption (AES-256-GCM)
const encrypted = encryptData('secret', 'key');
const decrypted = decryptData(encrypted, 'key');

// Password hashing (scrypt)
const hash = await hashPassword('password');
const valid = await verifyPassword('password', hash);
```

## JWT

```typescript
import { signToken, verifyTokenMiddleware } from '@gerync/utils2';

const token = signToken({ userId: 1 }, { expiresIn: '1h' });
app.get('/protected', verifyTokenMiddleware, handler);
```

## Supported Databases

PostgreSQL, MySQL, SQL Server, SQLite, MongoDB — duplicate key errors auto-detected.