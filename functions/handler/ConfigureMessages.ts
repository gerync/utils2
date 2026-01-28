import type { Request, Response, NextFunction } from 'express';
import { setAppConfig } from './AppConfig';
import enMessages from '../../lang/en.json';
import huMessages from '../../lang/hu.json';

// Configuration Middleware at the start of a express app
// to setup custom messages for various responses
export function ConfigureMessages(payload: any) {
    // Fields to track for duplicate key errors
    const NoDupesAllowedOf: string[] = payload?.NoDupesAllowedOf || [];
    
    let lang = payload?.lang || 'en';
    const defaultMessages = lang === 'hu' ? huMessages : enMessages;
    
    let messages = {
        // Error messages
        notFound: payload?.OnNotFound || defaultMessages.notFound,
        badRequest: payload?.OnBadRequest || defaultMessages.badRequest,
        unauthorized: payload?.OnUnauthorized || defaultMessages.unauthorized,
        expired: payload?.OnExpired || defaultMessages.expired,
        forbidden: payload?.OnForbidden || defaultMessages.forbidden,
        serverError: payload?.OnServerError || defaultMessages.serverError,
        onDupe: function(field: string) {
            // Customize duplicate field message
            // $f will be replaced by the field name
            let msg = payload?.OnDupe || defaultMessages.onDupe;
            return msg.replace('$f', field);
        }
    };
    
    // Store config globally
    setAppConfig({ messages, NoDupesAllowedOf, lang });
    
    // Return middleware function
    return (req: Request, res: Response, next: NextFunction) => {
        req.app.locals.config = { messages, NoDupesAllowedOf, lang };
        next();
    };
}
