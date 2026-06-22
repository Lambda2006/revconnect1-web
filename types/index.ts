// =====================
// DATABASE ROW TYPES
// Mirrors the Supabase schema exactly (section 6 of blueprint)
// =====================

export type UserRow = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  home_marina: string | null
  bio: string | null
  created_at: string
}

export type BoatRow = {
  id: string
  owner_id: string
  make: string
  model: string
  year: number | null
  engine_type: string | null
  engine_hours: number | null
  hull_id: string | null
  notes: string | null
  is_primary: boolean
  created_at: string
}

export type MeetupRow = {
  id: string
  host_id: string
  title: string
  description: string | null
  location_name: string | null
  lat: number | null
  lng: number | null
  activity_type: string | null
  max_boats: number | null
  event_date: string | null
  visibility: 'public' | 'followers' | 'invite'
  created_at: string
}

export type MeetupAttendeeRow = {
  id: string
  meetup_id: string
  user_id: string
  boat_id: string | null
  status: 'pending' | 'confirmed' | 'declined'
  rsvp_at: string
}

export type FollowRow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type MeetupMessageRow = {
  id: string
  meetup_id: string
  sender_id: string
  content: string
  sent_at: string
}

export type ApprovedSourceRow = {
  id: string
  source_name: string
  base_url: string
  source_type: 'support_site' | 'parts_catalog' | 'recall_db'
  boat_make: string | null
  boat_model: string | null
  is_active: boolean
  created_at: string
}

export type CachedResponseRow = {
  id: string
  boat_make: string
  boat_model: string
  boat_year: number | null
  query_category: string
  query_hash: string
  query_summary: string | null
  response: AgentResponsePayload
  source_urls: string[] | null
  is_emergency: boolean
  hit_count: number
  cached_at: string
  expires_at: string | null
}

export type AgentSessionRow = {
  id: string
  user_id: string
  boat_id: string | null
  messages: AgentMessage[]
  source_urls: string[] | null
  media_inputs: MediaInput[] | null
  session_type: 'fault_diagnosis' | 'install' | 'parts' | 'general' | null
  started_at: string
  updated_at: string
}

export type SubscriptionRow = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_sub_id: string | null
  plan: 'app_only' | 'app_and_agent'
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  trial_ends_at: string | null
  current_period_end: string | null
  payment_method_detached: boolean
  canceled_at: string | null
  created_at: string
}

export type BusinessRow = {
  id: string
  owner_user_id: string | null
  business_name: string
  category: string | null
  description: string | null
  website_url: string | null
  phone: string | null
  address: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export type PromotionRow = {
  id: string
  business_id: string
  title: string
  description: string | null
  promo_code: string | null
  discount_type: 'percentage' | 'flat' | 'free_item' | null
  discount_value: number | null
  image_url: string | null
  is_active: boolean
  requires_download: boolean
  redemption_limit: number | null
  redemption_count: number
  starts_at: string | null
  expires_at: string | null
  created_at: string
}

export type PromoRedemptionRow = {
  id: string
  promotion_id: string
  user_id: string
  redemption_code: string | null
  redeemed_at: string
}

export type PromoImpressionRow = {
  id: string
  promotion_id: string
  user_id: string
  action: 'viewed' | 'tapped' | 'saved' | 'redeemed'
  created_at: string
}

export type BoatModelRequestRow = {
  id: string
  user_id: string | null
  make: string
  model: string
  year: number | null
  request_count: number
  status: 'pending' | 'in_progress' | 'supported'
  created_at: string
}

// =====================
// SUBSCRIPTION STATE
// Computed in useSubscription — drives all access gating
// =====================

export type SubscriptionState = {
  /** Raw status from the subscriptions table */
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  /** Current plan */
  plan: 'app_only' | 'app_and_agent'
  /** When the 7-day trial ends */
  trialEndsAt: Date | null
  /** Days remaining in trial (null if not trialing) */
  daysRemaining: number | null
  /** true if trialing OR (active AND app_and_agent) */
  agentAccess: boolean
  /** true if trialing OR active */
  appAccess: boolean
  /** true if status === 'canceled' — routes to welcome screen */
  isCanceled: boolean
  /** Raw subscription row, null if not loaded yet */
  subscription: SubscriptionRow | null
  /** Loading state */
  loading: boolean
}

// =====================
// AGENT TYPES
// =====================

export type UserInput = {
  text: string
  imageUrl?: string      // Supabase Storage signed URL
  imageB64?: string      // base64 for Claude vision API
  transcript?: string    // Whisper output
}

export type AgentMessage = {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  timestamp: string
}

export type AgentResponsePayload = {
  answer: string
  steps: string[]
  citations: {
    title: string
    url: string
    section: string
  }[]
  partNumbers: string[]
  safetyFlag: boolean
  recommendProfessional: boolean
  /**
   * Set to true by Claude when approved sources did not contain sufficient
   * information. Triggers the Claude-expertise fallback in agent+api.ts.
   */
  insufficientSources?: boolean
  /**
   * Tagged by the API — not set by Claude. Indicates where the answer came from:
   * - 'cache'            — returned from cached_responses table
   * - 'approved_sources' — retrieved live from approved source URLs
   * - 'claude_expertise' — approved sources were insufficient; answered from
   *                        Claude's trained boating knowledge (no web retrieval)
   */
  sourceType?: 'cache' | 'approved_sources' | 'claude_expertise'
}

export type MediaInput = {
  type: 'image' | 'voice'
  storageUrl?: string
  transcript?: string
}

// =====================
// MISC SHARED TYPES
// =====================

export type TabParamList = {
  discover: undefined
  'my-meetups': undefined
  garage: undefined
  profile: undefined
}
