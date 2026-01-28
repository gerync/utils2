// Helper to extract the field name from database error messages
export function extractDuplicateField(errorMessage: string): string | null {
    // PostgreSQL: Key (email)=(value)
    const pgMatch = errorMessage.match(/Key \((\w+)\)/);
    if (pgMatch?.[1]) return pgMatch[1];
    
    // MySQL: for key 'email'
    const mysqlMatch = errorMessage.match(/for key '(\w+)'/i);
    if (mysqlMatch?.[1]) return mysqlMatch[1];
    
    // MongoDB: index: email_1
    const mongoMatch = errorMessage.match(/index:\s*(\w+)_/);
    if (mongoMatch?.[1]) return mongoMatch[1];
    
    return null;
}
