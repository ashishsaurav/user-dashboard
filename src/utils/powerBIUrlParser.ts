/**
 * Parse PowerBI workspace ID and report ID from URL
 * 
 * URL Structure:
 * https://app.powerbi.com/groups/{groupId}/reports/{reportId}/ReportSection{pageId}?visual={visualId}
 * 
 * - groupId = workspaceId (first GUID after /groups/)
 * - reportId = second GUID after /reports/
 * - pageId = ReportSection{id} (the page identifier)
 * - visualId = query parameter 'visual' (if present, it's a visual URL)
 */
export interface PowerBIReportConfig {
  workspaceId: string;
  reportId: string;
}

/**
 * Parse PowerBI visual configuration from URL
 * URL: https://app.powerbi.com/groups/{groupId}/reports/{reportId}/ReportSection{pageId}?visual={visualId}
 */
export interface PowerBIVisualConfig extends PowerBIReportConfig {
  pageName: string; // Full page name: "ReportSection2b4d7fbedf856b2b08bf"
  visualName: string; // Visual ID from query param: "5be3c870890700486d85" (optional, empty for reports)
}

export function parsePowerBIReportUrl(url: string): PowerBIReportConfig | null {
  try {
    // Pattern: /groups/{groupId}/reports/{reportId}
    // groupId is the workspaceId
    const pattern = /\/groups\/([a-f0-9-]+)\/reports\/([a-f0-9-]+)/i;
    const match = url.match(pattern);
    
    if (match) {
      return {
        workspaceId: match[1], // First GUID = groupId = workspaceId
        reportId: match[2],     // Second GUID = reportId
      };
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
    // First get the base report config (workspaceId and reportId)
    const reportConfig = parsePowerBIReportUrl(url);
    if (!reportConfig) {
      console.warn('Could not extract workspaceId/reportId from URL:', url);
      return null;
    }

    // Extract full pageName including "ReportSection" prefix
    // Example: ReportSection2b4d7fbedf856b2b08bf
    const pagePattern = /(ReportSection[a-f0-9]+)/i;
    const pageMatch = url.match(pagePattern);
    
    // Extract visualId from query parameter 'visual' (optional)
    const urlObj = new URL(url);
    const visualId = urlObj.searchParams.get('visual');

    if (!pageMatch || !pageMatch[1]) {
      console.warn('PowerBI URL missing pageName (ReportSection):', {
        url,
        pageMatch: pageMatch?.[0]
      });
      return null;
    }

    const pageName = pageMatch[1]; // e.g., "ReportSection2b4d7fbedf856b2b08bf" (full string)
    const visualName = visualId || ''; // Empty string if no visual param (for report URL)

    console.log('✅ Parsed PowerBI URL:', {
      workspaceId: reportConfig.workspaceId,
      reportId: reportConfig.reportId,
      pageName,
      visualName: visualName || '(none - report URL)'
    });

    return {
      ...reportConfig,
      pageName,    // Full "ReportSection{id}" string
      visualName,  // Visual ID from query param, or empty
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
