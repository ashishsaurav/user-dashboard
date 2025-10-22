import React, { useEffect, useRef, useState } from 'react';
import * as powerbi from 'powerbi-client';
import { models } from 'powerbi-client';
import { powerBIService } from '../../services/powerBIService';
import './PowerBIEmbed.css';

interface PowerBIEmbedReportProps {
  workspaceId: string;
  reportId: string;
  reportName: string;
}

const PowerBIEmbedReport: React.FC<PowerBIEmbedReportProps> = ({
  workspaceId,
  reportId,
  reportName,
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

    const setupTokenRefreshTimer = async () => {
      try {
        const embedInfo = await powerBIService.getEmbedToken(workspaceId, reportId);
        const refreshBuffer = 5 * 60 * 1000; // 5 minutes
        const tokenExpiration = parseInt(embedInfo.tokenExpiration);
        const timeUntilRefresh = Math.max(0, tokenExpiration - refreshBuffer);

        if (!isMounted) return;

        if (reportRef.current && reportRef.current.setAccessToken) {
          await reportRef.current.setAccessToken(embedInfo.embedToken);
          console.log('PowerBI report token refreshed');
        } else if (reportContainerRef.current) {
          // Initial embed
          const config: powerbi.IReportEmbedConfiguration = {
            type: 'report',
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
                displayOption: models.DisplayOption.FitToPage,
              },
            },
          };

          const report = powerbiService.current.embed(reportContainerRef.current, config);
          reportRef.current = report as powerbi.Report;

          report.on('loaded', () => {
            console.log('PowerBI report loaded');
            setLoading(false);
          });

          report.on('rendered', () => {
            console.log('PowerBI report rendered');
          });

          report.on('error', (event: any) => {
            console.error('PowerBI report error:', event.detail);
            setError(event.detail?.message || 'Error loading report');
            setLoading(false);
          });
        }

        timeoutId = setTimeout(() => {
          console.log('Token expiring soon, refreshing...');
          setupTokenRefreshTimer();
        }, timeUntilRefresh);
      } catch (err: any) {
        console.error('Failed to fetch PowerBI token:', err);
        setError(err.message || 'Failed to load report');
        setLoading(false);
      }
    };

    if (workspaceId && reportId) {
      setupTokenRefreshTimer();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (reportRef.current) {
        try {
          powerbiService.current.reset(reportContainerRef.current!);
        } catch (e) {
          console.error('Error cleaning up PowerBI report:', e);
        }
      }
    };
  }, [workspaceId, reportId]);

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      if (reportContainerRef.current && reportRef.current) {
        const width = reportContainerRef.current.clientWidth;
        const height = reportContainerRef.current.clientHeight;
        // PowerBI handles responsiveness automatically with FitToPage
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (reportContainerRef.current) {
      resizeObserver.observe(reportContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
