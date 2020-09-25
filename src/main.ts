import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import * as mongoose from 'mongoose';
import compression from 'fastify-compress';
import helmet from 'fastify-helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@src/pipes/validation.pipe';
import { ResponseInterceptor } from '@src/interceptors/response.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    mongoose.set('debug', true);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor());

    app.useStaticAssets({
        prefix: '/public/',
        root: join(__dirname, '..', 'public'),
    });

    app.enableCors();
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.register(compression, { encodings: ['gzip', 'deflate'] });
    app.register(helmet);

    await app.listen(8888);
}
bootstrap();
