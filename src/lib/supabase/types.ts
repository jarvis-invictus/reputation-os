export type BusinessType = 'clinic' | 'restaurant' | 'salon' | 'retail' | 'other';

export type ChannelConfig = {
  qr_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  kiosk_enabled: boolean;
  reminder_delay_days: number;
  review_delivery: 'copy' | 'whatsapp' | 'both';
  high_rating_threshold: number;
};

export type Business = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  type: BusinessType;
  logo_url: string | null;
  accent_color: string;
  tagline: string | null;
  google_business_name: string | null;
  google_maps_url: string | null;
  owner_name: string;
  owner_title: string;
  service_list: string[];
  ai_style: 'formal' | 'casual' | 'enthusiastic' | 'simple';
  ai_custom_instructions: string | null;
  channels: ChannelConfig;
  total_reviews: number;
  average_rating: number | null;
  this_month_reviews: number;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  last_service_date: string | null;
  last_reminder_sent: string | null;
  last_feedback_date: string | null;
  last_rating: number | null;
  total_visits: number;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  business_id: string;
  contact_id: string;
  appointment_date: string | null;
  trigger_type: 'after_visit' | 'scheduled' | 'manual';
  trigger_days_after: number | null;
  status: 'pending' | 'sent' | 'clicked' | 'feedback_received' | 'failed';
  channel: string | null;
  scheduled_for: string;
  sent_at: string | null;
  clicked_at: string | null;
  created_at: string;
};

export type Feedback = {
  id: string;
  business_id: string;
  contact_id: string | null;
  contact_name: string;
  rating: number;
  liked_items: string[];
  comment: string | null;
  generated_review: string | null;
  review_copied: boolean;
  review_copied_at: string | null;
  channel: 'qr' | 'whatsapp' | 'sms' | 'email' | 'kiosk' | 'link';
  qr_location: string | null;
  reminder_id: string | null;
  created_at: string;
};

export type QrCode = {
  id: string;
  business_id: string;
  location_tag: string;
  url_slug: string;
  image_url: string | null;
  total_scans: number;
  created_at: string;
};

export type LikedItemsByType = Record<BusinessType, string[]>;

export const likedItemsByType: LikedItemsByType = {
  clinic: ['staff', 'treatment', 'cleanliness', 'price', 'ambiance', 'speed'],
  restaurant: ['food', 'service', 'ambiance', 'cleanliness', 'price', 'speed'],
  salon: ['staff', 'service', 'ambiance', 'cleanliness', 'price', 'result'],
  retail: ['staff', 'product_quality', 'variety', 'cleanliness', 'price', 'service'],
  other: ['staff', 'service', 'quality', 'cleanliness', 'price', 'convenience'],
};

export const likedItemDescriptors: Record<string, string[]> = {
  staff: [
    "the staff were incredibly welcoming and professional",
    "the team made me feel completely at ease",
    "everyone I interacted with was warm and helpful",
    "the reception and service staff were excellent",
  ],
  treatment: [
    "the treatment I received was thorough and precise",
    "the procedure was handled with great skill and care",
    "the quality of care exceeded my expectations",
    "everything was explained clearly and handled professionally",
  ],
  cleanliness: [
    "the clinic was spotlessly clean and well-maintained",
    "every corner was hygienic and organized",
    "the facility was clearly well-maintained",
    "clean, modern, and comfortable environment",
  ],
  price: [
    "the pricing was transparent and fair for the quality",
    "great value for the level of service provided",
    "quality care at reasonable prices",
    "worth every rupee for the treatment received",
  ],
  ambiance: [
    "the atmosphere was calm and relaxing",
    "the space was comfortable and well-designed",
    "modern and inviting environment",
    "made the visit feel comfortable and pleasant",
  ],
  speed: [
    "everything was handled efficiently without rushing",
    "minimal wait time, smooth process throughout",
    "quick and hassle-free experience",
    "well-organized and timely service",
  ],
  food: [
    "the food was fresh, flavorful, and beautifully presented",
    "every dish exceeded expectations in taste and quality",
    "the flavors were outstanding and portions were generous",
  ],
  service: [
    "the service was attentive and personal",
    "every request was handled promptly and professionally",
  ],
  product_quality: [
    "the products were high quality and exactly as described",
    "every item felt premium and well-crafted",
  ],
  result: [
    "the results were exactly what I was looking for",
    "the outcome exceeded my expectations",
  ],
  quality: [
    "the overall quality was outstanding",
    "everything was top-notch and well-executed",
  ],
  convenience: [
    "the process was convenient and easy",
    "everything was straightforward and hassle-free",
  ],
};

export const businessPresets: Record<BusinessType, {
  owner_label: string;
  services_label: string;
  liked_items: string[];
  ai_context: string;
  default_liked_items: string[];
}> = {
  clinic: {
    owner_label: 'Doctor',
    services_label: 'treatments',
    liked_items: ['staff', 'treatment', 'cleanliness', 'price', 'ambiance', 'speed'],
    ai_context: 'medical',
    default_liked_items: ['staff', 'treatment', 'cleanliness'],
  },
  restaurant: {
    owner_label: 'Chef / Owner',
    services_label: 'dishes',
    liked_items: ['food', 'service', 'ambiance', 'cleanliness', 'price', 'speed'],
    ai_context: 'food',
    default_liked_items: ['food', 'service', 'ambiance'],
  },
  salon: {
    owner_label: 'Stylist / Owner',
    services_label: 'services',
    liked_items: ['staff', 'service', 'ambiance', 'cleanliness', 'price', 'result'],
    ai_context: 'beauty',
    default_liked_items: ['staff', 'service', 'result'],
  },
  retail: {
    owner_label: 'Owner',
    services_label: 'products',
    liked_items: ['staff', 'product_quality', 'variety', 'cleanliness', 'price', 'service'],
    ai_context: 'retail',
    default_liked_items: ['staff', 'product_quality', 'service'],
  },
  other: {
    owner_label: 'Owner',
    services_label: 'service',
    liked_items: ['staff', 'service', 'quality', 'cleanliness', 'price', 'convenience'],
    ai_context: 'general',
    default_liked_items: ['staff', 'service'],
  },
};
