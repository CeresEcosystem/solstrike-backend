import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlacklistedService } from 'src/modules/blacklisted/blacklisted.service';
import { Injectable } from '@nestjs/common';

const SOLANA_ACCOUNT_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const SUPPORTED_ACCOUNT_FORMATS = [SOLANA_ACCOUNT_REGEX];

@Injectable()
@ValidatorConstraint({ async: true })
export class AccountIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly blacklistedService: BlacklistedService) {}

  public async validate(accountId: string): Promise<boolean> {
    if (!this.isSupportedAccountFormat(accountId)) {
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
