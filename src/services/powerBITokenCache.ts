import { PowerBIEmbedInfo } from './powerBIService';

interface CachedToken {
  embedInfo: PowerBIEmbedInfo;
  expiresAt: number; // Timestamp when token expires
}

class PowerBITokenCache {
  private cache: Map<string, CachedToken> = new Map();

  private getCacheKey(workspaceId: string, reportId: string): string {
    return `${workspaceId}:${reportId}`;
  }

  /**
   * Get cached token if valid
   */
  get(workspaceId: string, reportId: string): PowerBIEmbedInfo | null {
    const key = this.getCacheKey(workspaceId, reportId);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if token is still valid (with 5 min buffer)
    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minutes

    if (cached.expiresAt - bufferMs > now) {
      console.log('✅ Using cached PowerBI token for', key);
      return cached.embedInfo;
    }

    // Token expired, remove from cache
    console.log('⏰ Cached token expired for', key);
    this.cache.delete(key);
    return null;
  }

  /**
   * Store token in cache
   */
  set(workspaceId: string, reportId: string, embedInfo: PowerBIEmbedInfo): void {
    const key = this.getCacheKey(workspaceId, reportId);
    const tokenExpiration = parseInt(embedInfo.tokenExpiration);
    const expiresAt = Date.now() + tokenExpiration;

    this.cache.set(key, {
      embedInfo,
      expiresAt,
    });

    console.log('💾 Cached PowerBI token for', key, 'expires in', Math.floor(tokenExpiration / 60000), 'minutes');
  }

  /**
   * Clear cache entry
   */
  clear(workspaceId: string, reportId: string): void {
    const key = this.getCacheKey(workspaceId, reportId);
    this.cache.delete(key);
  }

  /**
   * Clear all cached tokens
   */
  clearAll(): void {
    this.cache.clear();
  }
}

export const powerBITokenCache = new PowerBITokenCache();
