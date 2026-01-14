export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: number;
}

export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16",
  Wide = "4:3",
  Tall = "3:4"
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
}

export interface UploadedImage {
  data: string; // Base64 string without prefix
  mimeType: string;
  previewUrl: string; // Full data URL for display
}
