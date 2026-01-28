import type { Request, Response, NextFunction } from 'express';
import coloredlog from '../util/ColoredLog';
import { UserError } from '../../models/UserError';
import { getAppConfig } from '../handler/AppConfig';
import { extractDuplicateField } from '../handler/extractDuplicateField';

// Error Handling Middleware at the end of an express app
export async function ErrorHandler(err: Error | UserError, req: Request, res: Response, next: NextFunction) {
    const AppConfig = getAppConfig();
    
    if (err instanceof UserError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    else {
        if (err.message === 'jwt expired') {
            return res.status(401).json({ error: AppConfig?.messages.expired });
        }
        // #region Handle Duplicate Key Errors
        if (err.message.toUpperCase() === 'ERR_DUPLICATE_KEY' ||
            err.message.toLowerCase().includes('duplicate key') ||
            err.message.toLowerCase().includes('duplicate entry') ||
            err.message.toLowerCase().includes('unique constraint') ||
            err.message.toLowerCase().includes('unique violation') ||
            err.message.toLowerCase().includes('violation of primary key') ||
            err.message.toLowerCase().includes('violation of unique') ||
            err.message.includes('E11000') ||
            err.message.includes('23505') ||
            err.message.includes('2627') ||
            err.message.includes('2601')
        ) {
            // handle duplicate error
            const field = extractDuplicateField(err.message);
            if (field && AppConfig?.NoDupesAllowedOf.includes(field)) {
                return res.status(400).json({ error: AppConfig?.messages.onDupe(field) });
            }
            return res.status(400).json({ error: AppConfig?.messages.onDupe(AppConfig?.lang === 'hu' ? 'Ez az érték' : 'This value') });
        }
        // #endregion
        if (err.message.toLowerCase().includes('validation failed')) {
            return res.status(400).json({ error: AppConfig?.messages.badRequest });
        }
        if (err.message.toLowerCase().includes('expired')) {
            return res.status(401).json({ error: AppConfig?.messages.expired });
        }
        if (err.message.toLowerCase().includes('unauthorized')) {
            return res.status(401).json({ error: AppConfig?.messages.unauthorized });
        }
        if (err.message.toLowerCase().includes('forbidden')) {
            return res.status(403).json({ error: AppConfig?.messages.forbidden });
        }
        if (err.message.toLowerCase().includes('not found')) {
            return res.status(404).json({ error: AppConfig?.messages.notFound });
        }
        if (err.message.toLowerCase().includes('bad request')) {
            return res.status(400).json({ error: AppConfig?.messages.badRequest });
        }
        if (err.message.toLowerCase().includes('internal server error')) {
            return res.status(500).json({ error: AppConfig?.messages.serverError });
        }
    }
    coloredlog(['Error:', `${err.message}`], ['white', '#ff0000'], true);
    coloredlog(err.stack || '', '#7a4646', false);
    // Add this to handle unmatched errors:
    return res.status(500).json({ error: AppConfig?.messages.serverError });
}
