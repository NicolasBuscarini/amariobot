import { Options } from '@mikro-orm/core';
import { User } from '../models/user.model';
import { AppConfig } from './environment';

const options: Options = {
  type: 'mongo',
  entities: [User],
  clientUrl: AppConfig.MONGO_DB_HOST,
  user: AppConfig.MONGO_DB_USERNAME,
  password: AppConfig.MONGO_DB_PASSWORD,
  dbName: AppConfig.MONGO_DB_NAME,
  debug: true,
};

export default options;
