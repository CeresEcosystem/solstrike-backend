import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { AccountIdValidator } from '../validators/account-id.validator';

@Injectable()
export class AccountIdPipe implements PipeTransform<string> {
  constructor(private readonly accountIdValidator: AccountIdValidator) {}

  async transform(accountId: string): Promise<string> {
    const isValid = await this.accountIdValidator.validate(accountId);

    if (!isValid) {
      throw new BadRequestException(this.accountIdValidator.defaultMessage());
    }

    return accountId;
  }
}
