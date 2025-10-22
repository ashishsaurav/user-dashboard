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
  pageName: string; // This is actually pageId (e.g., "2b4d7fbedf856b2b08bf")
  visualName: string; // This is actually visualId (e.g., "5be3c870890700486d85")
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

    // Extract pageId from ReportSection{pageId}
    // Example: ReportSection2b4d7fbedf856b2b08bf
    const pagePattern = /ReportSection([a-f0-9]+)/i;
    const pageMatch = url.match(pagePattern);
    
    // Extract visualId from query parameter 'visual'
    const urlObj = new URL(url);
    const visualId = urlObj.searchParams.get('visual');

    if (!pageMatch || !pageMatch[1]) {
      console.warn('PowerBI Visual URL missing pageId (ReportSection):', {
        url,
        pageMatch: pageMatch?.[0]
      });
      return null;
    }

    if (!visualId) {
      console.warn('PowerBI Visual URL missing visualId (visual query param):', {
        url,
        hasVisualParam: urlObj.searchParams.has('visual')
      });
      return null;
    }

    const pageId = pageMatch[1]; // e.g., "2b4d7fbedf856b2b08bf"

    return {
      ...reportConfig,
      pageName: pageId,    // This is the pageId (used as pageName in PowerBI API)
      visualName: visualId, // This is the visualId (used as visualName in PowerBI API)
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
