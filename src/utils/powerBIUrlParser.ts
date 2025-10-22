/**
 * Parse PowerBI workspace ID and report ID from URL
 * Supports various PowerBI URL formats:
 * - https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}
 * - https://app.powerbi.com/reportEmbed?reportId={reportId}&groupId={workspaceId}
 */
export interface PowerBIReportConfig {
  workspaceId: string;
  reportId: string;
}

/**
 * Parse PowerBI visual configuration from URL
 * Supports format: https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}/ReportSection{pageName}?visual={visualName}
 */
export interface PowerBIVisualConfig extends PowerBIReportConfig {
  pageName: string;
  visualName: string;
}

export function parsePowerBIReportUrl(url: string): PowerBIReportConfig | null {
  try {
    // Pattern 1: /groups/{workspaceId}/reports/{reportId}
    const pattern1 = /\/groups\/([^\/]+)\/reports\/([^\/\?#]+)/;
    const match1 = url.match(pattern1);
    if (match1) {
      return {
        workspaceId: match1[1],
        reportId: match1[2],
      };
    }

    // Pattern 2: reportEmbed?reportId={reportId}&groupId={workspaceId}
    const pattern2 = /reportEmbed.*[?&]reportId=([^&]+).*[?&]groupId=([^&]+)/;
    const match2 = url.match(pattern2);
    if (match2) {
      return {
        reportId: match2[1],
        workspaceId: match2[2],
      };
    }

    // Pattern 3: Check URL params
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
    // First get the base report config
    const reportConfig = parsePowerBIReportUrl(url);
    if (!reportConfig) return null;

    // Pattern: /ReportSection{pageName}?visual={visualName}
    // or: /ReportSection{pageName}#{visualName}
    // Also handle: ReportSection without the slash
    const pagePattern = /ReportSection([^\/\?#&]+)/;
    const pageMatch = url.match(pagePattern);
    
    const urlObj = new URL(url);
    const visualFromParam = urlObj.searchParams.get('visual') || urlObj.searchParams.get('visualName');
    
    // Also check in hash for visual name (format: #visualId or #ReportSection/visualId)
    let visualFromHash = '';
    if (url.includes('#')) {
      const hashPart = url.split('#')[1];
      // Remove any ReportSection prefix from hash
      visualFromHash = hashPart.replace(/^ReportSection[^\/]*\//, '');
    }

    // Extract page name
    let pageName = '';
    if (pageMatch) {
      // Clean up page name - remove 'ReportSection' prefix if present
      pageName = pageMatch[1].replace(/^ReportSection/, '');
    } else {
      // Try to get from URL params
      pageName = urlObj.searchParams.get('pageName') || '';
    }

    // Extract visual name
    const visualName = visualFromParam || visualFromHash || urlObj.searchParams.get('visualId') || '';

    if (!pageName || !visualName) {
      console.warn('PowerBI Visual URL missing pageName or visualName:', {
        url,
        pageName,
        visualName,
        pageMatch: pageMatch?.[0],
        visualFromParam,
        visualFromHash
      });
      return null;
    }

    return {
      ...reportConfig,
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
