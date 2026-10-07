# Oxploria V2 design direction

<!-- impeccable:design-schema 1 -->

## World

Oxploria feels like a field atlas unfolded in the street: precise enough to navigate, editorial enough to invite curiosity, and bright enough to use in daylight. The system borrows from pocket maps, heritage plaques and pencil annotations without imitating paper or turning the interface into a costume.

## Core mechanism

Location is the organizing force. A continuous route line, map coordinates, nearby distance and the compass-pin mark connect discovery surfaces. Yellow always means orientation, selection or forward movement.

## Palette

- Signal yellow `#FFD400`: brand, selected markers, primary actions, focus.
- Ink `#151515`: primary text and night surfaces.
- Paper `#F6F3EA`: main background, warmer than app-white.
- White `#FFFFFF`: readable cards and map controls.
- Clay `#D94C30`: errors and exceptional warnings only.
- Forest `#255D4A`: success and open states only.
- Rules use translucent ink rather than extra gray hues.

## Typography

Use locally bundled Geist Sans for interface text and Geist Mono for coordinates, distances and compact data. Headings use the same family at strong editorial scale; hierarchy comes from composition, weight and measure rather than a decorative display face. Visible copy remains readable at 16px or larger.

## Composition

- Mobile starts as a single useful field with controls in thumb reach and contextual sheets over the map.
- Desktop map exploration is a stable split view: scrollable index at left, geographic field at right.
- Editorial pages alternate broad image fields with narrow 65–72ch reading columns.
- Fine map rules can divide content; card borders and shadows are never stacked together.
- Photos are large and decisively cropped. Missing media becomes a branded coordinate field, never a broken image.

## Components and states

- Buttons are substantial, direct and action-labelled. Primary is yellow on ink; quiet controls use paper or white.
- Cards have 12–16px radii and one depth cue. Place cards preserve image, name, kind, distance and a clear next action.
- Selection is carried by fill, outline and text, never color alone.
- Loading reserves final geometry. Empty and error states explain recovery in the current language.
- Custom map markers reuse the compass-pin silhouette and expand only when selected.

## Motion

Motion confirms geography: marker selection lifts a preview, sheets travel vertically, and list/map focus stays continuous. Durations stay between 160–320ms with a quick ease-out. Reduced-motion preserves state changes without travel or parallax.

## Responsive behavior

Touch controls are at least 44px with 8px spacing. The map keeps a visible geographic area behind mobile sheets. At larger widths, controls move into the sidebar and more metadata appears. Safe-area insets are supported. No core action depends on hover.

## Raises from the Impeccable comparison

- **Transit-map discipline:** preserve network context when a place is selected; never zoom the whole system into an unreadable miniature.
- **Star-atlas hierarchy:** marker scale and labels communicate importance while cultural context remains optional and readable.
- **Reference-manual rigor:** data labels, optional fields and error states follow one predictable grammar.

## Refusals

No generic SaaS gradients, glass panels, review scores, nested card grids, decorative eyebrow labels, travel-booking clichés, emoji icons, fake claims, multicolor category chaos or app-download-first messaging.
