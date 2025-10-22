import React, { useEffect, useRef, useState } from 'react';
import * as powerbi from 'powerbi-client';
import { models } from 'powerbi-client';
import { powerBIService } from '../../services/powerBIService';
import { powerBIEmbedRegistry } from '../../services/powerBIEmbedRegistry';
import './PowerBIEmbed.css';

interface PowerBIEmbedVisualProps {
  workspaceId: string;
  reportId: string;
  pageName: string;
  visualName: string;
  widgetName: string;
}

const PowerBIEmbedVisual: React.FC<PowerBIEmbedVisualProps> = ({
  workspaceId,
  reportId,
  pageName,
  visualName,
  widgetName,
}) => {
  const visualContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const visualRef = useRef<any>(null);
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
    const embedKey = powerBIEmbedRegistry.generateKey('visual', {
      workspaceId,
      reportId,
      pageName,
      visualName,
    });

    const setupTokenRefreshTimer = async () => {
      try {
        if (!isMounted) {
          console.log('⏹️  Component unmounted, skipping token fetch:', embedKey);
          return;
        }

        const embedInfo = await powerBIService.getEmbedToken(workspaceId, reportId);
        
        if (!isMounted) {
          console.log('⏹️  Component unmounted during fetch, aborting:', embedKey);
          return;
        }

        const refreshBuffer = 5 * 60 * 1000; // 5 minutes
        const tokenExpiration = parseInt(embedInfo.tokenExpiration);
        const timeUntilRefresh = Math.max(0, tokenExpiration - refreshBuffer);

        // Check if already embedded in global registry
        const cachedVisual = powerBIEmbedRegistry.get(embedKey);
        if (cachedVisual && cachedVisual.setAccessToken) {
          // Reuse cached embed
          visualRef.current = cachedVisual;
          await visualRef.current.setAccessToken(embedInfo.embedToken);
          console.log('♻️  Reused cached visual, refreshed token:', embedKey);
          setLoading(false);
        } else if (visualRef.current && visualRef.current.setAccessToken) {
          // Visual already embedded in this instance, just refresh token
          await visualRef.current.setAccessToken(embedInfo.embedToken);
          console.log('🔄 PowerBI visual token refreshed for', embedKey);
        } else if (visualContainerRef.current) {
          // Initial embed - only happens once per unique visual
          console.log('🎯 Embedding PowerBI visual (first time):', embedKey);
          
          const config: powerbi.IVisualEmbedConfiguration = {
            type: 'visual',
            id: reportId,
            embedUrl: embedInfo.embedUrl,
            accessToken: embedInfo.embedToken,
            tokenType: models.TokenType.Embed,
            pageName: pageName,
            visualName: visualName,
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

          const visual = powerbiService.current.embed(visualContainerRef.current, config);
          visualRef.current = visual;

          // Store in global registry
          powerBIEmbedRegistry.set(embedKey, visual, visualContainerRef.current, 'visual');

          visual.on('loaded', () => {
            console.log('✅ PowerBI visual loaded:', embedKey);
            setLoading(false);
          });

          visual.on('rendered', () => {
            console.log('✅ PowerBI visual rendered:', embedKey);
          });

          visual.on('error', (event: any) => {
            console.error('❌ PowerBI visual error:', event.detail);
            const errorMsg = event.detail?.message || 'Error loading visual';
            
            // Better error messages
            if (errorMsg.includes('PowerBIEntityNotFound')) {
              setError(`Visual not found. Please verify page name "${pageName}" and visual name "${visualName}" are correct.`);
            } else {
              setError(errorMsg);
            }
            setLoading(false);
          });
        }

        if (isMounted) {
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log('⏰ Token expiring soon, refreshing...', embedKey);
              setupTokenRefreshTimer();
            }
          }, timeUntilRefresh);
        }
      } catch (err: any) {
        if (!isMounted) {
          console.log('⏹️  Component unmounted, ignoring error:', embedKey);
          return;
        }
        
        const errorMessage = err?.message || err?.toString() || 'Failed to load visual';
        console.error('Failed to fetch PowerBI token:', errorMessage, err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (workspaceId && reportId && pageName && visualName) {
      setupTokenRefreshTimer();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.log('🧹 Cleaning up PowerBIEmbedVisual:', embedKey);
      // Keep embed in registry for reuse
    };
  }, [workspaceId, reportId, pageName, visualName]);

  // Handle responsive resize
  useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      let timer: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
      };
    };

    const handleResize = () => {
      if (visualContainerRef.current && visualRef.current?.powerBiEmbed) {
        const width = visualContainerRef.current.clientWidth;
        const height = visualContainerRef.current.clientHeight;
        
        visualRef.current.powerBiEmbed.resizeVisual(pageName, visualName, width, height);
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    const resizeObserver = new ResizeObserver(debouncedResize);
    
    if (visualContainerRef.current) {
      resizeObserver.observe(visualContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [pageName, visualName]);

  if (error) {
    return (
      <div className="powerbi-error">
        <div className="error-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>Failed to Load Visual</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="powerbi-embed-container">
      {loading && (
        <div className="powerbi-loading">
          <div className="loading-spinner"></div>
          <p>Loading {widgetName}...</p>
        </div>
      )}
      <div ref={visualContainerRef} className="powerbi-visual" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PowerBIEmbedVisual;
