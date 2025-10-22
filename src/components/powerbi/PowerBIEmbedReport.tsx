import React, { useEffect, useRef, useState } from 'react';
import * as powerbi from 'powerbi-client';
import { models } from 'powerbi-client';
import { powerBIService } from '../../services/powerBIService';
import { powerBIEmbedRegistry } from '../../services/powerBIEmbedRegistry';
import './PowerBIEmbed.css';

interface PowerBIEmbedReportProps {
  workspaceId: string;
  reportId: string;
  reportName: string;
  pageName?: string; // Optional specific page to show
}

const PowerBIEmbedReport: React.FC<PowerBIEmbedReportProps> = ({
  workspaceId,
  reportId,
  reportName,
  pageName,
}) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const reportRef = useRef<powerbi.Report | null>(null);
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
    const embedKey = powerBIEmbedRegistry.generateKey('report', {
      workspaceId,
      reportId,
      pageName,
    });

    const setupTokenRefreshTimer = async () => {
      try {
        const embedInfo = await powerBIService.getEmbedToken(workspaceId, reportId);
        const refreshBuffer = 5 * 60 * 1000; // 5 minutes
        const tokenExpiration = parseInt(embedInfo.tokenExpiration);
        const timeUntilRefresh = Math.max(0, tokenExpiration - refreshBuffer);

        if (!isMounted) return;

        // Check if already embedded in global registry
        const cachedReport = powerBIEmbedRegistry.get(embedKey);
        if (cachedReport && cachedReport.setAccessToken) {
          // Reuse cached embed
          reportRef.current = cachedReport;
          await reportRef.current.setAccessToken(embedInfo.embedToken);
          console.log('♻️  Reused cached report, refreshed token:', embedKey);
          setLoading(false);
        } else if (reportRef.current && reportRef.current.setAccessToken) {
          // Report already embedded in this instance, just refresh token
          await reportRef.current.setAccessToken(embedInfo.embedToken);
          console.log('🔄 PowerBI report token refreshed for', embedKey);
        } else if (reportContainerRef.current) {
          // Initial embed - only happens once per unique report+page combination
          console.log('🎯 Embedding PowerBI report (first time):', embedKey);
          
          const config: powerbi.IReportEmbedConfiguration = {
            type: 'report',
            id: reportId,
            embedUrl: embedInfo.embedUrl,
            accessToken: embedInfo.embedToken,
            tokenType: models.TokenType.Embed,
            pageName: pageName, // Specific page if provided
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

          const report = powerbiService.current.embed(reportContainerRef.current, config);
          reportRef.current = report as powerbi.Report;

          // Store in global registry
          powerBIEmbedRegistry.set(embedKey, report, reportContainerRef.current, 'report');

          report.on('loaded', async () => {
            console.log('✅ PowerBI report loaded:', embedKey);
            
            // If specific page provided, set it as active
            if (pageName && reportRef.current) {
              try {
                await reportRef.current.setPage(pageName);
                console.log('📄 Set active page to:', pageName);
              } catch (e) {
                console.warn('Could not set page:', e);
              }
            }
            
            setLoading(false);
          });

          report.on('rendered', () => {
            console.log('✅ PowerBI report rendered:', embedKey);
          });

          report.on('error', (event: any) => {
            console.error('❌ PowerBI report error:', event.detail);
            setError(event.detail?.message || 'Error loading report');
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
        
        const errorMessage = err?.message || err?.toString() || 'Failed to load report';
        console.error('Failed to fetch PowerBI token:', errorMessage, err);
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
      console.log('🧹 Cleaning up PowerBIEmbedReport:', embedKey);
      // Keep embed in registry for reuse
    };
  }, [workspaceId, reportId, pageName]);

  // Handle responsive resize with debouncing
  useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      let timer: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
      };
    };

    const handleResize = async () => {
      if (reportContainerRef.current && reportRef.current) {
        const width = reportContainerRef.current.clientWidth;
        const height = reportContainerRef.current.clientHeight;
        
        try {
          // Resize the active page
          if (pageName) {
            await reportRef.current.resizePage(models.PageSizeType.Custom, width, height);
          } else {
            await reportRef.current.resizeActivePage(models.PageSizeType.Custom, width, height);
          }
          console.log('📐 Resized PowerBI report to', width, 'x', height);
        } catch (e) {
          // Resize may fail if report not fully loaded yet
          console.debug('Resize not ready yet:', e);
        }
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    const resizeObserver = new ResizeObserver(debouncedResize);
    
    if (reportContainerRef.current) {
      resizeObserver.observe(reportContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [pageName]);

  if (error) {
    return (
      <div className="powerbi-error">
        <div className="error-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>Failed to Load Report</h3>
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
          <p>Loading {reportName}...</p>
        </div>
      )}
      <div ref={reportContainerRef} className="powerbi-report" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PowerBIEmbedReport;
