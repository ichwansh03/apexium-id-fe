public class ReportToSOQLConverter {

    @TestVisible private static Reports.ReportMetadata testMetadata;

    public static String getSOQLFromReport(Id reportId) {
        Reports.ReportMetadata rm = Test.isRunningTest() 
            ? testMetadata 
            : Reports.ReportManager.describeReport(reportId).getReportMetadata();

        // Count object name occurrences from prefixed columns to determine root object
        Map<String, Integer> objectCount = new Map<String, Integer>();
        for (String col : rm.getDetailColumns()) {
            if (col.contains('.') && !col.startsWith('BucketField_')) {
                String objectName = col.substringBefore('.');
                objectCount.put(objectName, (objectCount.containsKey(objectName) ? objectCount.get(objectName) : 0) + 1);
            }
        }

        // Pick the most frequently occurring object name as root object
        String rootObject = '';
        Integer maxCount = 0;
        for (String objName : objectCount.keySet()) {
            if (objectCount.get(objName) > maxCount) {
                maxCount = objectCount.get(objName);
                rootObject = objName;
            }
        }

        // Process columns: skip bucket fields, strip only root object prefix
        List<String> columns = new List<String>();
        for (String col : rm.getDetailColumns()) {
            if (col.startsWith('BucketField_')) {
                continue;
            }
            // Only strip root object prefix, preserve relationship traversals
            // e.g. Case.Entity__c → Entity__c, Case.CreatedBy.CommunityNickname → CreatedBy.CommunityNickname
            String cleanCol = col.startsWith(rootObject + '.')
                ? col.substringAfter(rootObject + '.')
                : col;
            columns.add(cleanCol);
        }

        String selectClause = 'SELECT ' + String.join(columns, ', ');
        String fromClause = ' FROM ' + rootObject;

        List<String> filterStrings = new List<String>();
        for (Reports.ReportFilter rf : rm.getReportFilters()) {
            // Strip only root object prefix from filter column
            // e.g. Case.CreatedBy.Name → CreatedBy.Name, Case.Entity__c → Entity__c
            String filterCol = rf.getColumn().startsWith(rootObject + '.')
                ? rf.getColumn().substringAfter(rootObject + '.')
                : rf.getColumn();

            String rawValue = rf.getValue();
            Boolean isMultiValue = rawValue != null && rawValue.split(',').size() > 1;

            String filterOperator = isMultiValue ? '' : convertOperator(rf.getOperator());
            String filterValue = formatFilterValue(rawValue);

            filterStrings.add(filterCol + ' ' + filterOperator + ' ' + filterValue);
        }

        String whereClause = filterStrings.isEmpty() ? '' : ' WHERE ' + String.join(filterStrings, ' AND ');
        return selectClause + fromClause + whereClause;
    }

    @TestVisible
    private static String formatFilterValue(String value) {
        if (value == null) return '\'\'';

        List<String> parts = value.split(',');
        if (parts.size() == 1) {
            return '\'' + value.trim() + '\'';
        }

        system.debug('value: '+value);
        system.debug('parts: '+parts);
        List<String> quoted = new List<String>();
        for (String part : parts) {
            quoted.add('\'' + part.trim() + '\'');
        }
        return 'IN (' + String.join(quoted, ', ') + ')';
    }

    @TestVisible
    private static String convertOperator(String reportOp) {
        Map<String, String> opMap = new Map<String, String>{
            'equals'      => '=',
            'notEqual'    => '!=',
            'lessThan'    => '<',
            'greaterThan' => '>',
            'contains'    => 'LIKE'
        };
        return opMap.containsKey(reportOp) ? opMap.get(reportOp) : '=';
    }
}