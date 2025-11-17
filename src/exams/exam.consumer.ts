import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class ExamConsumer implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.consume('exam_processing_queue', async ({ examId }) => {

      await this.prisma.medicalExam.update({
        where: { id: examId },
        data: { status: 'PROCESSING' },
      });

      const delay = Math.floor(Math.random() * 10000) + 5000;
      await new Promise((r) => setTimeout(r, delay));

      const success = Math.random() > 0.3; 

      if (success) {
        await this.prisma.medicalExam.update({
          where: { id: examId },
          data: {
            status: 'DONE',
            processingResult: 'Processamento concluído com sucesso.',
          },
        });
      } else {
        await this.prisma.medicalExam.update({
          where: { id: examId },
          data: {
            status: 'ERROR',
            processingResult: 'Falha ao processar o exame.',
          },
        });
      }

    });
  }
  
}
