# 🏠 Airbnb Full Clone

A production-ready full-stack Airbnb clone built with modern technologies and best practices.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-008CDD)

## 🎯 Features

### Backend (NestJS)
- ✅ **33 REST API Endpoints** fully functional
- 🔐 **JWT Authentication** with role-based access (Guest/Host)
- 💳 **Stripe Payment Integration** with webhooks
- 🏠 **Property Management** (CRUD, publish/unpublish)
- 📅 **Booking System** with status management
- ⭐ **Review System** with ratings
- ❤️ **Favorites/Wishlist** functionality
- 📊 **Prisma ORM** with SQLite/PostgreSQL support
- 🛡️ **Input Validation** with class-validator
- 🔄 **Error Handling** with proper HTTP status codes

### Frontend (Next.js 15)
- ⚡ **App Router** with server components
- 🎨 **shadcn/ui** + TailwindCSS for modern UI
- 📱 **Responsive Design** mobile-first approach
- 🔄 **Zustand** for state management
- 🪝 **Custom Hooks** for API integration
- 🎯 **TypeScript** end-to-end type safety
- 🌐 **SEO Optimized** with meta tags

---

## 🏗️ Architecture

```
airbnb-full-clone/
├── apps/
│   ├── api-gateway/         # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── properties/  # Property management
│   │   │   ├── bookings/    # Booking system
│   │   │   ├── payments/    # Stripe integration
│   │   │   ├── reviews/     # Review system
│   │   │   ├── favorites/   # Wishlist functionality
│   │   │   └── common/      # Shared utilities
│   │   └── test/            # API tests
│   │
│   └── web/                 # Next.js Frontend
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities & API clients
│       │   └── types/       # TypeScript types
│
└── packages/
    └── database/            # Prisma schema & migrations
        └── prisma/
```

---

## 🚀 Tech Stack

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** Prisma ORM (SQLite/PostgreSQL)
- **Authentication:** JWT with Passport
- **Payments:** Stripe API
- **Validation:** class-validator, class-transformer
- **Documentation:** REST API with 33 endpoints

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI Components:** Radix UI + shadcn/ui

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm 8+

### Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/airbnb-fullstack-clone.git
cd airbnb-fullstack-clone
pnpm install
```

### Setup Database
```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
```

### Environment Variables

**Backend** (`apps/api-gateway/.env`):
```env
DATABASE_URL="file:../../packages/database/prisma/dev.db"
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏃 Running the Project

### Development Mode

**Backend:**
```bash
cd apps/api-gateway
pnpm run start:dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
cd apps/web
pnpm run dev
# App runs on http://localhost:3000
```

### Production Build
```bash
# Backend
cd apps/api-gateway
pnpm run build
pnpm run start:prod

# Frontend
cd apps/web
pnpm run build
pnpm run start
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (Host only)
- `PATCH /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PATCH /api/properties/:id/publish` - Publish property
- `GET /api/properties/my-properties` - Get my properties

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get my bookings
- `GET /api/bookings/host-bookings` - Get bookings (Host)
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/confirm` - Confirm booking (Host)
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/booking/:id` - Get payment by booking
- `POST /api/payments/:id/refund` - Refund payment
- `POST /api/payments/webhook` - Stripe webhook

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/property/:id` - Get property reviews
- `GET /api/reviews/my-reviews` - Get my reviews
- `GET /api/reviews/:id` - Get review details
- `PATCH /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Favorites
- `POST /api/favorites/:propertyId` - Add to favorites
- `DELETE /api/favorites/:propertyId` - Remove from favorites
- `POST /api/favorites/toggle/:propertyId` - Toggle favorite
- `GET /api/favorites` - Get my favorites
- `GET /api/favorites/check/:propertyId` - Check if favorited
- `GET /api/favorites/count/:propertyId` - Get favorite count

---

## 🧪 Testing

### API Testing
```bash
# Use REST Client extension in VS Code
# Open apps/api-gateway/test/complete-test.http
```

---

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(GUEST)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Property {
  id           String   @id @default(cuid())
  title        String
  description  String
  price        Float
  propertyType PropertyType
  maxGuests    Int
  bedrooms     Int
  bathrooms    Int
  city         String
  country      String
  images       String   // JSON array
  status       PropertyStatus @default(DRAFT)
  hostId       String
  host         User     @relation(fields: [hostId])
}

model Booking {
  id          String   @id @default(cuid())
  propertyId  String
  guestId     String
  checkIn     DateTime
  checkOut    DateTime
  guests      Int
  totalPrice  Float
  status      BookingStatus @default(PENDING)
}

model Payment {
  id                     String   @id @default(cuid())
  bookingId              String   @unique
  amount                 Float
  stripePaymentIntentId  String
  status                 PaymentStatus @default(PENDING)
}

model Review {
  id         String   @id @default(cuid())
  bookingId  String   @unique
  propertyId String
  userId     String
  rating     Int
  comment    String?
}

model Favorite {
  id         String   @id @default(cuid())
  userId     String
  propertyId String
  @@unique([userId, propertyId])
}
```

---

## 🎨 UI Components

Built with **shadcn/ui**:
- Button, Input, Card, Dialog
- Dropdown Menu, Avatar, Badge
- Calendar, Select, Form
- Toast notifications
- Skeleton loaders
- And more...

---

## 🚀 Deployment

### Backend (Railway/Render)
```bash
cd apps/api-gateway
pnpm run build
# Deploy to Railway or Render
```

### Frontend (Vercel)
```bash
cd apps/web
pnpm run build
# Deploy to Vercel
```

---

## 📝 License

MIT License - feel free to use this project for learning purposes.

---

## 👨‍💻 Author

**Gherson**
- GitHub: [@YOUR_USERNAME]
- LinkedIn: [Your LinkedIn]

---

## 🙏 Acknowledgments

- Inspired by Airbnb
- Built for learning and portfolio purposes
- Not affiliated with Airbnb Inc.

---

## 📧 Contact

For questions or collaboration: your.email@example.com

---

**⭐ If you found this project helpful, please give it a star!**