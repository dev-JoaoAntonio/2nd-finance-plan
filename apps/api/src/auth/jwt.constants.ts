import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const FALLBACK = 'dev-insecure-jwt-secret-change-me';
const logger = new Logger('JwtSecret');

/** Resolve o segredo JWT; loga aviso e usa fallback se JWT_SECRET ausente.
 *  O mesmo resolver é usado para assinar (auth.module) e verificar (jwt.strategy). */
export function resolveJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret) {
    logger.warn('JWT_SECRET ausente — usando fallback inseguro (apenas dev).');
    return FALLBACK;
  }
  return secret;
}
