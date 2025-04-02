import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { BlacklistedService } from 'src/modules/blacklisted/blacklisted.service';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

const SORA_ACCOUNT_REGEX = /^cn[a-zA-Z0-9]{47}$/;
const ETH_ACCOUNT_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ACCOUNT_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const SUPPORTED_ACCOUNT_FORMATS = [
  SORA_ACCOUNT_REGEX,
  ETH_ACCOUNT_REGEX,
  SOLANA_ACCOUNT_REGEX,
];

@Injectable()
@ValidatorConstraint({ async: true })
export class AccountIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blacklistedService: BlacklistedService) {}

  public async validate(accountId: string): Promise<boolean> {
    if (!this.isSupportedAccountFormat(accountId)) {
      return false;
    }

    if (!this.isValidChecksum(accountId)) {
      return false;
    }

    if (await this.isBlacklistedAccount(accountId)) {
      return false;
    }

    return true;
  }

  public defaultMessage(): string {
    return 'Account id is invalid or blacklisted.';
  }

  private isSupportedAccountFormat = (accountId: string): boolean =>
    SUPPORTED_ACCOUNT_FORMATS.some((format) => format.test(accountId));

  private isBlacklistedAccount = (accountId: string): Promise<boolean> =>
    this.blacklistedService.isBlacklisted(accountId);

  private isValidChecksum(accountId: string): boolean {
    try {
      if (accountId.startsWith('cn')) {
        encodeAddress(
          isHex(accountId) ? hexToU8a(accountId) : decodeAddress(accountId),
        );

        return true;
      } else if (accountId.startsWith('0x')) {
        return ethers.utils.isAddress(accountId);
      }
    } catch (error) {
      return false;
    }

    return true;
  }
}

export function IsAccountIdValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: AccountIdValidator,
    });
  };
}
