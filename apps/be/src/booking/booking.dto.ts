import {
  IsInt,
  Min,
  IsString,
  Length,
  Matches,
  IsISO8601,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  surgeonId!: number;

  @IsISO8601()
  startAt!: string; // ISO string, ví dụ '2025-09-02T09:00:00.000Z'

  @IsInt()
  @Min(1)
  durationMin!: number; // thời lượng, tối thiểu 90 phút bạn có thể enforce trong controller

  @IsString()
  @Length(1, 100)
  patientName!: string;

  @IsString()
  @Length(1, 80)
  diseaseType!: string;

  @Matches(/^[0-9+()\-.\s]{8,20}$/)
  phone!: string;
}
