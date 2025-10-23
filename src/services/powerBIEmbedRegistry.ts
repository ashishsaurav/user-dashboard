/**
 * Global registry to store PowerBI embed instances
 * Persists across component mount/unmount cycles
 * Prevents re-embedding when switching views or dock states
 */

interface EmbedInstance {
  embed: any; // powerbi.Report or powerbi.Visual
  containerElement: HTMLElement;
  embedKey: string;
  type: "report" | "visual";
  lastUsed: number;
}

class PowerBIEmbedRegistry {
  private embeds = new Map<string, EmbedInstance>();
  private maxCacheSize = 20; // Limit number of cached embeds

  /**
   * Transfer embed instance to new container
   */
  transfer(embedKey: string, newContainer: HTMLElement): any | null {
    const instance = this.embeds.get(embedKey);
    if (!instance) return null;

    try {
      // Clean up new container completely
      while (newContainer.firstChild) {
        newContainer.firstChild.remove();
      }

      // Create a fresh container for the PowerBI embed
      const embedContainer = document.createElement("div");
      embedContainer.style.width = "100%";
      embedContainer.style.height = "100%";
      newContainer.appendChild(embedContainer);

      // Get the existing iframe's src and other attributes
      const currentIframe =
        instance.containerElement.getElementsByTagName("iframe")[0];
      if (currentIframe) {
        const srcUrl = currentIframe.src;

        // Create a new iframe with same attributes
        const newIframe = document.createElement("iframe");
        newIframe.style.width = "100%";
        newIframe.style.height = "100%";
        newIframe.style.border = "none";
        Array.from(currentIframe.attributes).forEach((attr) => {
          if (attr.name !== "src") {
            newIframe.setAttribute(attr.name, attr.value);
          }
        });

        embedContainer.appendChild(newIframe);

        // Set src last to trigger load
        newIframe.src = srcUrl;

        // Mark instance for reactivation
        instance.embed._needsReactivate = true;
      } else {
        // If no iframe exists, mark for complete reload
        instance.embed._needsReload = true;
      }

      instance.containerElement = embedContainer;
      instance.lastUsed = Date.now();

      console.log("🔄 Transferred PowerBI embed with new iframe:", embedKey);
      return instance.embed;
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

    this.embeds.set(embedKey, {
      embed,
      containerElement,
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
