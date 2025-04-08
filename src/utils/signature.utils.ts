import {
  verifySignature,
  getUtf8Encoder,
  getPublicKeyFromAddress,
  address,
  SignatureBytes,
} from '@solana/kit';

import bs58 from 'bs58';

export default function isValidSignature(
  network: string,
  signature: string,
  message: string,
  accountId: string,
): Promise<boolean> {
  if (network === 'SOLANA') {
    return isValidSignatureSol(message, signature, accountId);
  }
  return Promise.resolve(false);
}

async function isValidSignatureSol(
  signedMessage: string,
  signature: string,
  accountId: string,
): Promise<boolean> {
  const addr = address(accountId);
  const message = getUtf8Encoder().encode(signedMessage);
  const signatureBytes = bs58.decode(signature) as SignatureBytes;

  const pk = await getPublicKeyFromAddress(addr);

  const verified = await verifySignature(pk, signatureBytes, message);

  return verified;

  throw new Error('Solana signature verification not implemented');
}
