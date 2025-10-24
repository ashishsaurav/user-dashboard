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

    const setupTokenRefreshTimer = async () => {
      try {
        // Check cache first - before showing loading
        const cachedInstance = powerBIEmbedRegistry.get(embedKey);
        const hasCache = !!cachedInstance;
        
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
        if (cachedInstance) {
          console.log("♻️ Reusing cached PowerBI instance:", embedKey);
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
      // Note: We don't remove from registry on unmount to allow reuse
    };
  }, [workspaceId, reportId, pageName, visualName, type]);

  return {
    loading,
    error,
    containerRef,
    instance: instanceRef.current,
  };
}
