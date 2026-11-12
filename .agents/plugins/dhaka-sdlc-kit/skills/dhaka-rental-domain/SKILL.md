---
name: dhaka-rental-domain
description: >-
  Provides domain expertise for Dhaka City real estate: pricing benchmarks (BDT per sqft),
  standard amenities, neighborhood profiles, and commercial vs residential rental rules.
  Use when formulating listings, validating rental values, or assisting renters and landlords.
---

# Dhaka City Rental Domain Knowledge

## Neighborhood Benchmarks & Profiles

| Neighborhood | Vibe & Character | Residential Rent (BDT/sqft) | Commercial Office (BDT/sqft) | Retail Shop (BDT/sqft) | Typical Advance |
|---|---|---|---|---|---|
| **Gulshan** | Diplomatic, luxury, multinational HQs | ৳ 45 – ৳ 90 | ৳ 90 – ৳ 180 | ৳ 150 – ৳ 350+ | 3 – 6 months |
| **Banani** | Commercial road 11, dining, boutique offices | ৳ 40 – ৳ 75 | ৳ 80 – ৳ 150 | ৳ 130 – ৳ 300 | 3 – 6 months |
| **Dhanmondi** | Residential, lakes, schools, clinics, retail | ৳ 30 – ৳ 55 | ৳ 55 – ৳ 100 | ৳ 90 – ৳ 220 | 2 – 4 months |
| **Uttara** | Planned sectors, transit hubs, airport proximity | ৳ 25 – ৳ 45 | ৳ 50 – ৳ 90 | ৳ 80 – ৳ 180 | 2 – 4 months |
| **Mirpur** | Middle-class residential, IT startups, high density | ৳ 18 – ৳ 32 | ৳ 35 – ৳ 65 | ৳ 50 – ৳ 120 | 2 – 3 months |
| **Motijheel** | Traditional financial center, banking towers | ৳ 20 – ৳ 35 | ৳ 60 – ৳ 120 | ৳ 80 – ৳ 200 | 3 – 6 months |

## Essential Rental Attributes

1. **Home / Residential**:
   - `bedrooms`, `bathrooms`, `balconies`.
   - Utility: Gas line (Titas pipeline vs LPG cylinder) is a primary consideration in Dhaka.
   - Building features: Generator backup (lift + light points vs full AC backup), 24/7 security guard, CCTV, dedicated car parking.

2. **Commercial Office**:
   - Floor number, passenger lift + cargo lift, central AC or VRF provisions, 100% full power generator backup with auto-synchronization, fire safety clearance, and visitor parking.

3. **Retail Shop**:
   - Road frontage, ground floor vs upper floors, trade license eligibility (commercial approved holding), frontage glass display, monthly maintenance charges.

## Validation Heuristics for Dhaka Space Listings
- If a listing in `Gulshan` or `Banani` has rent < ৳ 25/sqft, trigger a pricing anomaly check.
- If an office listing lacks `generator` in Dhaka, advise the landlord that commercial tenants require power backup.
- Inquiries should capture preferred visit time (morning, afternoon, evening) and contact phone number (+880 standard).
