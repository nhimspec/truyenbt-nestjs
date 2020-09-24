import { HttpModule, Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';

@Module({
    imports: [HttpModule],
    providers: [CrawlService],
    exports: [HttpModule, CrawlService],
})
export class CrawlModule {}
