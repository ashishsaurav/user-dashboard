/**
 * Global registry to store PowerBI embed instances
 * Persists across component mount/unmount cycles
 * Prevents re-embedding when switching views or dock states
 */

interface EmbedInstance {
  embed: any; // powerbi.Report or powerbi.Visual
  containerElement: HTMLElement;
  iframeElement: HTMLIFrameElement | null; // Direct reference to iframe
  embedKey: string;
  type: "report" | "visual";
  lastUsed: number;
}

class PowerBIEmbedRegistry {
  private embeds = new Map<string, EmbedInstance>();
  private maxCacheSize = 20; // Limit number of cached embeds

  /**
   * Transfer embed instance to new container
   * Optimized for instant transfer without reload
   */
  transfer(embedKey: string, newContainer: HTMLElement): any | null {
    const instance = this.embeds.get(embedKey);
    if (!instance) return null;

    try {
      // Clean up new container completely
      while (newContainer.firstChild) {
        newContainer.firstChild.remove();
      }

      // Try to get iframe from stored reference first
      let currentIframe = instance.iframeElement;
      
      // Verify iframe is still in DOM
      if (currentIframe && !document.body.contains(currentIframe)) {
        console.log("⚠️ Stored iframe no longer in DOM for", embedKey);
        currentIframe = null;
      }
      
      // If no stored iframe or it's gone, try to find it in current container
      if (!currentIframe) {
        currentIframe = instance.containerElement.getElementsByTagName("iframe")[0];
      }
      
      // If still not found, search document for it
      if (!currentIframe) {
        const allIframes = Array.from(document.getElementsByTagName("iframe"));
        // Look for iframe with matching src that contains our reportId
        const reportId = embedKey.split(':')[2]; // Extract reportId from key
        currentIframe = allIframes.find(iframe => 
          iframe.src && iframe.src.includes(reportId)
        ) || null;
        
        if (currentIframe) {
          console.log("🔍 Found orphaned iframe in document for", embedKey);
        }
      }
      
      if (currentIframe) {
        // OPTIMIZED: Move iframe directly instead of recreating
        // This prevents reload and is instant
        newContainer.appendChild(currentIframe);
        
        // Update container and iframe references
        instance.containerElement = newContainer;
        instance.iframeElement = currentIframe;
        instance.lastUsed = Date.now();
        
        // Ensure iframe is visible and properly sized
        currentIframe.style.width = "100%";
        currentIframe.style.height = "100%";
        currentIframe.style.border = "none";
        currentIframe.style.display = "block";
        
        // No need for reactivation - iframe is already live
        console.log("⚡ Instantly transferred PowerBI embed (no reload):", embedKey);
        return instance.embed;
      } else {
        // Fallback: If no iframe exists, mark for complete reload
        const embedContainer = document.createElement("div");
        embedContainer.style.width = "100%";
        embedContainer.style.height = "100%";
        newContainer.appendChild(embedContainer);
        
        instance.containerElement = embedContainer;
        instance.embed._needsReload = true;
        
        console.log("⚠️ No iframe found anywhere, will reload:", embedKey);
        return instance.embed;
      }
    } catch (err) {
      console.warn("⚠️ Transfer error, will force reload:", embedKey, err);
      instance.embed._needsReload = true;
      return instance.embed;
    }
  }

  /**
   * Generate unique key for embed instance
   */
  generateKey(
    type: "report" | "visual",
    params: {
      workspaceId: string;
      reportId: string;
      pageName?: string;
      visualName?: string;
    }
  ): string {
    if (type === "report") {
      return `report:${params.workspaceId}:${params.reportId}:${
        params.pageName || "default"
      }`;
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
      console.log("♻️  Reusing cached PowerBI embed:", embedKey);
      return instance.embed;
    }
    return null;
  }

  /**
   * Store embed instance
   */
  set(
    embedKey: string,
    embed: any,
    containerElement: HTMLElement,
    type: "report" | "visual"
  ): void {
    // Cleanup old embeds if cache is full
    if (this.embeds.size >= this.maxCacheSize) {
      this.cleanupOldest();
    }

    // Get iframe element immediately for storage
    const iframeElement = containerElement.getElementsByTagName("iframe")[0] || null;

    this.embeds.set(embedKey, {
      embed,
      containerElement,
      iframeElement,
      embedKey,
      type,
      lastUsed: Date.now(),
    });
    console.log(
      "💾 Cached PowerBI embed:",
      embedKey,
      `(total: ${this.embeds.size}, iframe: ${iframeElement ? 'found' : 'pending'})`
    );
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
      console.log("🗑️  Removed from registry:", embedKey);
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
      console.log("🧹 Auto-cleanup:", key);
    }
  }

  /**
   * Clear all embeds
   */
  clear(): void {
    this.embeds.clear();
    console.log("🧹 Cleared all PowerBI embeds from registry");
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
