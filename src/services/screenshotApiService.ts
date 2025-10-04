import api from './api';

// Types for the screenshot API endpoints
export interface SensitiveImageFinding {
  id?: number;
  imageId?: number;
  label: string;
  category?: string | null;
  score?: number | null;
  raw?: any;
}

export interface SensitiveImageComment {
  id?: number;
  imageId?: number;
  authorUserId?: number;
  targetUserId?: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SensitiveImage {
  id: number;
  userId: number;
  status: 'clean' | 'explicit' | 'warning';
  summary?: string;
  rawMeta?: {
    imagesCount: number;
  };
  createdAt: string;
  updatedAt: string;
  findings?: SensitiveImageFinding[];
  comments?: SensitiveImageComment[];
}

export interface ScreenshotAnalysisResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: {
    id: number;
    status: 'clean' | 'explicit' | 'warning';
    findings?: SensitiveImageFinding[];
  };
}

export interface SensitiveImagesResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SensitiveImage[];
}

// Screenshot API Service
export class ScreenshotApiService {
  
  /**
   * Send screenshots to be scrutinized by the AI moderation service
   * @param images Array of base64 encoded images
   * @returns Analysis response with status and findings
   */
  async scrutinizeScreenshots(images: string[]): Promise<ScreenshotAnalysisResponse> {
    if (!Array.isArray(images) || !images.length) {
      throw new Error('images[] required');
    }

    try {
      const response = await api.post('/screenshots/scrutinized', { images });
      return response.data as ScreenshotAnalysisResponse;
    } catch (error) {
      console.error('Failed to scrutinize screenshots:', error);
      throw error;
    }
  }

  /**
   * Get sensitive images for a user (current user or partner if authorized)
   * @param userId Optional user ID to view partner's sensitive images
   * @returns List of sensitive images with findings and comments
   */
  async getSensitiveImages(userId?: number): Promise<SensitiveImage[]> {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/screenshots/sensitive', { params });
      return response.data.data as SensitiveImage[];
    } catch (error) {
      console.error('Failed to fetch sensitive images:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a sensitive image (partners only)
   * @param imageId ID of the sensitive image
   * @param comment Comment text
   * @returns Created comment data
   */
  async addComment(imageId: number, comment: string): Promise<SensitiveImageComment> {
    if (!imageId || !comment.trim()) {
      throw new Error('Invalid payload');
    }

    try {
      const response = await api.post(`/screenshots/${imageId}/comments`, { comment });
      return response.data.data as SensitiveImageComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * Cancel a user's streak due to sensitive content (partners only)
   * @param imageId ID of the sensitive image
   * @returns Success response
   */
  async cancelStreak(imageId: number): Promise<void> {
    if (!imageId) {
      throw new Error('Image ID required');
    }

    try {
      await api.post(`/screenshots/${imageId}/cancel-streak`);
    } catch (error) {
      console.error('Failed to cancel streak:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const screenshotApiService = new ScreenshotApiService();
export default screenshotApiService;
