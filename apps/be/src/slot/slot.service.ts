import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60_000);
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

@Injectable()
export class SlotService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyAvailability(opts: {
    dateISO: string;
    surgeonId: number;
    durationMin: number;
    stepMin: number;
    startHour: number;
    endHour: number;
  }) {
    const { dateISO, surgeonId, durationMin, stepMin, startHour, endHour } =
      opts;

    const dayStart = new Date(dateISO + 'T00:00:00.000Z');
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        surgeonId,
        OR: [
          { startAt: { gte: dayStart }, endAt: { lte: dayEnd } },
          { startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
        ],
      },
      select: { startAt: true, endAt: true },
    });

    const result: Array<{ startAt: string; available: boolean }> = [];
    const cur = new Date(dayStart);
    cur.setUTCHours(startHour, 0, 0, 0);
    const close = new Date(dayStart);
    close.setUTCHours(endHour, 0, 0, 0);

    while (cur < close) {
      const slotStart = new Date(cur);
      const slotEnd = addMinutes(slotStart, durationMin);

      const hasOverlap = bookings.some((b) =>
        overlaps(slotStart, slotEnd, b.startAt, b.endAt),
      );
      result.push({ startAt: slotStart.toISOString(), available: !hasOverlap });

      cur.setUTCMinutes(cur.getUTCMinutes() + stepMin);
    }

    return result;
  }
}
