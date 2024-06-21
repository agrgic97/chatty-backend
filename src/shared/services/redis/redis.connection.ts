import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log: Logger = config.createLogger('redis-connection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redis-connection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      log.info(`Redis connection: ${(await this.client.ping()) === 'PONG' ? 'successful' : 'failed'}`);
    } catch (error) {
      this.log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
