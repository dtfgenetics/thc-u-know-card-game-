const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createSessionCode(length = 6, random = Math.random): string {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    const characterIndex = Math.floor(random() * codeAlphabet.length);
    code += codeAlphabet[characterIndex] ?? 'A';
  }
  return code;
}

export function normalizeSessionCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}
