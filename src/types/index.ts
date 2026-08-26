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
  description?: string;
  developerName?: string;
  folderName?: string;
  format?: string;
  reportType?: string;
  createdDate?: string;
  createdBy?: UserSummaryDto;
  lastModifiedDate?: string;
  lastModifiedBy?: UserSummaryDto;
}

export interface Report {
  sfdcId: string;
  name: string;
  description?: string;
  developerName?: string;
  folderName?: string;
  format?: string;
  reportType?: string;
  createdDate?: string;
  createdByName?: string;
  lastModifiedDate?: string;
  lastModifiedByName?: string;
}
