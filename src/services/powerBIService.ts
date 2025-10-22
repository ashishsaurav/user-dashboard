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
      console.log("✅ Using cached PowerBI token for", workspaceId, reportId);
      return cached;
    }

    // Fetch new token
    const apiUrl = `${API_CONFIG.BASE_URL}/powerbi/${workspaceId}?reportId=${reportId}`;
    console.log("🔄 Fetching new PowerBI token from:", apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.error) {
            errorMessage = errorData.message || errorData.error;
          }
        } catch {
          // Could not parse error response
        }
        
        console.error("❌ PowerBI API error:", {
          url: apiUrl,
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });
        
        throw new Error(errorMessage);
      }

      const embedInfo = await response.json();

      // Validate response
      if (!embedInfo.embedToken || !embedInfo.embedUrl) {
        console.error("❌ Invalid PowerBI response:", embedInfo);
        throw new Error("Invalid PowerBI embed response - missing token or URL");
      }

      // Cache the token
      powerBITokenCache.set(workspaceId, reportId, embedInfo);
      console.log("✅ Successfully fetched and cached PowerBI token");

      return embedInfo;
    } catch (error: any) {
      console.error("❌ Failed to fetch PowerBI token:", {
        workspaceId,
        reportId,
        url: apiUrl,
        error: error.message || error,
      });
      
      // Re-throw with more context
      throw new Error(
        error.message || "Failed to connect to PowerBI service. Check if backend is running."
      );
    }
  }
}

export const powerBIService = new PowerBIService();
