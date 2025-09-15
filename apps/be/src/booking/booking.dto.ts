import {
  IsInt,
  Min,
  IsString,
  Length,
  Matches,
  IsISO8601,
  IsOptional,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  surgeonId!: number;

  @IsISO8601()
  startAt!: string; // ISO string, ví dụ '2025-09-02T09:00:00.000Z'

  @IsInt()
  @Min(1)
  durationMin!: number; // thời lượng, tối thiểu 90 phút

  // Thông tin bệnh nhân
  @IsString()
  @Length(1, 100)
  patientName!: string;

  @Matches(/^[0-9+\-.\s()]{8,15}$/, {
    message:
      'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại từ 8-15 chữ số.',
  })
  patientPhone!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  patientDiagnosis?: string;

  // Thông tin người đặt lịch (có thể khác với bệnh nhân)
  @IsOptional()
  @IsString()
  @Length(1, 100)
  bookerName?: string;

  @Matches(/^[0-9+\-.\s()]{8,15}$/, {
    message:
      'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại từ 8-15 chữ số.',
  })
  bookerPhone!: string;
}
