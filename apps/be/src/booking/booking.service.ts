import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    surgeonId: number;
    startAt: Date;
    durationMin: number;
    patientName: string;
    phone: string;
    diseaseType: string;
  }) {
    const endAt = new Date(data.startAt.getTime() + data.durationMin * 60_000);

    try {
      return await this.prisma.booking.create({
        data: {
          surgeonId: data.surgeonId,
          startAt: data.startAt,
          endAt,
          patientName: data.patientName,
          phone: data.phone,
          diseaseType: data.diseaseType,
        },
      });
    } catch (error: unknown) {
      let msg = '';
      if (error instanceof Error) {
        msg = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        msg = String(error.message);
      }

      if (msg.includes('booking_no_overlap_per_surgeon')) {
        throw new BadRequestException(
          'Khung thời gian đã có ca mổ khác cho bác sĩ này.',
        );
      }
      if (msg.includes('booking_time_valid')) {
        throw new BadRequestException('endAt phải lớn hơn startAt.');
      }
      throw error;
    }
  }

  async list() {
    return this.prisma.booking.findMany({ orderBy: { startAt: 'asc' } });
  }
}
