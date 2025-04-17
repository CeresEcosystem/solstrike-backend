import {
  verifySignature,
  getUtf8Encoder,
  getPublicKeyFromAddress,
  address,
  SignatureBytes,
} from '@solana/kit';

import bs58 from 'bs58';

export default function isValidSignature(
  signature: string,
  message: string,
  accountId: string,
): Promise<boolean> {
  return isValidSignatureSol(message, signature, accountId);
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

  if (!verified || !isValidTimestamp(signedMessage)) {
    return false;
  }

  return true;
}

function isValidTimestamp(
  signedMessage: string,
  maxAgeSeconds = 4 * 60 * 60,
): boolean {
  const timestampString = signedMessage.split(' - ').pop();
  const timestamp = Number(timestampString);
  const currentUnixTime = Math.floor(Date.now() / 1000);

  return timestamp >= currentUnixTime - maxAgeSeconds;
}
