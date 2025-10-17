-- ============================================
-- DATABASE MIGRATION V2
-- Changes:
-- 1. Remove Description column from Reports table
-- 2. Remove Description column from Widgets table  
-- 3. Remove Description column from UserRoles table
-- 4. Add Url column to Widgets table (like Reports.ReportUrl)
-- ============================================

USE DashboardPortal;
GO

PRINT '========================================';
PRINT '=== STARTING DATABASE MIGRATION V2 ===';
PRINT '========================================';

-- ========== 1. REMOVE DESCRIPTION FROM REPORTS ==========
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reports') AND name = 'ReportDescription')
BEGIN
    ALTER TABLE Reports DROP COLUMN ReportDescription;
    PRINT '✓ Removed ReportDescription column from Reports table';
END
ELSE
BEGIN
    PRINT '⚠ ReportDescription column does not exist in Reports table';
END

-- ========== 2. REMOVE DESCRIPTION FROM WIDGETS ==========
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Widgets') AND name = 'WidgetDescription')
BEGIN
    ALTER TABLE Widgets DROP COLUMN WidgetDescription;
    PRINT '✓ Removed WidgetDescription column from Widgets table';
END
ELSE
BEGIN
    PRINT '⚠ WidgetDescription column does not exist in Widgets table';
END

-- ========== 3. REMOVE DESCRIPTION FROM USERROLES ==========
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('UserRoles') AND name = 'Description')
BEGIN
    ALTER TABLE UserRoles DROP COLUMN Description;
    PRINT '✓ Removed Description column from UserRoles table';
END
ELSE
BEGIN
    PRINT '⚠ Description column does not exist in UserRoles table';
END

-- ========== 4. ADD URL COLUMN TO WIDGETS ==========
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Widgets') AND name = 'WidgetUrl')
BEGIN
    ALTER TABLE Widgets ADD WidgetUrl NVARCHAR(500);
    PRINT '✓ Added WidgetUrl column to Widgets table';
    
    -- Update existing widgets with placeholder URLs
    UPDATE Widgets SET WidgetUrl = '/widgets/' + WidgetId;
    PRINT '✓ Updated existing widgets with default URLs';
END
ELSE
BEGIN
    PRINT '⚠ WidgetUrl column already exists in Widgets table';
END

PRINT '';
PRINT '========================================';
PRINT '✅ MIGRATION V2 COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'Changes Applied:';
PRINT '• Reports.ReportDescription - REMOVED';
PRINT '• Widgets.WidgetDescription - REMOVED';
PRINT '• UserRoles.Description - REMOVED';
PRINT '• Widgets.WidgetUrl - ADDED';
PRINT '========================================';
GO

-- ========== VERIFICATION QUERIES ==========
PRINT '';
PRINT 'Verification:';
PRINT '------------';

-- Show Reports table structure
SELECT 'Reports Columns:' AS Info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Reports'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- Show Widgets table structure
SELECT 'Widgets Columns:' AS Info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Widgets'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- Show UserRoles table structure
SELECT 'UserRoles Columns:' AS Info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'UserRoles'
ORDER BY ORDINAL_POSITION;

GO
