/**
 * Parse PowerBI workspace ID and report ID from URL
 * 
 * URL Structure:
 * https://app.powerbi.com/groups/{groupId}/reports/{reportId}/{pageId}?visual={visualId}
 * 
 * - groupId = workspaceId (first GUID after /groups/)
 * - reportId = second GUID after /reports/
 * - pageId = third GUID or ReportSection{id} (the page identifier)
 * - visualId = query parameter 'visual' (optional, for visual URLs)
 */
export interface PowerBIReportConfig {
  workspaceId: string;
  reportId: string;
  pageName?: string; // Optional page name for specific page
}

/**
 * Parse PowerBI visual configuration from URL
 * URL: https://app.powerbi.com/groups/{groupId}/reports/{reportId}/{pageId}?visual={visualId}
 */
export interface PowerBIVisualConfig extends PowerBIReportConfig {
  pageName: string; // Page identifier (e.g., "a6b8476e0bcd850d306c" or "ReportSection2b4d7fbedf856b2b08bf")
  visualName: string; // Visual ID from query param: "5be3c870890700486d85"
}

export function parsePowerBIReportUrl(url: string): PowerBIReportConfig | null {
  try {
    // Pattern: /groups/{groupId}/reports/{reportId}/{pageId}
    // Capture all three IDs if present
    const fullPattern = /\/groups\/([a-f0-9-]+)\/reports\/([a-f0-9-]+)(?:\/([a-f0-9]+|ReportSection[a-f0-9]+))?/i;
    const match = url.match(fullPattern);
    
    if (match) {
      const config: PowerBIReportConfig = {
        workspaceId: match[1], // First GUID = groupId = workspaceId
        reportId: match[2],     // Second GUID = reportId
      };
      
      // If page ID is present, include it
      if (match[3]) {
        config.pageName = match[3]; // Third part = pageId (e.g., "a6b8476e0bcd850d306c")
      }
      
      return config;
    }

    // Fallback: reportEmbed?reportId={reportId}&groupId={workspaceId}
    const urlObj = new URL(url);
    const reportId = urlObj.searchParams.get('reportId');
    const workspaceId = urlObj.searchParams.get('groupId') || urlObj.searchParams.get('workspaceId');
    
    if (reportId && workspaceId) {
      return {
        reportId,
        workspaceId,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing PowerBI report URL:', error);
    return null;
  }
}

export function parsePowerBIVisualUrl(url: string): PowerBIVisualConfig | null {
  try {
    // First get the base report config (includes pageName if present)
    const reportConfig = parsePowerBIReportUrl(url);
    if (!reportConfig) {
      console.warn('Could not extract workspaceId/reportId from URL:', url);
      return null;
    }

    // Extract visualId from query parameter 'visual' (optional)
    const urlObj = new URL(url);
    const visualId = urlObj.searchParams.get('visual');

    // If no pageName in reportConfig, this is an incomplete URL
    if (!reportConfig.pageName) {
      console.warn('PowerBI URL missing page identifier:', url);
      return null;
    }

    const pageName = reportConfig.pageName; // e.g., "a6b8476e0bcd850d306c" or "ReportSection2b4d7fbedf856b2b08bf"
    const visualName = visualId || ''; // Visual ID from query param, empty if none

    console.log('✅ Parsed PowerBI URL:', {
      workspaceId: reportConfig.workspaceId,
      reportId: reportConfig.reportId,
      pageName,
      visualName: visualName || '(none - full report page)',
      isVisual: !!visualName
    });

    return {
      workspaceId: reportConfig.workspaceId,
      reportId: reportConfig.reportId,
      pageName,
      visualName,
    };
  } catch (error) {
    console.error('Error parsing PowerBI visual URL:', error);
    return null;
  }
}

/**
 * Check if URL is a PowerBI report URL
 */
export function isPowerBIReportUrl(url: string): boolean {
  return parsePowerBIReportUrl(url) !== null;
}

/**
 * Check if URL is a PowerBI visual URL
 */
export function isPowerBIVisualUrl(url: string): boolean {
  return parsePowerBIVisualUrl(url) !== null;
}
