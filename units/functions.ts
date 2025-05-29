import crypto from 'crypto'

export function generateSecurePassword(length: number = 12): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    const randomBytes = crypto.randomBytes(length)
    
    for (let i = 0; i < length; i++) {
        password += characters[randomBytes[i] % characters.length];
    }
    
    return password
}