import { IsNotEmpty, IsString} from 'class-validator';

export class CreateReportDto {
  @IsString({ message: 'O laudo deve ser um texto.' })
  @IsNotEmpty({ message: 'O laudo não pode estar vazio.' })
  report: string;
}