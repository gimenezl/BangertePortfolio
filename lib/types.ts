// Database types
export interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[];
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  cover_image: File | null;
  gallery_images: File[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
