import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    surgeonId: number;
    startAt: Date;
    durationMin: number;
    patientName: string;
    patientPhone: string;
    patientDiagnosis?: string;
    bookerName?: string;
    bookerPhone: string;
  }) {
    const endAt = new Date(data.startAt.getTime() + data.durationMin * 60_000);

    try {
      // Sử dụng transaction để đảm bảo atomic operation
      return await this.prisma.$transaction(async (tx) => {
        // Tìm hoặc tạo bệnh nhân
        let patient = await tx.patient.findFirst({
          where: {
            phone: data.patientPhone,
            name: data.patientName,
          },
        });

        if (!patient) {
          patient = await tx.patient.create({
            data: {
              name: data.patientName,
              phone: data.patientPhone,
              diagnosis: data.patientDiagnosis,
            },
          });
        }

        // Tạo booking với unique constraint để chống race condition
        const booking = await tx.booking.create({
          data: {
            surgeonId: data.surgeonId,
            patientId: patient.id,
            startAt: data.startAt,
            endAt,
            bookerName: data.bookerName,
            bookerPhone: data.bookerPhone,
          },
          include: {
            patient: true,
            surgeon: true,
          },
        });

        return booking;
      });
    } catch (error: unknown) {
      // Xử lý lỗi Prisma
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          throw new BadRequestException(
            'Khung thời gian này đã được đặt bởi người khác. Vui lòng chọn khung giờ khác.',
          );
        }
      }

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

      if (msg.includes('booking_time_valid')) {
        throw new BadRequestException('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      }
      
      throw error;
    }
  }

  async list() {
    return this.prisma.booking.findMany({
      include: {
        patient: true,
        surgeon: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async getBookingsBySurgeon(surgeonId: number, date?: string) {
    const where: any = { surgeonId };
    
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      where.startAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        patient: true,
        surgeon: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }
}
