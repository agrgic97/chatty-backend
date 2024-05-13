import mongoose from 'mongoose';
import * as process from 'process';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('setup-database');

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Successfully connected to database');
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };

  connect();

  mongoose.connection.on('disconnect', connect);
};
