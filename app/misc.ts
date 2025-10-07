import { customAlphabet } from 'nanoid';

export function uid(length = 10) {
  return customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length
  )();
}
