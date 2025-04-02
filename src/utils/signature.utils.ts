export default function isValidSignature(
  network: string,
  signature: string,
  message: string,
  accountId: string,
): boolean {
  if (network === 'SOLANA') {
    return isValidSignatureSol(message, signature, accountId);
  }

  return false;
}

function isValidSignatureSol(
  signedMessage: string,
  signature: string,
  accountId: string,
): boolean {
  // TODO: Implement this function

  throw new Error('Solana signature verification not implemented');
}
