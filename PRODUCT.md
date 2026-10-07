# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16, TypeScript, React 19 and App Router. The user delegated implementation decisions inside this fixed stack. The project is independent from the legacy `oxploria-website` application.

## Users

Oxploria serves visitors and residents who are physically exploring a city, often outdoors, walking, using one hand and a variable mobile connection. They need to understand what is nearby, why it matters, and how to continue exploring without creating an account.

## Product Purpose

Oxploria is the web product for discovering cultural places around the user. It combines a location-aware map, search and filters, editorial place pages, city pages and guides. Success means a visitor can move from arrival to a relevant nearby place, understand its history, and continue exploring with minimal friction.

## Positioning

Oxploria organizes discovery around proximity, cultural context and free exploration. It does not rank places through reviews or star ratings. Its durable promise is expressed by the idea: no reviews, no ratings, just history.

## Operating Context

- Mobile-first use outdoors, with touch input, bright ambient light and short sessions.
- Desktop use for planning with a persistent list-and-map view.
- French, Spanish and English have distinct localized URLs and complete interface translations.
- Barcelona and La Rochelle are the first cities; the architecture must support more cities.
- The primary flow is location or city selection → map → marker preview → full place page → nearby places or guide.

## Capabilities and Constraints

- No account is required.
- Public tourist places are read from the real Firebase project through a server-only repository boundary. Firestore document IDs and the historical `distance` coordinate string remain unchanged.
- Cities, categories and editorial guides remain static TypeScript content while place pages, search, maps and nearby results use normalized Firestore data.
- Search is accent- and case-insensitive. Filters support primary categories and secondary collections.
- Geolocation handles unknown, loading, granted, denied, unavailable, timeout and error states without blocking manual city exploration.
- Place pages, city pages, categories and guides are indexable. Temporary map/search state is not an indexing surface.
- Affiliate offers, analytics, consent and advertisements have typed or centralized integration seams but no live provider in phase one.
- The legacy project is a read-only reference and backup. No runtime dependency may point to it.

## Brand Commitments

- Preserve the Oxploria name, existing compass-pin logo and yellow / white / black identity.
- Preserve the direct, curious, culturally grounded personality while replacing the app-download landing-page UX.
- The product must feel premium, editorial, immersive and useful in the street, without travel-agency clichés, generic SaaS gradients, review-site patterns or copied marketplace design.
- Place names come from localized source data and are never mechanically translated.

## Evidence on Hand

- Existing brand logo, favicons and OG image in `../oxploria-website/public/`.
- Legacy copy and localized route history in `../oxploria-website/`.
- Real public place data is available for Barcelona and La Rochelle. Static city and guide imagery remains provisional and must not be presented as verified destination photography.
- There are no approved testimonials, ratings, booking prices or affiliate relationships to present.

## Product Principles

1. Put discovery within one thumb reach.
2. Keep the map and the cultural story connected.
3. Let place facts and history speak without rankings.
4. Make every useful path work without location permission or an account.
5. Treat localized URLs, fast rendering and accessible alternatives as product features.

## Accessibility & Inclusion

Target WCAG 2.2 AA where practical: semantic landmarks, keyboard access, visible focus, sufficient contrast, meaningful alt text, 44px touch targets for primary controls, reduced-motion support, accessible forms and a complete list alternative to the interactive map.
