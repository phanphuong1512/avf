import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const { dateISO, surgeonId, stepMin, startHour, endHour } = opts;

    // Work entirely in Vietnam timezone
    // dateISO comes as 'YYYY-MM-DD', treat as Vietnam date
    const dayStart = new Date(dateISO + 'T00:00:00+07:00');
    const dayEnd = new Date(dateISO + 'T23:59:59+07:00');

    // Get all bookings for this surgeon on this day (Vietnam time)
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

    // Generate slots in Vietnam timezone
    const cur = new Date(dateISO + 'T00:00:00+07:00');
    cur.setHours(startHour, 0, 0, 0);

    const close = new Date(dateISO + 'T00:00:00+07:00');
    close.setHours(endHour, 0, 0, 0);

    while (cur < close) {
      const slotStart = new Date(cur);

      // Get current time in Vietnam timezone
      const now = new Date();
      const vietnamNow = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      );

      // Check if this slot's START TIME conflicts with any existing booking
      // We only disable slots that start at the exact same time as an existing booking
      const isBooked = bookings.some(
        (b) => b.startAt.getTime() === slotStart.getTime(),
      );

      // Check if this slot is in the past (for today only)
      const isToday = dateISO === vietnamNow.toISOString().split('T')[0];
      const isPastSlot = isToday && slotStart <= vietnamNow;

      // Return slot in Vietnam time
      result.push({
        startAt: slotStart.toISOString(),
        available: !isBooked && !isPastSlot,
      });

      cur.setMinutes(cur.getMinutes() + stepMin);
    }

    return result;
  }
}
