import Queue from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import Bull from 'bull';
import Arena from 'bull-arena';
import { IQueue } from '@service/queues/interfaces/queue.interface';
import { IEmailJob, IUserJob } from '@user/interfaces/user.interface';

type IBaseJobData = IAuthJob
  | IUserJob
  | IEmailJob;

const queues: IQueue[] = [];
export let arenaConfig: any;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  protected constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    const queueConfig: IQueue = {
      type: 'bull',
      name: queueName,
      hostId: 'localhost',
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: ''
      }
    };
    queues.push(queueConfig);
    arenaConfig = Arena(
      {
        Bull,
        queues
      },
      {
        disableListen: true,
        basePath: '/queues'
      }
    );

    this.log = config.createLogger(`${queueName} Queue`);

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000
      }
    });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
