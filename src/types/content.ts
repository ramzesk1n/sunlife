export interface PricingFeature {
  text: string;
  highlight?: boolean;
  warning?: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  note?: string;
}

export interface PricingData {
  packages: PricingPackage[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQData {
  categories: {
    customer: FAQItem[];
    partnership: FAQItem[];
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface BenefitsData {
  benefits: Benefit[];
}

export interface Review {
  id: string;
  author: string;
  text: string;
  date?: string;
  city?: string;
}

export interface ReviewsData {
  reviews: Review[];
}

export interface Step {
  id: string;
  title: string;
  description: string;
  image: string;
  stat?: string;
}

export interface StepsData {
  introText: string;
  steps: Step[];
}

export interface City {
  name: string;
  region?: string;
}

export interface GeographyData {
  cities: City[];
  geographyText: string;
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

export interface MetaData {
  siteMeta: {
    siteName: string;
    baseUrl: string;
    defaultOgImage: string;
  };
  pages: PageMeta[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GalleryData {
  images: GalleryImage[];
}

export interface PartnershipAboutItem {
  id: string;
  number: string;
  text: string;
}

export interface PartnershipOffer {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface PartnershipPriceItem {
  id: string;
  title: string;
  price: string;
}

export interface PartnershipNewbornItem {
  id: string;
  title: string;
  price: string;
}

export interface PartnershipTeamMember {
  id: string;
  name: string;
  role: string;
  src: string;
}

export interface PartnershipProject {
  id: string;
  src: string;
  alt: string;
  title: string;
}

export interface PartnershipData {
  about: PartnershipAboutItem[];
  offers: PartnershipOffer[];
  prices: PartnershipPriceItem[];
  newborn: PartnershipNewbornItem[];
  newbornExtras: string[];
  team: PartnershipTeamMember[];
  projects: PartnershipProject[];
}
