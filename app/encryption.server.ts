import crypto from 'node:crypto';

let secret = 'not-at-all-secret';

if (process.env.MAGIC_LINK_SECRET) {
  secret = process.env.MAGIC_LINK_SECRET;
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('Must set MAGIC_LINK_SECRET');
}

const ALGORITHM = 'aes-256-ctr';
const ENCRYPTION_KEY = crypto.scryptSync(secret, 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text: string, secret?: string) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(ALGORITHM, secret ?? ENCRYPTION_KEY, iv);
  let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text: string, secret?: string) {
  let [ivPart, encryptedPart] = text.split(':');

  if (!ivPart || !encryptedPart) {
    throw new Error('Invalid text.');
  }

  let iv = Buffer.from(ivPart, 'hex');
  let encryptedText = Buffer.from(encryptedPart, 'hex');
  let decipher = crypto.createDecipheriv(
    ALGORITHM,
    secret ?? ENCRYPTION_KEY,
    iv
  );
  let decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ]);

  return decrypted.toString();
}

export { encrypt, decrypt };
