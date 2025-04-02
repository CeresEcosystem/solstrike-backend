import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { signatureVerify } from '@polkadot/util-crypto';
import { ethers } from 'ethers';

export default function isValidSignature(
  network: string,
  signature: string,
  message: string,
  accountId: string,
): boolean {
  if (network === 'SORA') {
    return isValidSignatureSora(message, signature, accountId);
  }

  if (network === 'ASTAR' || network === 'ETHEREUM') {
    return isValidSignatureEthers(message, signature, accountId);
  }

  return false;
}

function isValidSignatureSora(
  signedMessage: string,
  signature: string,
  accountId: string,
): boolean {
  const publicKey = decodeAddress(accountId);
  const hexPublicKey = u8aToHex(publicKey);

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
}

function isValidSignatureEthers(
  signedMessage: string,
  signature: string,
  accountId: string,
): boolean {
  return accountId === ethers.utils.verifyMessage(signedMessage, signature);
}
