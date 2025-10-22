import { API_CONFIG } from "../config/api.config";

export interface PowerBIEmbedInfo {
  reportId: string;
  embedUrl: string;
  embedToken: string;
  tokenExpiration: string;
}

class PowerBIService {
  async getEmbedToken(
    workspaceId: string,
    reportId: string
  ): Promise<PowerBIEmbedInfo> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/powerbi/${workspaceId}?reportId=${reportId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get PowerBI token: ${response.statusText}`);
    }

    return response.json();
  }
}

export const powerBIService = new PowerBIService();
