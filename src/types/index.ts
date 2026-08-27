export interface MetadataDiffDto {
  previousBody: string;
  latestBody: string;
}

export interface UserSummaryDto {
  Name?: string;
}

/**
 * Represents the database 'Log' entity.
 * Fields are lowercase to match the Kotlin domain object serialized by default.
 */
export interface Log {
  sfdcId: string;
  apexClassName?: string;
  authorName?: string;
  requestTime?: string;
  operation?: string;
  logSize?: number;
  duration?: number;
  status?: string;
  request?: string;
}

/**
 * Represents the Salesforce Tooling API 'ApexLog' DTO.
 * Fields are Uppercase as defined by @JsonProperty in the backend.
 */
export interface ApexLogDto {
  Id: string;
  LogUser?: UserSummaryDto;
  Operation?: string;
  StartTime?: string;
  Status?: string;
  Request?: string;
  LogLength?: number;
  DurationMilliseconds?: number;
  apexClassName?: string; 
}

export interface ApexClassDto {
  Id: string;
  Name?: string;
  ApiVersion?: number;
  Status?: string;
  LastModifiedDate?: string;
  LastModifiedBy?: UserSummaryDto;
}

export interface User {
  sfdcId: string;
  name: string;
  username: string;
  email: string;
  profileName: string;
  isActive?: boolean;
}

export interface ApexClass {
  sfdcId: string;
  name: string;
  apiVersion: string;
  status: string;
  lastModifiedDate: string;
  numLinesCovered?: number;
  numLinesUncovered?: number;
}

export interface ApexTrigger {
  sfdcId: string;
  name: string;
  sobject: string;
  status: string;
  lastModifiedDate: string;
  numLinesCovered?: number;
  numLinesUncovered?: number;
}

export interface DebugLevel {
  sfdcId: string;
  developerName: string;
  masterLabel: string;
  apexCode: string;
  apexProfiling: string;
  callout: string;
  database: string;
  system: string;
  validation: string;
  visualforce: string;
  workflow: string;
}

export interface ApexCodeCoverageDto {
  apexClassOrTriggerId: string;
  numLinesCovered: number;
  numLinesUncovered: number;
}

export interface MetadataDetailDto {
  id: string;
  name: string;
  type: string;
  apiVersion: number | null;
  status: string | null;
  lastModifiedDate: string | null;
  lastModifiedByName: string | null;
  targetObject?: string | null;
  triggerEvents: string[];
  testClasses: ApexClassDto[];
  coverage?: ApexCodeCoverageDto | null;
}

/**
 * Represents the Salesforce Tooling API 'TraceFlag' DTO.
 * Fields are Uppercase as defined by @JsonProperty in the backend.
 */
export interface TraceFlagDto {
  Id: string;
  TracedEntityId: string;
  TracedEntity?: {
    Name?: string;
    attributes?: {
      type?: string;
    };
  };
  StartDate?: string;
  ExpirationDate?: string;
  DebugLevelId?: string;
  DebugLevel?: {
    DeveloperName?: string;
  };
  LogType?: string;
}

export interface ReportDto {
  id: string;
  name?: string;
  developerName?: string;
  folderName?: string;
  createdDate?: string;
  createdBy?: UserSummaryDto;
  lastModifiedDate?: string;
  lastModifiedBy?: UserSummaryDto;
}

export interface Report {
  sfdcId: string;
  name: string;
  developerName?: string;
  folderName?: string;
  createdDate?: string;
  createdByName?: string;
  lastModifiedDate?: string;
  lastModifiedByName?: string;
}

export interface ReportFilterDto {
  column?: string;
  operator?: string;
  value?: string;
}

export interface ReportMetadataDto {
  id?: string;
  name?: string;
  reportFormat?: string;
  reportType?: {
    type?: string;
    label?: string;
  };
  detailColumns?: string[];
  reportFilters?: ReportFilterDto[];
  reportBooleanFilter?: string;
  developerName?: string;
}

export interface ReportCategoryDto {
  name?: string;
  label?: string;
}

export interface ReportTypeMetadataDto {
  categories?: ReportCategoryDto[];
}

export interface ReportDescribeDto {
  reportMetadata?: ReportMetadataDto;
  reportTypeMetadata?: ReportTypeMetadataDto;
}

export interface ReportSoqlDto {
  reportId: string;
  reportName?: string;
  rootObject?: string;
  soql: string;
  filters: ReportFilterDto[];
  reportType?: {
    type?: string;
    label?: string;
  };
  reportFormat?: string;
  objects: string[];
  instanceUrl?: string;
  reportUrl?: string;
}
