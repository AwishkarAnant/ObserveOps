type Level = 'info' | 'warn' | 'error' | 'debug';

function emit(level: Level, scope: string, message: string, meta?: unknown): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export class Logger {
  constructor(private readonly scope: string) {}

  info(message: string, meta?: unknown): void {
    emit('info', this.scope, message, meta);
  }
  warn(message: string, meta?: unknown): void {
    emit('warn', this.scope, message, meta);
  }
  error(message: string, meta?: unknown): void {
    emit('error', this.scope, message, meta);
  }
  debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) emit('debug', this.scope, message, meta);
  }
}

export const logger = (scope: string): Logger => new Logger(scope);
