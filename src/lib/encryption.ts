import Cryptr from "cryptr";

let _cryptr: Cryptr | null = null;

function getCryptr(): Cryptr {
  if (!_cryptr) {
    _cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);
  }
  return _cryptr;
}

export const encrypt = (text: string) => getCryptr().encrypt(text);
export const decrypt = (text: string) => getCryptr().decrypt(text);
