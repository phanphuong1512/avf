import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get()
  list(@Query('surgeonId') surgeonId?: string, @Query('date') date?: string) {
    if (surgeonId) {
      return this.service.getBookingsBySurgeon(parseInt(surgeonId), date);
    }
    return this.service.list();
  }

  @Post()
  async create(@Body() body: CreateBookingDto) {
    if (body.durationMin < 90) {
      throw new BadRequestException('Thời lượng tối thiểu là 90 phút.');
    }

    // Parse startAt as Vietnam time (frontend sends Vietnam time)
    const startAt = new Date(body.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('startAt không hợp lệ.');
    }

    return this.service.create({
      surgeonId: body.surgeonId,
      startAt,
      durationMin: body.durationMin,
      patientName: body.patientName,
      patientPhone: body.patientPhone,
      patientDiagnosis: body.patientDiagnosis,
      bookerName: body.bookerName,
      bookerPhone: body.bookerPhone,
    });
  }
}
