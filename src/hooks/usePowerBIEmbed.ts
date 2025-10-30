import { useEffect, useRef, useState } from "react";
import * as powerbi from "powerbi-client";
import { models } from "powerbi-client";
import { powerBIService } from "../services/powerBIService";
import { powerBIEmbedRegistry } from "../services/powerBIEmbedRegistry";

interface UsePowerBIEmbedProps {
  workspaceId: string;
  reportId: string;
  pageName?: string;
  visualName?: string;
  type: "report" | "visual";
}

interface UsePowerBIEmbedResult {
  loading: boolean;
  error: string;
  containerRef: React.RefObject<HTMLDivElement>;
  instance: powerbi.Report | powerbi.Visual | null;
}

export function usePowerBIEmbed({
  workspaceId,
  reportId,
  pageName,
  visualName,
  type,
}: UsePowerBIEmbedProps): UsePowerBIEmbedResult {
  const containerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  
  // Generate embed key
  const embedKey = powerBIEmbedRegistry.generateKey(type, {
    workspaceId,
    reportId,
    pageName,
    visualName,
  });
  
  // Use lazy initializer to check cache only on first render
  const [loading, setLoading] = useState(() => {
    const hasCache = powerBIEmbedRegistry.has(embedKey);
    return !hasCache; // Don't show loading if cached
  });
  
  const [error, setError] = useState("");
  const instanceRef = useRef<powerbi.Report | powerbi.Visual | null>(null);
  const powerbiService = useRef(
    new powerbi.service.Service(
      powerbi.factories.hpmFactory,
      powerbi.factories.wpmpFactory,
      powerbi.factories.routerFactory
    )
  );
  
  // Set cached instance immediately if available
  if (!instanceRef.current) {
    const cached = powerBIEmbedRegistry.get(embedKey);
    if (cached) {
      instanceRef.current = cached;
    }
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const embedKey = powerBIEmbedRegistry.generateKey(type, {
      workspaceId,
      reportId,
      pageName,
      visualName,
    });
    
    console.log("🟢 usePowerBIEmbed EFFECT RUNNING for:", embedKey);
    console.log("  Container ref exists:", !!containerRef.current);
    console.log("  Instance already exists:", !!instanceRef.current);

    const setupTokenRefreshTimer = async () => {
      try {
        // CRITICAL OPTIMIZATION: Check if iframe is already in container
        // If it is, skip the entire setup - this prevents re-embeds during layout changes
        if (containerRef.current && instanceRef.current) {
          const existingIframe = containerRef.current.querySelector('iframe');
          const expectedKey = existingIframe?.getAttribute('data-embed-key');

          if (existingIframe && expectedKey === embedKey) {
            console.log("⚡ FAST PATH: iframe already in container, skipping setup!", embedKey);
            setLoading(false);
            return;
          }
        }

        // Check cache first - before showing loading
        const cachedInstance = powerBIEmbedRegistry.get(embedKey);
        const hasCache = !!cachedInstance;

        console.log(`🔍 Cache check for ${embedKey}:`, hasCache ? 'FOUND' : 'NOT FOUND');

        // Only show loading if we don't have a cached instance
        if (!hasCache) {
          setLoading(true);
        }

        const embedInfo = await powerBIService.getEmbedToken(
          workspaceId,
          reportId
        );
        const refreshBuffer = 5 * 60 * 1000; // 5 minutes
        const tokenExpiration = parseInt(embedInfo.tokenExpiration);
        const timeUntilRefresh = Math.max(0, tokenExpiration - refreshBuffer);

        if (!isMounted) return;

        // Try to reuse existing embed from registry
        if (cachedInstance && containerRef.current) {
          console.log("♻️ Reusing cached PowerBI instance:", embedKey);

          // Check if iframe already exists in this container
          const existingIframe = containerRef.current.querySelector('iframe');

          if (existingIframe) {
            console.log("✅ iframe already in container, no transfer needed!");
            instanceRef.current = cachedInstance;
            
            // Update token silently
            try {
              await cachedInstance.setAccessToken(embedInfo.embedToken);
            } catch (e) {
              console.debug("Token update not needed or failed:", e);
            }
            
            setLoading(false);
            
            // Set up next refresh
            timeoutId = setTimeout(() => {
              if (isMounted) setupTokenRefreshTimer();
            }, timeUntilRefresh);
            
            return;
          }
          
          // iframe not in container, try to transfer it
          console.log("📦 iframe not in container, attempting transfer...");
          const transferredInstance = powerBIEmbedRegistry.transfer(embedKey, containerRef.current);
          
          if (transferredInstance) {
            console.log("✅ Successfully transferred iframe, no reload needed!");
            instanceRef.current = transferredInstance;
            
            // Update token silently
            try {
              await transferredInstance.setAccessToken(embedInfo.embedToken);
            } catch (e) {
              console.debug("Token update not needed or failed:", e);
            }
            
            setLoading(false);
            
            // Set up next refresh
            timeoutId = setTimeout(() => {
              if (isMounted) setupTokenRefreshTimer();
            }, timeUntilRefresh);
            
            return;
          } else {
            console.warn("⚠️ Transfer failed, will create new embed");
            // Remove from cache and create fresh
            powerBIEmbedRegistry.remove(embedKey);
            // Let it fall through to create new instance
          }
        }

        // Create new embed if needed
        if (containerRef.current) {
          const baseConfig = {
            id: reportId,
            embedUrl: embedInfo.embedUrl,
            accessToken: embedInfo.embedToken,
            tokenType: models.TokenType.Embed,
            settings: {
              filterPaneEnabled: false,
              navContentPaneEnabled: false,
              background: models.BackgroundType.Transparent,
              layoutType: models.LayoutType.Custom,
              customLayout: {
                displayOption:
                  type === "report"
                    ? models.DisplayOption.FitToWidth
                    : models.DisplayOption.FitToPage,
              },
            },
          };

          const config =
            type === "report"
              ? ({
                  ...baseConfig,
                  type: "report" as const,
                  pageName,
                } as powerbi.IReportEmbedConfiguration)
              : ({
                  ...baseConfig,
                  type: "visual" as const,
                  pageName: pageName!,
                  visualName: visualName!,
                } as powerbi.IVisualEmbedConfiguration);

          const instance = powerbiService.current.embed(
            containerRef.current,
            config
          );

          instanceRef.current =
            type === "report"
              ? (instance as powerbi.Report)
              : (instance as powerbi.Visual);

          // Store in registry for reuse
          powerBIEmbedRegistry.set(
            embedKey,
            instance,
            containerRef.current,
            type
          );

          instance.on("loaded", () => {
            console.log("✅ PowerBI instance loaded:", embedKey);
            if (isMounted) setLoading(false);
          });

          instance.on("rendered", () => {
            console.log("✅ PowerBI instance rendered:", embedKey);
          });

          instance.on("error", (event: any) => {
            console.error("❌ PowerBI instance error:", event.detail);
            if (isMounted) {
              setError(
                event.detail?.message || "Error loading PowerBI content"
              );
              setLoading(false);
            }
          });

          // Set up next refresh
          timeoutId = setTimeout(() => {
            if (isMounted) setupTokenRefreshTimer();
          }, timeUntilRefresh);
        }
      } catch (err: any) {
        if (!isMounted) return;

        const errorMessage = err?.message || "Failed to load PowerBI content";
        console.error("❌ PowerBI embed failed:", {
          embedKey,
          error: err,
          errorMessage,
        });

        setError(errorMessage);
        setLoading(false);
      }
    };

    if (workspaceId && reportId) {
      setupTokenRefreshTimer();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.log("🧹 Cleaning up PowerBI embed:", embedKey);
      
      // CRITICAL: Detach iframe instead of destroying it
      // This preserves the iframe for reuse when component remounts
      powerBIEmbedRegistry.detach(embedKey);
    };
  }, [workspaceId, reportId, pageName, visualName, type]);

  return {
    loading,
    error,
    containerRef,
    instance: instanceRef.current,
  };
}
