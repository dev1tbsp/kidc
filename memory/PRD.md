# Kids Feast — Birthday Party Catering Website

## Original Problem Statement
Business website for catering business focussed on kids birthday parties.
- by age group
- activities
- different offerings
- catering packages
- snacks box/packed food
- image/gallery
- quote generator
- feedback/testimonials
- SEO friendly with admin panel to update content

## User Choices
- Admin auth: Simple JWT-based login (cookie-based, bcrypt + brute-force protection)
- Quote generator: Dynamic calculator based on selections
- Content management: Basic — packages, prices, testimonials, gallery images
- Gallery: Stock/placeholder images (Unsplash + Pexels)
- Theme: Colorful, playful, kid-friendly ("Vibrant Play" archetype)

## Architecture
- **Backend**: FastAPI + MongoDB (motor) at `/api/*` prefix
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + lucide-react
- **Auth**: JWT in httpOnly cookies (access 60min, refresh 7d), bcrypt hashing
- **Theme**: Fredoka headings + Nunito body, sky/amber/pink/emerald palette
- **DB**: `kidsfeast_db` (collections: users, age_groups, activities, packages, snack_boxes, testimonials, gallery, quote_requests, site_info, login_attempts)

## User Personas
- **Parent**: browses site, builds a custom quote in <2 mins, submits contact details
- **Admin (catering business owner)**: logs in, manages content (packages/prices/testimonials/gallery), processes incoming quote requests

## Core Requirements
- SEO-friendly meta tags + page titles per route
- Multi-step Quote Calculator (Age → Guests → Package → Activities → Snack Box → Contact)
- Admin dashboard with CRUD over 6 content types + quote management
- Mobile-responsive playful design

## What's Been Implemented (2026-02-24)
- ✅ Public home page with Hero, Age Groups, Activities, Packages, Snack Boxes, Gallery Preview, Testimonials marquee, CTA
- ✅ Packages page, Gallery page (with category filter), Contact page
- ✅ 6-step interactive Quote Calculator with live total + visual selection cards
- ✅ Admin login (`/admin/login`) with JWT cookies + brute-force lockout (email-keyed, 5 attempts / 15 min)
- ✅ Admin dashboard with 7 tabs: Quote Requests + 6 content CRUD (Packages, Age Groups, Activities, Snack Boxes, Testimonials, Gallery)
- ✅ Server-side quote total recomputation (prevents client tampering)
- ✅ Auto-seeded admin (`admin@kidsfeast.com` / `admin123`) + content seeds on startup
- ✅ SEO meta tags (per page, OG + Twitter cards)
- ✅ Stock images curated from Unsplash + Pexels
- ✅ Backend tested: 19/20 pytest pass, all critical flows working
- ✅ Frontend tested: 100% on public + admin flows

## Prioritized Backlog
### P0 (nice-to-have)
- Email notifications on new quote request (Resend/SendGrid)
- Image upload for admin (currently URL-only) — could use object storage

### P1
- Multi-language support
- Calendar booking integration (Google Calendar)
- Stripe deposit/payment integration
- Per-page sitemap.xml + robots.txt

### P2
- Blog/news section for SEO
- A/B testing of CTAs
- Customer self-service portal for booked parties
