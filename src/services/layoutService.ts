/**
 * Layout Service
 * Handles layout customization API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { LayoutData } from 'rc-dock';

interface LayoutCustomizationDto {
  id: number;
  userId: string;
  layoutSignature: string;
  layoutData: string;
  timestamp: number | null;
}

export interface LayoutCustomization {
  signature: string;
  layout: LayoutData;
  timestamp: number;
}

export class LayoutService {
  /**
   * Get all layouts for user
   */
  async getUserLayouts(userId: string): Promise<LayoutCustomization[]> {
    const layouts = await apiClient.get<LayoutCustomizationDto[]>(
      API_ENDPOINTS.LAYOUT.GET_ALL(userId)
    );
    return layouts.map(this.transformToFrontend);
  }

  /**
   * Get specific layout by signature
   */
  async getLayout(
    userId: string,
    signature: string
  ): Promise<LayoutCustomization | null> {
    try {
      const layout = await apiClient.get<LayoutCustomizationDto>(
        API_ENDPOINTS.LAYOUT.GET(userId, signature)
      );
      return this.transformToFrontend(layout);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save layout
   */
  async saveLayout(
    userId: string,
    signature: string,
    layoutData: LayoutData
  ): Promise<LayoutCustomization> {
    const dto = await apiClient.post<LayoutCustomizationDto>(
      API_ENDPOINTS.LAYOUT.SAVE(userId),
      {
        layoutSignature: signature,
        layoutData: JSON.stringify(layoutData),
        timestamp: Date.now(),
      }
    );
    return this.transformToFrontend(dto);
  }

  /**
   * Delete specific layout
   */
  async deleteLayout(userId: string, signature: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LAYOUT.DELETE(userId, signature));
  }

  /**
   * Delete all user layouts
   */
  async deleteAllLayouts(userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.LAYOUT.DELETE_ALL(userId));
  }

  /**
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: LayoutCustomizationDto): LayoutCustomization {
    return {
      signature: dto.layoutSignature,
      layout: JSON.parse(dto.layoutData),
      timestamp: dto.timestamp || Date.now(),
    };
  }
}

export const layoutService = new LayoutService();
export default layoutService;
