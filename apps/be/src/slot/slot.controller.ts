import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotsQueryDto } from './slot.dto';

@Controller('slots')
export class SlotController {
  constructor(private readonly service: SlotService) {}

  @Get()
  async list(@Query() q: SlotsQueryDto) {
    const durationMin = q.durationMin ?? 90;
    const stepMin = q.stepMin ?? 15;
    const startHour = q.startHour ?? 9;
    const endHour = q.endHour ?? 19;

    if (startHour >= endHour) {
      throw new BadRequestException('startHour phải nhỏ hơn endHour');
    }

    return this.service.getDailyAvailability({
      dateISO: q.date,
      surgeonId: q.surgeonId,
      durationMin,
      stepMin,
      startHour,
      endHour,
    });
  }
}
