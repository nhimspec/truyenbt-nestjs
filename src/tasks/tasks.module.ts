import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { MangaModule } from './manga/manga.module';

@Module({
    imports: [MangaModule],
    providers: [TasksService],
})
export class TasksModule {}
