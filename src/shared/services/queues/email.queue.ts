import {BaseQueue} from './base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@worker/email.worker';

class EmailQueue extends BaseQueue {
  constructor(queueName: string) {
    super(queueName);
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(jobName: string, data: IEmailJob): void {
    this.addJob(jobName, data);
  }
}

export const emailQueue = new EmailQueue('email');
