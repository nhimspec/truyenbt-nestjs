import { Logger, Module } from '@nestjs/common';
import * as winston from 'winston';
import * as dayjs from 'dayjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MangaController } from './manga/manga.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { DATE_FORMAT } from './common/constants';

const date = dayjs().format(DATE_FORMAT);

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        MongooseModule.forRoot(process.env.DB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        }),
        WinstonModule.forRoot({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.simple(),
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: `logs/${date}/error.log`,
                    level: 'error',
                }),
                new winston.transports.File({
                    filename: `logs/${date}/info.log`,
                    level: 'info',
                }),
            ],
            exceptionHandlers: [new winston.transports.File({ filename: `logs/${date}/exceptions.log` })],
        }),

        TasksModule,
    ],
    controllers: [AppController, MangaController],
    providers: [AppService, Logger],
})
export class AppModule {}
