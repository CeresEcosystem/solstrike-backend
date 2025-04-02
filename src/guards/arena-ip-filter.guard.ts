import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { IPVersion, BlockList as Whitelist, isIPv4, isIPv6 } from 'net';
import {
  DEFAULT_IPV4_MASK,
  DEFAULT_IPV6_MASK,
  WHITELISTED_IPS,
} from './arena-ip-filter.constants';
import { getClientIp } from 'request-ip';

@Injectable()
export class ArenaIpFilterGuard implements CanActivate {
  private readonly logger = new Logger(ArenaIpFilterGuard.name);

  private whitelist: Whitelist;

  constructor() {
    this.whitelist = this.buildWhitelistedIPs();
  }

  canActivate(context: ExecutionContext): boolean {
    this.logHeaders(context);
    const clientIp = this.findClientIp(context);
    const [ipVersion] = this.getIpVersion(clientIp);

    const isAllowed = this.whitelist.check(clientIp, ipVersion);

    if (!isAllowed) {
      this.logger.warn(`Forbidden request from IP: ${clientIp}`);
    }

    return isAllowed;
  }

  private logHeaders(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();

    this.logger.debug(JSON.stringify(request.headers));
  }

  private findClientIp(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();

    return getClientIp(request) || '';
  }

  private buildWhitelistedIPs(): Whitelist {
    const whitelist = new Whitelist();

    WHITELISTED_IPS.forEach((ipRange) => {
      const [ip, range] = ipRange.split('/');
      const [ipVersion, defaultMask] = this.getIpVersion(ip);
      const mask = Number(range ?? defaultMask);

      whitelist.addSubnet(ip, mask, ipVersion);
    });

    return whitelist;
  }

  private getIpVersion(ip: string): [IPVersion, string] {
    if (isIPv4(ip)) {
      return ['ipv4', DEFAULT_IPV4_MASK];
    }

    if (isIPv6(ip)) {
      return ['ipv6', DEFAULT_IPV6_MASK];
    }

    throw new Error('Invalid IP format.');
  }
}
