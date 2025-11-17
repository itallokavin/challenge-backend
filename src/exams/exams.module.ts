import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { ExamConsumer } from './exam.consumer';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  controllers: [ExamsController],
  providers: [ExamsService, ExamConsumer]
})
export class ExamsModule {}
