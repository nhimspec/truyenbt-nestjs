import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BusinessModule } from '@src/business/business.module';

@Module({
    imports: [BusinessModule],
    providers: [TasksService],
})
export class TasksModule {}
