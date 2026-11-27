import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function key(): Buffer {
  const secret = process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error('Set DATA_ENCRYPTION_KEY to encrypt channel credentials.');
  return createHash('sha256').update(secret).digest();
}

export function encryptCredential(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}.${cipher.getAuthTag().toString('hex')}.${encrypted.toString('hex')}`;
}

export function decryptCredential(payload: string): string {
  const [ivHex, tagHex, encryptedHex] = payload.split('.');
  if (!ivHex || !tagHex || !encryptedHex) throw new Error('Stored channel credential has an invalid format.');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
}
