/**
 * Global registry to store PowerBI embed instances
 * Persists across component mount/unmount cycles
 * Prevents re-embedding when switching views or dock states
 */

interface EmbedInstance {
  embed: any; // powerbi.Report or powerbi.Visual
  containerElement: HTMLElement | null; // Can be null when detached
  iframe: HTMLIFrameElement | null; // Store the actual iframe
  embedKey: string;
  type: "report" | "visual";
  lastUsed: number;
}

class PowerBIEmbedRegistry {
  private embeds = new Map<string, EmbedInstance>();
  private maxCacheSize = 20; // Limit number of cached embeds
  private hiddenContainer: HTMLDivElement | null = null; // Container for detached iframes

  constructor() {
    // Create hidden container for detached iframes
    this.hiddenContainer = document.createElement("div");
    this.hiddenContainer.id = "powerbi-detached-container";
    this.hiddenContainer.style.position = "absolute";
    this.hiddenContainer.style.left = "-9999px";
    this.hiddenContainer.style.top = "-9999px";
    this.hiddenContainer.style.width = "1px";
    this.hiddenContainer.style.height = "1px";
    this.hiddenContainer.style.overflow = "hidden";
    this.hiddenContainer.style.pointerEvents = "none";
    document.body.appendChild(this.hiddenContainer);
  }

  /**
   * Transfer embed instance to new container
   * This physically moves the iframe to prevent reload
   */
  transfer(embedKey: string, newContainer: HTMLElement): any | null {
    const instance = this.embeds.get(embedKey);
    if (!instance) return null;

    // Find the iframe in the cached instance
    let iframe = instance.iframe;
    
    // If iframe not cached, try to find it in the old container
    if (!iframe && instance.containerElement) {
      iframe = instance.containerElement.querySelector("iframe") as HTMLIFrameElement;
    }

    // If still no iframe, check the hidden container
    if (!iframe && this.hiddenContainer) {
      const allIframes = this.hiddenContainer.querySelectorAll("iframe");
      for (let i = 0; i < allIframes.length; i++) {
        const potentialIframe = allIframes[i] as HTMLIFrameElement;
        // Check if this iframe belongs to this embed by checking data attribute
        if (potentialIframe.getAttribute("data-embed-key") === embedKey) {
          iframe = potentialIframe;
          break;
        }
      }
    }

    if (iframe) {
      // Mark iframe with embed key for future identification
      iframe.setAttribute("data-embed-key", embedKey);
      
      // Clear the new container first
      newContainer.innerHTML = "";
      
      // Move iframe to new container (this doesn't cause reload!)
      newContainer.appendChild(iframe);
      
      // Update instance references
      instance.containerElement = newContainer;
      instance.iframe = iframe;
      instance.lastUsed = Date.now();
      
      console.log("✅ Transferred iframe to new container:", embedKey);
      return instance.embed;
    } else {
      console.warn("⚠️ No iframe found for transfer:", embedKey);
      return instance.embed;
    }
  }

  /**
   * Detach iframe from DOM but keep it in memory
   * Called when component unmounts
   */
  detach(embedKey: string): void {
    const instance = this.embeds.get(embedKey);
    if (!instance) return;

    // Find the iframe
    let iframe = instance.iframe;
    if (!iframe && instance.containerElement) {
      iframe = instance.containerElement.querySelector("iframe") as HTMLIFrameElement;
    }

    if (iframe && this.hiddenContainer) {
      // Mark iframe with embed key for future identification
      iframe.setAttribute("data-embed-key", embedKey);
      
      // Move iframe to hidden container to preserve it
      this.hiddenContainer.appendChild(iframe);
      
      // Update instance
      instance.iframe = iframe;
      instance.containerElement = null;
      
      console.log("💾 Detached iframe to hidden container:", embedKey);
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
   * Get the iframe element for an embed
   */
  getIframe(embedKey: string): HTMLIFrameElement | null {
    const instance = this.embeds.get(embedKey);
    return instance?.iframe || null;
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

    // Find the iframe that was just created
    const iframe = containerElement.querySelector("iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.setAttribute("data-embed-key", embedKey);
    }

    this.embeds.set(embedKey, {
      embed,
      containerElement,
      iframe,
      embedKey,
      type,
      lastUsed: Date.now(),
    });
    console.log(
      "💾 Cached PowerBI embed:",
      embedKey,
      `(total: ${this.embeds.size})`
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
      // Before removing, detach the iframe to preserve it
      this.detach(embedKey);
      
      // Now remove from registry
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
      const [key, instance] = entries[i];
      
      // Destroy the iframe when truly removing from cache
      if (instance.iframe) {
        instance.iframe.remove();
      }
      
      this.embeds.delete(key);
      console.log("🧹 Auto-cleanup and destroyed iframe:", key);
    }
  }

  /**
   * Clear all embeds
   */
  clear(): void {
    // Destroy all iframes before clearing
    this.embeds.forEach((instance, key) => {
      if (instance.iframe) {
        instance.iframe.remove();
      }
    });
    
    this.embeds.clear();
    
    // Clear hidden container
    if (this.hiddenContainer) {
      this.hiddenContainer.innerHTML = "";
    }
    
    console.log("🧹 Cleared all PowerBI embeds from registry and destroyed iframes");
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
