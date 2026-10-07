export type AnalyticsEvent =
  | 'map_opened'
  | 'location_requested'
  | 'location_granted'
  | 'location_denied'
  | 'place_marker_clicked'
  | 'place_opened'
  | 'directions_clicked'
  | 'language_changed'
  | 'city_changed'
  | 'guide_opened'
  | 'affiliate_clicked'
  | 'search_performed'
  | 'filter_applied'

export function track(event: AnalyticsEvent, payload?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === 'development') {
    console.info('[analytics disabled]', event, payload ?? {})
  }
}
