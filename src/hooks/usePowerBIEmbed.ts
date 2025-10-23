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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const instanceRef = useRef<powerbi.Report | powerbi.Visual | null>(null);
  const powerbiService = useRef(
    new powerbi.service.Service(
      powerbi.factories.hpmFactory,
      powerbi.factories.wpmpFactory,
      powerbi.factories.routerFactory
    )
  );

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
        const embedInfo = await powerBIService.getEmbedToken(
          workspaceId,
          reportId
        );
        const refreshBuffer = 5 * 60 * 1000; // 5 minutes
        const tokenExpiration = parseInt(embedInfo.tokenExpiration);
        const timeUntilRefresh = Math.max(0, tokenExpiration - refreshBuffer);

        if (!isMounted) return;

        // Try to reuse existing embed from registry
        const cachedInstance = powerBIEmbedRegistry.get(embedKey);
        if (cachedInstance) {
          try {
            // First try to transfer the instance
            let transferredInstance = null;
            if (containerRef.current) {
              transferredInstance = powerBIEmbedRegistry.transfer(
                embedKey,
                containerRef.current
              );
            }

            if (transferredInstance) {
              try {
                if (transferredInstance._needsReload) {
                  // Full reload with complete config
                  const fullConfig =
                    type === "report"
                      ? {
                          type: "report" as const,
                          id: reportId,
                          embedUrl: embedInfo.embedUrl,
                          accessToken: embedInfo.embedToken,
                          tokenType: models.TokenType.Embed,
                          pageName,
                          settings: {
                            filterPaneEnabled: false,
                            navContentPaneEnabled: false,
                            background: models.BackgroundType.Transparent,
                            layoutType: models.LayoutType.Custom,
                            customLayout: {
                              displayOption: models.DisplayOption.FitToWidth,
                            },
                          },
                        }
                      : {
                          type: "visual" as const,
                          id: reportId,
                          embedUrl: embedInfo.embedUrl,
                          accessToken: embedInfo.embedToken,
                          tokenType: models.TokenType.Embed,
                          pageName: pageName!,
                          visualName: visualName!,
                          settings: {
                            filterPaneEnabled: false,
                            navContentPaneEnabled: false,
                            background: models.BackgroundType.Transparent,
                            layoutType: models.LayoutType.Custom,
                            customLayout: {
                              displayOption: models.DisplayOption.FitToPage,
                            },
                          },
                        };

                  await transferredInstance.reload(fullConfig);
                  console.log("🔄 Full reload of PowerBI instance:", embedKey);
                } else if (transferredInstance._needsReactivate) {
                  // Refresh token and reactivate
                  await transferredInstance.setAccessToken(
                    embedInfo.embedToken
                  );

                  // For reports, ensure correct page is set
                  if (type === "report" && pageName) {
                    try {
                      await (transferredInstance as powerbi.Report).setPage(
                        pageName
                      );
                    } catch (e) {
                      console.warn("Could not set page after reactivation:", e);
                    }
                  }

                  console.log("♻️ Reactivated PowerBI instance:", embedKey);
                } else {
                  // Normal token refresh
                  await transferredInstance.setAccessToken(
                    embedInfo.embedToken
                  );
                  console.log("🔄 Refreshed PowerBI instance token:", embedKey);
                }

                instanceRef.current = transferredInstance;
                setLoading(false);

                // Set up next refresh
                timeoutId = setTimeout(() => {
                  if (isMounted) setupTokenRefreshTimer();
                }, timeUntilRefresh);

                return;
              } catch (tokenErr) {
                console.warn(
                  "⚠️ Token refresh failed, attempting reload:",
                  embedKey
                );
                try {
                  // Try to reload the instance with new token
                  const config =
                    type === "report"
                      ? {
                          type: "report" as const,
                          accessToken: embedInfo.embedToken,
                        }
                      : {
                          type: "visual" as const,
                          accessToken: embedInfo.embedToken,
                          pageName: pageName!,
                          visualName: visualName!,
                        };

                  await transferredInstance.reload(config);
                  console.log(
                    "✅ Successfully reloaded PowerBI instance:",
                    embedKey
                  );

                  instanceRef.current = transferredInstance;
                  setLoading(false);
                  return;
                } catch (reloadErr) {
                  throw reloadErr;
                }
              }
            }
            throw new Error("Transfer or reload failed");
          } catch (err) {
            console.warn(
              "⚠️ Instance reuse failed, will create new:",
              embedKey,
              err
            );
            powerBIEmbedRegistry.remove(embedKey);
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
