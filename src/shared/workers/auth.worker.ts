import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      log.info('Adding user to database', job.data);
      const { value } = job.data;
      await authService.createUser(value);
      await job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('Error adding user to database', error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
