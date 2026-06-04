# ART LAVKA UZ

E-commerce platform for exclusive designer t-shirts in Uzbekistan, built with Next.js 16, MongoDB, and a real-time Telegram integration.

**Live:** [artlavka.uz](https://artlavka.uz) (canonical) — [art-lavka.uz](https://art-lavka.uz) permanently redirects here

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Database Setup](#database-setup)
- [Telegram Bots](#telegram-bots)
- [Image Compression](#image-compression)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Architecture Notes](#architecture-notes)

---

## Overview

Art Lavka UZ is a full-stack e-commerce store where customers can browse designer t-shirts, configure them with prints on an interactive 3D model, and check out directly on the site. The admin panel provides full inventory, order, promotion, and content management. Two Telegram bots handle admin notifications and customer-facing interactions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | MongoDB via Mongoose 9 |
| Auth | NextAuth.js 4 (Credentials provider, JWT) |
| State | Zustand 5 (cart, configurator, language) |
| Data fetching | TanStack React Query 5 |
| 3D rendering | Three.js + React Three Fiber + Drei |
| Animations | Framer Motion 12 |
| Charts | Recharts 3 |
| Carousel | Swiper 12 |
| Image storage | Cloudinary (production) / local `public/uploads` (dev) |
| Image processing | Sharp |
| Notifications | Telegram Bot API (node-telegram-bot-api) |
| Hosting | Vercel |

---

## Project Structure

```
art-lavka-uz/
├── public/                        # Static assets
│   ├── configurator-bg.webp       # Repeating background pattern
│   ├── payment-method/            # Payment logos (WebP)
│   ├── prints/                    # Seed print images
│   └── products/                  # Seed product images
│
├── scripts/                       # One-off CLI scripts (run with tsx)
│   ├── seed-admin.ts              # Create first admin account
│   ├── seed-products.ts           # Seed product catalogue
│   ├── seed-prints.ts             # Seed print designs
│   ├── seed-gallery.ts            # Seed gallery images
│   ├── compress-public-assets.ts  # Compress public/ images → WebP
│   ├── migrate-to-cloudinary.ts   # Upload local images to Cloudinary
│   └── restore-cancelled-order-stock.ts  # Fix stock after bulk cancellations
│
└── src/
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx             # Root layout, global metadata, fonts
    │   ├── page.tsx               # Storefront home page
    │   ├── globals.css            # Global styles + Tailwind base
    │   ├── robots.ts              # /robots.txt
    │   ├── sitemap.ts             # /sitemap.xml
    │   │
    │   ├── admin/                 # Admin panel pages (protected)
    │   │   ├── login/             # Login page (public)
    │   │   ├── page.tsx           # Dashboard
    │   │   ├── orders/            # Order list + detail
    │   │   ├── products/          # Product CRUD
    │   │   ├── prints/            # Print CRUD + categories
    │   │   ├── gallery/           # Gallery CRUD
    │   │   ├── publications/      # Publication (blog post) CRUD
    │   │   ├── promotions/        # Promotion / discount CRUD
    │   │   ├── delivery/          # Delivery zones, BTS offices
    │   │   ├── settings/          # Store settings, categories, menu text
    │   │   └── support/           # Support ticket inbox
    │   │
    │   ├── api/                   # API route handlers
    │   │   ├── auth/[...nextauth] # NextAuth endpoints
    │   │   ├── products/          # Public product catalogue (ISR 2h)
    │   │   ├── prints/            # Paginated print catalogue (dynamic)
    │   │   ├── gallery/           # Gallery images
    │   │   ├── promotions/        # Active promotions
    │   │   ├── print-categories/  # Print categories (ISR 2h)
    │   │   ├── offices/           # BTS office list (ISR 24h)
    │   │   ├── settings/          # Store settings GET/POST
    │   │   ├── upload/            # Image upload → Cloudinary (admin only)
    │   │   ├── promo/[id]/        # Promotion click tracking redirect
    │   │   ├── telegram/webhook/         # Admin bot webhook
    │   │   └── telegram-client/webhook/  # Client bot webhook
    │   │
    │   ├── cart/                  # Cart page
    │   ├── support/               # Customer support form
    │   └── track-order/           # Order tracking + [orderNumber] deep link
    │
    ├── features/                  # Feature modules (co-locate logic + UI)
    │   ├── admin/
    │   │   ├── dashboard/         # Stats, analytics charts, low-stock alerts
    │   │   ├── delivery/          # Delivery price tables, office manager
    │   │   ├── gallery/           # Gallery management
    │   │   ├── login/             # Admin login form
    │   │   ├── orders/            # Order list, detail, status updates
    │   │   ├── prints/            # Print + category management
    │   │   ├── products/          # Product form, color/size/price editor
    │   │   ├── promotions/        # Promotion rules builder
    │   │   ├── publications/      # Publication editor + Telegram broadcast
    │   │   ├── settings/          # Categories, menu text, social links
    │   │   ├── shared/            # AdminLayout, MediaPickerModal, upload actions
    │   │   └── support/           # Support ticket list
    │   │
    │   └── client/
    │       ├── home/              # Main storefront
    │       │   ├── components/
    │       │   │   ├── desktop/   # LeftSidebar (prints list), RightConfigurator
    │       │   │   ├── mobile/    # MobileConfigurator, Navbar, MobileFooter
    │       │   │   └── shared/    # TShirtScene (3D), TShirtModel, ImageLightbox
    │       │   ├── modals/
    │       │   │   ├── desktop/   # ProductsModal, GalleryModal, MenuModal, CartModal
    │       │   │   ├── mobile/    # Mobile equivalents of all modals
    │       │   │   └── shared/    # CheckoutModal, OrderSuccessModal
    │       │   ├── hooks/         # useProducts, usePrints, useGallery, usePromotions…
    │       │   └── api/           # Client-side fetch helpers
    │       ├── support/           # Customer support form action
    │       └── track-order/       # Order tracking form + display
    │
    ├── components/                # Shared UI primitives
    │   ├── ui/                    # Button, Input, Textarea, Dropdown, Badge, Tooltip
    │   ├── Loader.tsx
    │   ├── Modal.tsx
    │   ├── LoadingSkeleton.tsx
    │   └── SizeTableModal.tsx
    │
    ├── hooks/                     # Global hooks
    │   ├── useIsMobile.ts         # SSR-safe mobile breakpoint detection
    │   ├── useScrollLock.ts       # Body scroll locking for modals
    │   └── useTranslation.ts      # Active-language translation helper
    │
    ├── lib/                       # Shared server utilities
    │   ├── auth.ts                # NextAuth options (CredentialsProvider)
    │   ├── mongodb.ts             # Mongoose connection singleton
    │   ├── requireAdmin.ts        # Server-action auth guard
    │   ├── orderPricing.ts        # Server-side price recomputation
    │   ├── cloudinary.ts          # Cloudinary SDK instance
    │   ├── upload.ts              # Image upload + Sharp compression pipeline
    │   ├── phoneUtils.ts          # Uzbekistan phone normalisation / masking
    │   ├── deliveryData.ts        # BTS delivery zones / pricing tables
    │   ├── deliveryDataBTS.ts     # BTS price constants
    │   ├── i18n/                  # Translations (ru / en / uz JSON + utils)
    │   ├── telegram/              # Admin Telegram bot (handlers, keyboards, notifications)
    │   └── telegram-client/       # Customer Telegram bot (catalog, tracking, subscription)
    │
    ├── models/                    # Mongoose schemas
    │   ├── Admin.ts               # Admin users (bcrypt hashed passwords)
    │   ├── Order.ts               # Orders + support tickets
    │   ├── Product.ts             # Products with color/size/price variants
    │   ├── Print.ts               # Print designs
    │   ├── PrintCategory.ts       # Print categories (with slugs)
    │   ├── Gallery.ts             # Gallery images
    │   ├── Publication.ts         # Blog/announcement posts
    │   ├── Promotion.ts           # Discount rules
    │   ├── Settings.ts            # Global store settings
    │   ├── Office.ts              # BTS courier offices
    │   └── TelegramSession.ts     # Admin bot auth sessions
    │
    ├── stores/                    # Zustand stores (client-side state)
    │   ├── cartStore.ts           # Persisted cart (localStorage)
    │   ├── configuratorStore.ts   # Selected product/print/color/size
    │   └── languageStore.ts       # Active language (ru / en / uz)
    │
    ├── types/                     # Shared TypeScript interfaces
    ├── providers/                 # React context providers (QueryProvider)
    ├── proxy.ts                   # Next.js edge middleware (protects /admin/*)
    └── instrumentation.ts         # Server startup: initialise Telegram bots
```

---

## Features

### Storefront
- Interactive 3D t-shirt configurator (Three.js) — pick product, print, color, size
- Real-time stock indicators per size/color variant
- Promotion engine: percentage, fixed, and free-delivery discounts with region/delivery-method targeting
- 3-language UI: Russian, English, Uzbek
- Order tracking by order number + phone (no account required)
- Customer support form
- Gallery / lookbook with fullscreen lightbox (Swiper)

### Admin Panel (`/admin`)
- **Dashboard** — revenue overview, order status breakdown, sales by region/day/hour/category/print, low-stock alerts
- **Products** — full CRUD with per-color / per-size pricing, 3D model assignment, size table editor, Telegram promo broadcast
- **Prints** — upload front/back images with preview generation, categorised
- **Gallery** — curated gallery linked to products
- **Orders** — status and payment tracking, automatic stock reserve/restore on cancel
- **Support** — view and resolve customer support tickets
- **Promotions** — rule-based discount engine
- **Publications** — blog posts with one-click Telegram channel broadcast
- **Delivery** — BTS courier price tables, office list management
- **Settings** — category management, menu text (delivery, payment, about), social links

### Integrations
- **Cloudinary** — production image storage with automatic Sharp pre-compression
- **Admin Telegram Bot** — receive new order notifications, view and manage orders, authenticate via Telegram
- **Client Telegram Bot** — customers can browse the catalogue, track orders, and subscribe to promotions
- **BTS Courier** — delivery zone and office data for Uzbekistan-wide coverage

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- **MongoDB** Atlas cluster (free tier works)
- **Cloudinary** account (free tier works for development)
- **Telegram Bot tokens** — two bots created via [@BotFather](https://t.me/BotFather)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Botirjon777/art-lavka-uz.git
cd art-lavka-uz

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
# (edit .env — see Environment Variables section below)

# 4. Seed the database
npm run seed:products    # seed product catalogue
npm run seed:prints      # seed print designs
npm run seed:gallery     # seed gallery images

# 5. Create the first admin account
npx tsx --env-file=.env scripts/seed-admin.ts

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

Default admin credentials (change immediately after first login):

| Field | Value |
|---|---|
| Email | `admin@artlavka.uz` |
| Password | `admin123` |

---

## Environment Variables

Create a `.env` file in the project root. This file is gitignored and must never be committed.

```env
# ─── Database ────────────────────────────────────────────────────────────────
# MongoDB connection string (Atlas or self-hosted)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?appName=<app>

# ─── NextAuth ────────────────────────────────────────────────────────────────
# Strong random secret — generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-strong-random-secret-here

# Full URL of your site (http://localhost:3000 in dev, https://artlavka.uz in prod)
NEXTAUTH_URL=http://localhost:3000

# ─── Cloudinary ──────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Set to "true" to upload to Cloudinary even in development
USE_CLOUDINARY=false

# ─── Telegram — Admin Bot ────────────────────────────────────────────────────
# Bot token from @BotFather
TELEGRAM_ADMIN_BOT_TOKEN=1234567890:AABBccDDeeFFggHHiiJJkkLL

# Public HTTPS URL where Telegram will POST updates
# Leave empty in development (no webhook needed locally)
TELEGRAM_WEBHOOK_URL=https://artlavka.uz/api/telegram/webhook

# Group chat ID that receives new order notifications (negative number)
TELEGRAM_ORDER_GROUP_ID=-1001234567890

# Channel ID for promo/publication broadcasts (negative number)
TELEGRAM_PROMO_CHANNEL_ID=-1001234567890

# ─── Telegram — Client Bot ───────────────────────────────────────────────────
# Bot token from @BotFather (separate bot from the admin one)
TELEGRAM_CLIENT_BOT_TOKEN=0987654321:ZZYYxxWWvvUUttSSrrQQppOO

TELEGRAM_CLIENT_WEBHOOK_URL=https://artlavka.uz/api/telegram-client/webhook

# Telegram channel username (without @) used for subscription verification
CHANNEL_USERNAME=artlavkauz

# ─── Webhook Security ────────────────────────────────────────────────────────
# Shared secret verified via X-Telegram-Bot-Api-Secret-Token header.
# Generate with:
# node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
# After setting, re-register webhooks by visiting (once after deployment):
#   GET https://artlavka.uz/api/telegram/webhook?secret=<this-value>
#   GET https://artlavka.uz/api/telegram-client/webhook?secret=<this-value>
TELEGRAM_WEBHOOK_SECRET=your-random-hex-secret

# ─── Optional ────────────────────────────────────────────────────────────────
# remove.bg API key (used by the remove-bg.js utility script only)
REMOVE_BG_API_KEY=your_remove_bg_key
```

---

## Running the Project

```bash
# Development server (hot reload via Turbopack)
npm run dev

# Production build
npm run build

# Start the production server
npm run start

# TypeScript type check (no emit)
npm run type-check

# ESLint
npm run lint
```

---

## Database Setup

### Connection
Set `MONGODB_URI` in `.env`. MongoDB Atlas free tier (M0) is sufficient for development and light production traffic.

### Indexes
Indexes are defined directly on the Mongoose schemas and created automatically on first connection:

| Model | Indexes |
|---|---|
| `Order` | `orderNumber` (unique), `customerPhone`, `createdAt` |
| `Product` | `{ active, createdAt }` |
| `Print` | `{ active, category, createdAt }` |
| `Promotion` | `{ isActive, startDate, endDate }` |
| `TelegramSession` | `chatId` (unique) |

### Seeding

```bash
# Seed everything at once
npm run seed:all

# Or individually
npm run seed:products
npm run seed:prints
npm run seed:gallery

# Create the admin user (run once per environment)
npx tsx --env-file=.env scripts/seed-admin.ts
```

> **Important:** Change the default admin password (`admin123`) immediately after seeding.

---

## Telegram Bots

The project uses two separate Telegram bots.

### Admin Bot (`TELEGRAM_ADMIN_BOT_TOKEN`)
- Sends a notification to `TELEGRAM_ORDER_GROUP_ID` for every new order
- Admins can authenticate via the bot to manage orders through Telegram commands
- Broadcasts promotions and publications to `TELEGRAM_PROMO_CHANNEL_ID`
- Webhook endpoint: `POST /api/telegram/webhook`

### Client Bot (`TELEGRAM_CLIENT_BOT_TOKEN`)
- Customer-facing: catalogue browsing, order tracking, promo subscription
- Checks `CHANNEL_USERNAME` membership for subscription-gated features
- Webhook endpoint: `POST /api/telegram-client/webhook`

### Setting Up Webhooks (production)

```
# 1. Deploy the app so both URLs are reachable over HTTPS.

# 2. Set TELEGRAM_WEBHOOK_URL, TELEGRAM_CLIENT_WEBHOOK_URL,
#    and TELEGRAM_WEBHOOK_SECRET in your production environment.

# 3. Register the webhooks by visiting each URL once:
GET https://artlavka.uz/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>
GET https://artlavka.uz/api/telegram-client/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>
```

Telegram will then POST every update to your endpoints, and the app will verify the `X-Telegram-Bot-Api-Secret-Token` header before processing.

### Development
In development (`NODE_ENV !== "production"`) the bots do not register a webhook, so no public URL is needed. You can skip Telegram testing locally or use a tool like [ngrok](https://ngrok.com) to expose your local server.

---

## Image Compression

All static images in `public/` are stored as `.webp`. To regenerate them from source PNGs (e.g. after adding new ones):

```bash
npm run compress:assets
```

The script (`scripts/compress-public-assets.ts`):
- Converts PNG/JPG → WebP using Sharp at quality 80–90
- Skips `art-lavka-square.png` (used as OG image — social crawlers require PNG/JPG)
- Skips `public/uploads/` (runtime-generated files)
- Is idempotent: skips files whose WebP is already newer than the source
- Reports per-file and total savings

For user-uploaded images (products, prints, gallery), the upload pipeline in `src/lib/upload.ts` automatically:
1. Validates file type (JPEG, PNG, WebP, HEIC, AVIF) and size (max 5 MB)
2. Resizes to max 1600 px wide (no upscaling)
3. Converts to WebP at quality 82
4. Optionally generates a 400 px preview thumbnail
5. Uploads to Cloudinary in production or saves to `public/uploads/` in development

---

## Deployment

The project is deployed on **Vercel**.

### Domains

| Domain | Role |
|---|---|
| `artlavka.uz` | **Canonical** — all metadata, sitemap, and robots point here |
| `art-lavka.uz` | 301 → `artlavka.uz` |
| `www.art-lavka.uz` | 301 → `artlavka.uz` |
| `www.artlavka.uz` | 301 → `artlavka.uz` |

The redirects are host-based and defined in `next.config.ts` (`redirects()`). For them to work, **all four domains must be attached to the Vercel project** (`Settings → Domains`) so requests for the legacy domains reach the app at all. In Vercel, set `artlavka.uz` as the primary domain and leave the others as "Redirect to" or plain aliases — either way the app-level redirect catches them.

### Steps

1. Connect the GitHub repository to a Vercel project.
2. Attach all domains (see table above) and set `artlavka.uz` as primary.
3. Add all environment variables in `Settings → Environment Variables` (Production environment).
4. Deploy — Vercel auto-detects Next.js.
5. After the first successful deployment, register the Telegram webhooks (see above).

### Post-deployment checklist

- [ ] `NEXTAUTH_SECRET` is a strong unique value (not shared with dev)
- [ ] `NEXTAUTH_URL` is set to `https://artlavka.uz`
- [ ] `USE_CLOUDINARY=true`
- [ ] Both Telegram webhooks registered via the GET endpoints
- [ ] Admin password changed from the default `admin123`
- [ ] Production database seeded (if starting fresh)

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start built production server |
| `npm run type-check` | Run `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run seed:products` | Seed product catalogue into MongoDB |
| `npm run seed:prints` | Seed print designs into MongoDB |
| `npm run seed:gallery` | Seed gallery images into MongoDB |
| `npm run seed:all` | Run all three seed scripts in sequence |
| `npm run compress:assets` | Compress `public/` images to WebP |
| `npm run upload:images` | Batch-upload local images to Cloudinary |
| `npm run migrate:cloudinary` | Migrate existing DB image URLs to Cloudinary |
| `npm run migrate:prints-webp` | Convert print image URLs in DB to WebP |
| `npm run repair:cancelled-stock` | Restore stock for all cancelled orders |

---

## Architecture Notes

### Authorization (two layers)

1. **Edge middleware** — `src/proxy.ts` uses `next-auth/middleware` to redirect unauthenticated requests away from `/admin/*` (excluding `/admin/login`) before they reach any server component.

2. **Server-action guards** — Every admin server action and admin API route handler calls `await requireAdmin()` (`src/lib/requireAdmin.ts`) as its first line. This is the authoritative check: Next.js server actions compile to public POST endpoints that URL-level middleware cannot fully cover, so each action enforces auth independently.

### Server-side Order Pricing

Client-submitted money fields are never trusted. When `createOrder` is called, `src/lib/orderPricing.ts`:
1. Fetches the authoritative unit price for each item from the database (variant price, falling back to product price)
2. Derives the maximum legitimate discount from currently-active promotions
3. Rejects any order whose submitted total is below the server-computed minimum
4. Persists only server-authoritative prices

### Image Upload Pipeline

| Environment | Behaviour |
|---|---|
| Development | Images saved to `public/uploads/` as WebP |
| Production (`USE_CLOUDINARY=true`) | Images compressed with Sharp then uploaded to Cloudinary |

Sharp pre-processes every upload before Cloudinary receives it, keeping storage and bandwidth costs low.

### Internationalisation

Three languages are supported: Russian (`ru`), English (`en`), Uzbek (`uz`). Translation files live in `src/lib/i18n/locales/*.json`. The active language is stored in Zustand (`languageStore`, persisted to `localStorage`). Products and prints carry per-field translation objects; `getTranslated()` selects the right value at render time.
