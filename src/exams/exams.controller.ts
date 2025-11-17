import { Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ExamsService } from './exams.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateReportDto } from './dto/create-report.dto';


@Controller('exams')
export class ExamsController {

    constructor(private examsService: ExamsService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Req() req){
        return this.examsService.findAll(req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FilesInterceptor('files'))
    @Roles('ATTENDANT')
    @Post('upload')
    async createExam(
        @UploadedFiles() files: Array<Express.Multer.File>
    ){
        return this.examsService.uploadExam(files);
    }

    @Post(':id/report')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('DOCTOR')
    async createReport(
        @Param('id') id: string,
        @Body() createReport: CreateReportDto,
    ) {
        return this.examsService.createReport(id, createReport.report);
    }

}
