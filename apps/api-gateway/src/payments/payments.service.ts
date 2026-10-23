import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, userId: string) {
    const { bookingId } = createPaymentIntentDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            title: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be confirmed before payment');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestException('Booking already paid');
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      booking.totalPrice,
      'usd',
      {
        bookingId: booking.id,
        guestId: booking.guestId,
        propertyTitle: booking.property.title,
      },
    );

    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalPrice,
        currency: 'usd',
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice,
      payment,
    };
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string) {
    const { paymentIntentId, bookingId } = confirmPaymentDto;

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be confirmed before payment');
    }
    const storedPayment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!storedPayment || storedPayment.stripePaymentIntentId !== paymentIntentId) {
      throw new BadRequestException('Payment intent does not match this booking');
    }

    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.metadata.bookingId !== bookingId ||
        paymentIntent.amount !== Math.round(storedPayment.amount * 100) ||
        paymentIntent.currency !== storedPayment.currency) {
      throw new BadRequestException('Payment details do not match this booking');
    }

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    const payment = await this.prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(), // ← Ahora funciona
      },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    return payment;
  }

  async getPaymentByBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException('You can only view payments for your bookings');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
            guest: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async refundPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            property: {
              select: {
                hostId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.property.hostId !== userId) {
      throw new ForbiddenException('Only the property host can issue refunds');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('Payment intent ID not found');
    }

    const refund = await this.stripeService.createRefund(
      payment.stripePaymentIntentId, // ← Ya no hay error
      payment.amount,
    );

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'REFUNDED',
      },
    });

    return {
      payment: updatedPayment,
      refund,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = await this.stripeService.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(), // ← Ahora funciona
        },
      });

      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });
    }
  }

  private async handleRefund(charge: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
        },
      });

      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'REFUNDED',
        },
      });
    }
  }
}
