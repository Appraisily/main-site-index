/**
 * Shared TypeScript interfaces for common data models used across Appraisily applications
 */

/**
 * User profile interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  role: 'user' | 'appraiser' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * Basic address model
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Contact information model
 */
export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
}

/**
 * Appraiser profile model
 */
export interface AppraiserProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  specialty: string[];
  experience: number; // years
  credentials: string[];
  contactInfo: ContactInfo;
  profileImage: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Review model
 */
export interface Review {
  id: string;
  userId: string;
  appraiserProfileId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  date: string;
  isVerified: boolean; // Verified purchase/interaction
  replyText?: string;
  replyDate?: string;
}

/**
 * Art category model
 */
export interface ArtCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
}

/**
 * Service pricing model
 */
export interface ServicePricing {
  id: string;
  appraiserProfileId: string;
  serviceName: string;
  description: string;
  price: number;
  currency: string;
  isCustomQuote: boolean;
  estimatedDuration?: string; // e.g., "2-3 days"
}

/**
 * Image with metadata
 */
export interface ImageAsset {
  id: string;
  url: string;
  altText?: string;
  width: number;
  height: number;
  mimeType: string;
  size: number; // in bytes
  createdAt: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
} 