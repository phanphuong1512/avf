import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  async create(@Body() body: CreateBookingDto) {
    if (body.durationMin < 90) {
      throw new BadRequestException('Thời lượng tối thiểu là 90 phút.');
    }
    const startAt = new Date(body.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('startAt không hợp lệ.');
    }
    return this.service.create({
      surgeonId: body.surgeonId,
      startAt,
      durationMin: body.durationMin,
      patientName: body.patientName,
      phone: body.phone,
      diseaseType: body.diseaseType,
    });
  }
}
