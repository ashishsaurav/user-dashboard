/**
 * Global registry to store PowerBI embed instances
 * Persists across component mount/unmount cycles
 * Prevents re-embedding when switching views or dock states
 */

interface EmbedInstance {
  embed: any; // powerbi.Report or powerbi.Visual
  containerElement: HTMLElement;
  embedKey: string;
  type: 'report' | 'visual';
  lastUsed: number;
}

class PowerBIEmbedRegistry {
  private embeds = new Map<string, EmbedInstance>();
  private maxCacheSize = 20; // Limit number of cached embeds

  /**
   * Generate unique key for embed instance
   */
  generateKey(type: 'report' | 'visual', params: {
    workspaceId: string;
    reportId: string;
    pageName?: string;
    visualName?: string;
  }): string {
    if (type === 'report') {
      return `report:${params.workspaceId}:${params.reportId}:${params.pageName || 'default'}`;
    } else {
      return `visual:${params.workspaceId}:${params.reportId}:${params.pageName}:${params.visualName}`;
    }
  }

  /**
   * Get existing embed instance if available
   */
  get(embedKey: string): any | null {
    const instance = this.embeds.get(embedKey);
    if (instance) {
      instance.lastUsed = Date.now();
      console.log('♻️  Reusing cached PowerBI embed:', embedKey);
      return instance.embed;
    }
    return null;
  }

  /**
   * Store embed instance
   */
  set(embedKey: string, embed: any, containerElement: HTMLElement, type: 'report' | 'visual'): void {
    // Cleanup old embeds if cache is full
    if (this.embeds.size >= this.maxCacheSize) {
      this.cleanupOldest();
    }

    this.embeds.set(embedKey, {
      embed,
      containerElement,
      embedKey,
      type,
      lastUsed: Date.now(),
    });
    console.log('💾 Cached PowerBI embed:', embedKey, `(total: ${this.embeds.size})`);
  }

  /**
   * Check if embed exists
   */
  has(embedKey: string): boolean {
    return this.embeds.has(embedKey);
  }

  /**
   * Remove specific embed
   */
  remove(embedKey: string): void {
    const instance = this.embeds.get(embedKey);
    if (instance) {
      // Don't reset - just remove from registry
      // The embed can still be reused if the DOM element exists
      this.embeds.delete(embedKey);
      console.log('🗑️  Removed from registry:', embedKey);
    }
  }

  /**
   * Cleanup oldest unused embeds
   */
  private cleanupOldest(): void {
    const entries = Array.from(this.embeds.entries());
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    // Remove oldest 20%
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.embeds.delete(key);
      console.log('🧹 Auto-cleanup:', key);
    }
  }

  /**
   * Clear all embeds
   */
  clear(): void {
    this.embeds.clear();
    console.log('🧹 Cleared all PowerBI embeds from registry');
  }

  /**
   * Get registry stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.embeds.size,
      keys: Array.from(this.embeds.keys()),
    };
  }
}

// Export singleton instance
export const powerBIEmbedRegistry = new PowerBIEmbedRegistry();
