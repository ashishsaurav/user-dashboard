import { API_CONFIG } from "../config/api.config";
import { powerBITokenCache } from "./powerBITokenCache";

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
    // Check cache first
    const cached = powerBITokenCache.get(workspaceId, reportId);
    if (cached) {
      return cached;
    }

    // Fetch new token
    console.log("🔄 Fetching new PowerBI token for", workspaceId, reportId);
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

    const embedInfo = await response.json();

    // Cache the token
    powerBITokenCache.set(workspaceId, reportId, embedInfo);

    return embedInfo;
  }
}

export const powerBIService = new PowerBIService();
