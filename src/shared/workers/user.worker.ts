import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { userService } from '@service/db/user.service';

const log: Logger = config.createLogger('authWorker');

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      log.info('Adding user to database', job.data);
      const { value } = job.data;
      await userService.addUserData(value);
      await job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('Error adding user to database', error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
