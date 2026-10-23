import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from './stripe.service';

describe('legacy payment confirmation protections', () => {
  const booking = {
    id: 'booking-1',
    guestId: 'customer-1',
    status: 'CONFIRMED',
  };
  const stored = {
    stripePaymentIntentId: 'pi_expected',
    amount: 100,
    currency: 'usd',
  };
  const dto = { bookingId: 'booking-1', paymentIntentId: 'pi_expected' };
  let prisma: {
    booking: { findUnique: jest.Mock; update: jest.Mock };
    payment: { findUnique: jest.Mock; update: jest.Mock };
  };
  let stripe: { retrievePaymentIntent: jest.Mock };
  let service: PaymentsService;
  beforeEach(() => {
    prisma = {
      booking: {
        findUnique: jest.fn().mockResolvedValue(booking),
        update: jest.fn(),
      },
      payment: {
        findUnique: jest.fn().mockResolvedValue(stored),
        update: jest.fn().mockResolvedValue({ status: 'COMPLETED' }),
      },
    };
    stripe = {
      retrievePaymentIntent: jest
        .fn()
        .mockResolvedValue({
          status: 'succeeded',
          amount: 10000,
          currency: 'usd',
          metadata: { bookingId: 'booking-1' },
        }),
    };
    service = new PaymentsService(
      prisma as unknown as PrismaService,
      stripe as unknown as StripeService,
    );
  });
  it('rejects another customer before retrieving an intent or changing payment state', async () => {
    await expect(
      service.confirmPayment(dto, 'intruder'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(stripe.retrievePaymentIntent).not.toHaveBeenCalled();
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });
  it('rejects a successful intent belonging to another payment', async () => {
    await expect(
      service.confirmPayment(
        { ...dto, paymentIntentId: 'pi_other' },
        'customer-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });
  it.each([
    { amount: 1 },
    { currency: 'aud' },
    { metadata: { bookingId: 'other' } },
    { status: 'requires_payment_method' },
  ])('rejects inconsistent provider data %j', async (change) => {
    stripe.retrievePaymentIntent.mockResolvedValue({
      status: 'succeeded',
      amount: 10000,
      currency: 'usd',
      metadata: { bookingId: 'booking-1' },
      ...change,
    });
    await expect(
      service.confirmPayment(dto, 'customer-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });
  it('confirms an owned booking only when the stored intent, amount, currency and metadata match', async () => {
    await expect(service.confirmPayment(dto, 'customer-1')).resolves.toEqual({
      status: 'COMPLETED',
    });
    expect(prisma.payment.update).toHaveBeenCalledTimes(1);
    expect(prisma.booking.update).toHaveBeenCalledTimes(1);
  });
});
