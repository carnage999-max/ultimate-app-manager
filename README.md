# Ultimate Apartment Manager®

A full-stack property management platform with a Next.js web dashboard and React Native mobile app.

## 🏗️ Tech Stack

### Frontend (Web)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Custom components with shadcn/ui patterns
- **Authentication**: JWT with httpOnly cookies
- **Payments**: Stripe Elements
- **File Storage**: AWS S3 with presigned URLs

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind for React Native)
- **Secure Storage**: Expo Secure Store for token management
- **Payments**: Stripe React Native SDK

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (Neon recommended)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt

### Infrastructure
- **Deployment**: Vercel (Frontend)
- **Database**: Neon PostgreSQL
- **File Storage**: Amazon S3
- **Payments**: Stripe
- **Push Notifications**: Expo (configured)

## 📁 Project Structure

```
ultimate-apartment-manager/
├── frontend/                 # Next.js web application
│   ├── src/
│   │   ├── app/             # App router pages & API routes
│   │   │   ├── api/         # API endpoints
│   │   │   │   ├── auth/    # Authentication endpoints
│   │   │   │   ├── leases/  # Lease management
│   │   │   │   ├── maintenance/ # Maintenance tickets
│   │   │   │   ├── payments/    # Stripe integration
│   │   │   │   └── files/   # S3 file uploads
│   │   │   ├── dashboard/   # Protected dashboard pages
│   │   │   ├── login/       # Login page
│   │   │   └── register/    # Registration page
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Base UI components
│   │   │   └── dashboard/   # Dashboard-specific components
│   │   └── lib/             # Utilities & configurations
│   │       ├── auth.ts      # JWT utilities
│   │       ├── db.ts        # Prisma client
│   │       ├── stripe.ts    # Stripe configuration
│   │       └── s3.ts        # AWS S3 client
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── .env                 # Environment variables
│
└── mobile/                  # React Native (Expo) app
    ├── app/                 # Expo Router pages
    │   ├── (tabs)/          # Tab navigation screens
    │   │   ├── dashboard.tsx
    │   │   ├── maintenance.tsx
    │   │   ├── payments.tsx
    │   │   └── profile.tsx
    │   └── index.tsx        # Login screen
    ├── lib/
    │   └── api.ts           # API client with Axios
    └── app.json             # Expo configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (or 22.12+)
- PostgreSQL database (Neon recommended)
- Stripe account (for payments)
- AWS account (for S3 file storage)
- Expo CLI (for mobile development)

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create/update `.env` file:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/apartment_manager"
   
   # Authentication
   JWT_SECRET="your-secure-jwt-secret-key"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   
   # AWS S3
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_BUCKET_NAME="apartment-manager-uploads"
   NEXT_PUBLIC_AWS_BUCKET_NAME="apartment-manager-uploads"
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API base URL**
   
   Edit `mobile/lib/api.ts` and replace `localhost:3000` with your computer's local IP address (e.g., `192.168.1.5:3000`) for testing on physical devices.

4. **Start Expo development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `a` for Android
   - Press `i` for iOS (macOS only)
   - Scan QR code with Expo Go app for physical device testing

## 🔑 Core Features

### Authentication
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Tenant)
- ✅ Secure token storage (httpOnly cookies for web, Secure Store for mobile)
- ✅ Token expiration handling
- ✅ Protected routes with middleware

### Lease Management
- ✅ Create and view leases (Admin)
- ✅ View assigned lease (Tenant)
- ✅ Track lease dates and rent amounts
- ✅ Lease status tracking

### Maintenance Tickets
- ✅ Submit maintenance requests
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Status tracking (Open, In Progress, Resolved, Closed)
- ✅ Admin view of all tickets
- ✅ Tenant view of own tickets

### Payments (Stripe)
- ✅ Stripe Payment Intent integration
- ✅ Secure payment processing
- ✅ Payment Element (web)
- ✅ Payment Sheet (mobile - requires Dev Client)
- ⚠️ Note: Mobile Stripe requires Expo Dev Client or standalone build

### File Storage (S3)
- ✅ Presigned URL generation for secure uploads
- ✅ File uploader component
- ✅ Support for lease documents and maintenance attachments

## 🎨 Design System

### Color Palette
- **Primary**: Deep Navy (#1e293b)
- **Secondary**: Gold/Amber (#f59e0b)
- **Background**: Light (#f8fafc) / Dark (#0f172a)
- **Muted**: Slate variations

### Typography
- **Web**: Geist Sans & Geist Mono
- **Mobile**: System fonts

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user details

### Leases
- `GET /api/leases` - Get leases (role-based)
- `POST /api/leases` - Create lease (Admin only)

### Maintenance
- `GET /api/maintenance` - Get tickets (role-based)
- `POST /api/maintenance` - Create maintenance ticket

### Payments
- `POST /api/payments/create-intent` - Create Stripe Payment Intent

### Files
- `POST /api/files/upload-url` - Generate S3 presigned upload URL

## 🔒 Security Features

- JWT token authentication with secure storage
- Password hashing with bcrypt (10 rounds)
- httpOnly cookies for web (prevents XSS)
- Expo Secure Store for mobile tokens
- Role-based authorization
- Middleware route protection
- CSRF protection via SameSite cookies
- Environment variable protection

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Database (Neon)
1. Create Neon PostgreSQL database
2. Copy connection string to `DATABASE_URL`
3. Run `npx prisma db push` to create schema

### Mobile (Expo)
1. Build standalone app:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
2. Submit to app stores:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 📝 Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- role (ADMIN | TENANT)
- createdAt, updatedAt

### Lease
- id (UUID)
- startDate, endDate
- rentAmount
- status
- documentUrl
- tenantId (FK to User)
- createdAt, updatedAt

### MaintenanceTicket
- id (UUID)
- title, description
- status (OPEN | IN_PROGRESS | RESOLVED | CLOSED)
- priority (LOW | MEDIUM | HIGH | URGENT)
- tenantId (FK to User)
- createdAt, updatedAt

## 🛠️ Development Notes

### Known Limitations
- Stripe mobile integration requires Expo Dev Client (not available in Expo Go)
- S3 uploads assume public bucket or CloudFront for file access
- Push notifications configured but not implemented
- Payment history is placeholder data

### Future Enhancements
- Implement push notifications for ticket updates
- Add payment history tracking
- Implement lease document upload/download
- Add admin analytics dashboard
- Implement vendor assignment for maintenance
- Add lease renewal workflow
- Implement automated rent reminders

## 📄 License

Proprietary - Ultimate Apartment Manager®

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js, React Native, and modern web technologies**
