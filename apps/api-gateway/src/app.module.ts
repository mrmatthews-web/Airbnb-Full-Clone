import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PropertiesModule,
    BookingsModule,
    // The Eat In prototype never needs Stripe. Legacy test-only endpoints must
    // be explicitly enabled for isolated backend testing.
    ...(process.env.EAT_IN_ENABLE_LEGACY_PAYMENTS === 'true' ? [PaymentsModule] : []),
    ReviewsModule,
    FavoritesModule,
  ],
})
export class AppModule {}
