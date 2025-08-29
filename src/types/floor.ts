export interface Hotspot {
  id?: string;         // optional id for frontend display
  apartmentId: string; // reference to the apartment doc / id
  x: number;           // percentage (0-100) from the left of the image
  y: number;           // percentage (0-100) from the top of the image
  width?: number;      // optional rectangle width (% of image width)
  height?: number;     // optional rectangle height
  label?: string;      // optional label for display
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  description: string;
  totalApartments: number;
  floorPlanUrl?: string;
  model3dUrl?: string;
  buildingId: string;
  floorNumber: number;
  area: number;
  createdAt: string;
  updatedAt: string;
  // Now supports multiple images per floor
  imageUrls: string[];
  // Store only apartment document IDs to avoid heavy nested objects
  apartmentIds: string[];

  // New fields for top-view and image-specific hotspots
  topViewHotspots: Hotspot[];
  // Key is image number (e.g., "1", "2", "3") extracted from filename
  angleHotspots: { [imageNumber: string]: Hotspot[] };
} 