import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { Gamer } from '../../modules/gamer/entity/gamer.entity';
import { GamerLog } from '../../modules/gamer/entity/gamer-log.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('PG_HOST'),
  port: configService.get('PG_PORT'),
  username: configService.get('PG_USER'),
  password: configService.get('PG_PASSWORD'),
  database: configService.get('PG_DB_NAME'),
  entities: [Gamer, GamerLog],
  migrations: ['src/database/pg/migrations/*'],
  migrationsTableName: 'migrations',
});

//'src/**/*.entity.ts'
