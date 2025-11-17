import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { randomUUID } from 'crypto';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class ExamsService {
    constructor( 
        private prisma: PrismaService,
        private rabbitmq: RabbitMQService
    ){}

    async findAll(user: { role: string }) {
        if (user.role === 'ATTENDANT') {
            return this.prisma.medicalExam.findMany();
        }

        if (user.role === 'DOCTOR') {
            return this.prisma.medicalExam.findMany({
                where: { status: 'DONE' },
            });
        }

        throw new HttpException('Você não tem permissão.', HttpStatus.FORBIDDEN);
    }

    async uploadExam(files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Nenhum arquivo selecionado.');
        }

        const savedExams: any[] = [];

        try {
            for (const file of files) {
                const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
                const fileName = `${randomUUID()}.${fileExtension}`;
                const fileLocale = path.resolve(process.cwd(), 'files', fileName);

                await fs.writeFile(fileLocale, file.buffer);

                const exam = await this.prisma.medicalExam.create({
                    data: {
                        title: file.originalname,
                        imagePath: fileName,
                        status: 'PENDING'
                    }
                });

                savedExams.push(exam);

                await this.rabbitmq.publish('exam_processing_queue', { examId: exam.id });
            }

            return {
                message: 'Exame(s) enviado(s) com sucesso',
                savedExams,
            };

        } catch (error) {
            console.error('Erro ao processar upload de exames:', error);

            for (const exam of savedExams) {
                await this.prisma.medicalExam.delete({
                    where: { id: exam.id },
                });

                const filePath = path.resolve(process.cwd(), 'files', exam.imagePath);
                await fs.rm(filePath).catch(() => null);
            }
            throw new BadRequestException('Erro ao fazer upload dos exames.');
        }
    }

    async createReport(examId: string, reportText: string) {
        
        const exam = await this.prisma.medicalExam.findUnique({
            where: { id: examId },
        });

        if (!exam) {
            throw new HttpException('Exame não encontrado.', HttpStatus.NOT_FOUND);
        }

        if (exam.status !== 'DONE') {
            throw new BadRequestException( 'Só é possível adicionar laudo a exames com status DONE.');
        }

        const updatedExam = await this.prisma.medicalExam.update({
            where: { id: examId },
            data: {
            report: reportText,
            status: 'REPORTED',
            },
        });

        return {
            message: 'Laudo submetido com sucesso!',
            exam: updatedExam,
        };
    }
}