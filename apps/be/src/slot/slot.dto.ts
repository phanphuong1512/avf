import { IsISO8601, IsInt, Min, IsOptional } from 'class-validator';

export class SlotsQueryDto {
  @IsISO8601()
  date!: string; // YYYY-MM-DD

  @IsInt()
  @Min(1)
  surgeonId!: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMin?: number; // mặc định 90

  @IsInt()
  @Min(1)
  @IsOptional()
  stepMin?: number; // mặc định 15

  @IsInt()
  @IsOptional()
  startHour?: number; // mặc định 9

  @IsInt()
  @IsOptional()
  endHour?: number; // mặc định 19
}
