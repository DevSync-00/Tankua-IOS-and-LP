# Tankua Platform Roadmap

## Overview

Tankua is expanding from a mobile app to a complete platform ecosystem consisting of:

1. **Mobile App** (Current - React Native/Expo) - For pilgrims/travelers
2. **Marketing Website** - Public-facing website for SEO, downloads, information
3. **Tankua Admin Dashboard** - Platform management for Tankua team
4. **Provider Portal** - Dashboard for travel companies to manage their business

---

## Phase 1: Platform Architecture (Foundation)

### 1.1 Technology Stack Recommendation

| Component | Technology | Reason |
|-----------|------------|--------|
| Marketing Website | Next.js 14 | SEO, SSR, React ecosystem |
| Admin Dashboard | Next.js 14 + Tailwind CSS | Shared codebase, fast development |
| Provider Portal | Next.js 14 + Tailwind CSS | Consistent UX, shared components |
| Backend | Supabase (current) + Edge Functions | Already integrated, scalable |
| Authentication | Supabase Auth | Unified auth across platforms |
| Hosting | Vercel | Excellent Next.js support |
| Domain | tankua.et / tankua.com | Professional branding |

### 1.2 Database Schema Extensions

```sql
-- New tables needed for the expanded platform

-- Provider Users (staff accounts for providers)
CREATE TABLE provider_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'manager', 'driver', 'staff')),
  phone TEXT,
  password_hash TEXT, -- For email/password auth
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users (Tankua platform staff)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'support', 'finance')),
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles (managed by providers)
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id),
  driver_id UUID REFERENCES drivers(id),
  plate_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('bus', 'minibus', 'van', 'suv', 'sedan')),
  capacity INTEGER NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  insurance_expiry DATE,
  inspection_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ETB',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  bank_account TEXT,
  reference_number TEXT,
  period_start DATE,
  period_end DATE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  booking_id UUID REFERENCES bookings(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('booking', 'payment', 'refund', 'complaint', 'general')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  user_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  provider_response TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  admin_id UUID REFERENCES admin_users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('booking', 'payment', 'promotion', 'system', 'reminder')),
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions & Discounts
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_booking_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (for compliance and tracking)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_type TEXT CHECK (user_type IN ('user', 'provider', 'admin')),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 2: Marketing Website

### 2.1 Pages & Structure

```
tankua.et/
├── / (Homepage)
├── /about
├── /how-it-works
├── /churches (Browse churches/monasteries)
├── /churches/[slug] (Individual church page)
├── /providers (For travel companies to sign up)
├── /pricing (Service fees explained)
├── /blog
├── /blog/[slug]
├── /contact
├── /faq
├── /privacy-policy
├── /terms-of-service
├── /download (App download links)
└── /careers
```

### 2.2 Homepage Sections

1. **Hero Section**
   - Compelling headline: "Discover Ethiopia's Sacred Heritage"
   - App screenshots
   - Download buttons (App Store, Play Store)
   - Search bar for churches

2. **Features Section**
   - Easy booking
   - Verified providers
   - Multiple payment options
   - QR code tickets
   - Group trips

3. **Popular Destinations**
   - Featured monasteries/churches
   - Beautiful images
   - Quick book buttons

4. **How It Works**
   - Step-by-step guide
   - Animated illustrations

5. **Testimonials**
   - User reviews
   - Provider testimonials

6. **Provider CTA**
   - "Are you a travel company? Join Tankua"
   - Benefits for providers

7. **Download Section**
   - Large app screenshots
   - QR code for download
   - Store badges

8. **Footer**
   - Links to all pages
   - Social media
   - Contact info
   - Newsletter signup

### 2.3 SEO Strategy

- **Target Keywords:**
  - Ethiopian church tours
  - Lalibela rock churches tour
  - Ethiopia pilgrimage booking
  - Ethiopian monastery visits
  - Lake Tana monastery tour
  - Ethiopian Orthodox church trips

- **Technical SEO:**
  - Server-side rendering (Next.js)
  - Schema markup for churches/tours
  - XML sitemap
  - Fast loading (Core Web Vitals)
  - Mobile-first design

---

## Phase 3: Tankua Admin Dashboard

### 3.1 Access Levels

| Role | Permissions |
|------|-------------|
| Super Admin | Full access, user management, settings |
| Admin | Most features except user management |
| Support | Tickets, bookings, limited user access |
| Finance | Payouts, revenue, financial reports |

### 3.2 Dashboard Sections

```
admin.tankua.et/
├── /dashboard (Overview)
├── /users
│   ├── /users (List all users)
│   └── /users/[id] (User details)
├── /providers
│   ├── /providers (List providers)
│   ├── /providers/[id] (Provider details)
│   └── /providers/new (Add provider)
├── /bookings
│   ├── /bookings (All bookings)
│   └── /bookings/[id] (Booking details)
├── /churches
│   ├── /churches (List churches)
│   ├── /churches/[id] (Church details)
│   └── /churches/new (Add church)
├── /trips
│   ├── /trips (All trips)
│   └── /trips/new (Create trip)
├── /payments
│   ├── /payments (All payments)
│   ├── /payments/payouts (Provider payouts)
│   └── /payments/refunds (Refund requests)
├── /support
│   ├── /support (Tickets)
│   └── /support/[id] (Ticket details)
├── /reports
│   ├── /reports/revenue
│   ├── /reports/bookings
│   ├── /reports/users
│   └── /reports/providers
├── /promotions
│   ├── /promotions (List promotions)
│   └── /promotions/new (Create promotion)
├── /content
│   ├── /content/blog
│   └── /content/announcements
├── /settings
│   ├── /settings/general
│   ├── /settings/payment
│   ├── /settings/notifications
│   └── /settings/team
└── /audit-log
```

### 3.3 Key Features

#### Dashboard Overview
- Total bookings (today/week/month)
- Revenue metrics
- Active users chart
- Provider performance
- Recent bookings table
- Pending payouts
- Open support tickets

#### User Management
- Search/filter users
- View user details & history
- Block/unblock users
- Export user data
- Send notifications

#### Provider Management
- Approve/reject providers
- View provider metrics
- Manage provider status
- Review earnings
- Handle complaints

#### Booking Management
- View all bookings
- Filter by status/date/provider
- Cancel/refund bookings
- Contact users/providers
- Export booking data

#### Financial Reports
- Revenue by period
- Provider earnings
- Service fee collection
- Payout history
- Tax reports

---

## Phase 4: Provider Portal

### 4.1 Access Levels

| Role | Permissions |
|------|-------------|
| Owner | Full access, settings, team management |
| Manager | Bookings, drivers, vehicles, reports |
| Driver | View assigned trips only |
| Staff | View bookings, limited features |

### 4.2 Portal Structure

```
provider.tankua.et/
├── /login
├── /register
├── /dashboard (Overview)
├── /bookings
│   ├── /bookings (All bookings)
│   ├── /bookings/upcoming
│   ├── /bookings/[id] (Booking details)
│   └── /bookings/calendar (Calendar view)
├── /trips
│   ├── /trips (Manage trips)
│   └── /trips/new (Create trip)
├── /drivers
│   ├── /drivers (List drivers)
│   ├── /drivers/[id] (Driver details)
│   └── /drivers/new (Add driver)
├── /vehicles
│   ├── /vehicles (List vehicles)
│   ├── /vehicles/[id] (Vehicle details)
│   └── /vehicles/new (Add vehicle)
├── /earnings
│   ├── /earnings (Overview)
│   ├── /earnings/history (Payout history)
│   └── /earnings/bank (Bank details)
├── /reviews
│   └── /reviews (Customer reviews)
├── /reports
│   ├── /reports/bookings
│   ├── /reports/earnings
│   └── /reports/performance
├── /settings
│   ├── /settings/profile (Company profile)
│   ├── /settings/team (Team members)
│   ├── /settings/notifications
│   └── /settings/payment (Payout settings)
└── /support
```

### 4.3 Key Features

#### Dashboard
- Today's trips
- Upcoming bookings
- Earnings this month
- Recent reviews
- Performance metrics
- Notifications

#### Booking Management
- View incoming bookings
- Accept/decline bookings
- Assign drivers
- Contact passengers
- Generate manifests
- Mark trips as completed

#### Trip Management
- Create trips to churches
- Set prices per route
- Define pickup stations
- Set available seats
- Schedule recurring trips

#### Driver Management
- Add/edit drivers
- Assign to vehicles
- Track performance
- Manage schedules
- License/document tracking

#### Vehicle Management
- Register vehicles
- Track maintenance
- Insurance reminders
- Capacity management
- Assign to trips

#### Earnings & Payouts
- View earnings breakdown
- Base fare vs service fee
- Payout schedule
- Request early payout
- Download invoices
- Tax documentation

#### Reviews & Ratings
- View all reviews
- Respond to reviews
- Average rating trends
- Improvement suggestions

---

## Phase 5: API Design

### 5.1 API Structure

```
api.tankua.et/
├── /v1/auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   ├── POST /refresh
│   └── POST /forgot-password
├── /v1/users
│   ├── GET /me
│   ├── PUT /me
│   └── GET /:id (admin)
├── /v1/churches
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST / (admin)
│   └── PUT /:id (admin)
├── /v1/providers
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST /register
│   └── PUT /:id (owner)
├── /v1/trips
│   ├── GET / (list)
│   ├── GET /:id
│   ├── POST / (provider)
│   └── PUT /:id (provider)
├── /v1/bookings
│   ├── GET / (user's bookings)
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id/cancel
│   └── PUT /:id/complete (provider)
├── /v1/payments
│   ├── POST /initiate
│   ├── POST /verify
│   └── POST /webhook
├── /v1/reviews
│   ├── GET /:providerId
│   ├── POST /
│   └── PUT /:id/respond (provider)
└── /v1/admin
    ├── GET /dashboard
    ├── GET /reports/:type
    └── POST /payouts
```

---

## Phase 6: Implementation Timeline

### Month 1-2: Foundation
- [ ] Set up Next.js monorepo structure
- [ ] Configure Supabase authentication for web
- [ ] Create database migrations
- [ ] Set up CI/CD pipeline
- [ ] Design system and component library

### Month 2-3: Marketing Website
- [ ] Homepage and core pages
- [ ] Church listing pages
- [ ] SEO optimization
- [ ] Blog setup
- [ ] Mobile responsive design
- [ ] Analytics integration

### Month 3-4: Admin Dashboard (MVP)
- [ ] Authentication & authorization
- [ ] Dashboard overview
- [ ] User management
- [ ] Booking management
- [ ] Basic reports
- [ ] Provider approval flow

### Month 4-5: Provider Portal (MVP)
- [ ] Provider registration
- [ ] Dashboard overview
- [ ] Booking management
- [ ] Driver management
- [ ] Basic earnings view

### Month 5-6: Full Features
- [ ] Advanced reporting
- [ ] Payout system
- [ ] Review management
- [ ] Promotions system
- [ ] Support ticket system
- [ ] Notifications system

### Month 6+: Optimization
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] User feedback integration
- [ ] Feature enhancements

---

## Phase 7: Security Considerations

### 7.1 Authentication
- JWT tokens with refresh mechanism
- Session management
- 2FA for admin/provider accounts
- Rate limiting on auth endpoints
- Password policies

### 7.2 Authorization
- Role-based access control (RBAC)
- Row-level security (RLS) in Supabase
- API endpoint protection
- Admin action logging

### 7.3 Data Protection
- HTTPS everywhere
- Data encryption at rest
- PII handling compliance
- Regular backups
- GDPR considerations

### 7.4 Payment Security
- PCI compliance via payment providers
- No card data storage
- Webhook signature verification
- Transaction logging

---

## Phase 8: Monitoring & Analytics

### 8.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- Database monitoring

### 8.2 Business Analytics
- Google Analytics 4
- Custom event tracking
- Conversion funnels
- User behavior analysis

### 8.3 Financial Tracking
- Revenue dashboards
- Payout tracking
- Fee collection
- Growth metrics

---

## Budget Estimate

| Item | Monthly Cost (USD) |
|------|-------------------|
| Vercel (Hosting) | $20-50 |
| Supabase (Pro) | $25-100 |
| Domain (.et) | ~$5/month |
| Error Tracking (Sentry) | $0-26 |
| Analytics | Free (GA4) |
| Email Service | $0-20 |
| **Total** | **$50-200/month** |

---

## Success Metrics

### User Metrics
- Monthly active users (MAU)
- User retention rate
- Booking conversion rate
- App store ratings

### Provider Metrics
- Active providers
- Provider retention
- Average trips per provider
- Provider satisfaction score

### Business Metrics
- Total bookings
- Gross booking value (GBV)
- Net revenue (service fees)
- Average booking value

---

## Next Immediate Steps

1. **Create project structure** for web platforms
2. **Set up authentication** for admin/provider portals
3. **Build component library** shared across platforms
4. **Implement admin dashboard MVP**
5. **Create provider registration flow**

Would you like me to start implementing any of these components?

