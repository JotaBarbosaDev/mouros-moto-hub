// types/audit.ts - Sistema Avançado de Auditoria
export type AuditCategory = 
  | 'authentication' 
  | 'member_management' 
  | 'financial' 
  | 'events' 
  | 'store' 
  | 'vehicles' 
  | 'system_config' 
  | 'reports' 
  | 'communications' 
  | 'data_operations' 
  | 'maintenance';

export type UserRole = 
  | 'super_admin' 
  | 'presidente' 
  | 'tesoureiro' 
  | 'secretario' 
  | 'direcao' 
  | 'socio' 
  | 'cliente';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  category: AuditCategory;
  action: string;
  resourceType?: string;
  resourceId?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  requestMethod?: string;
  requestUrl?: string;
  responseStatus?: number;
  executionTimeMs?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isSensitive: boolean;
  requiresAttention: boolean;
  tags?: string[];
  gdprRetentionDate?: Date;
  anonymized?: boolean;
}

export interface AuditLogFilter {
  category?: AuditCategory[];
  severity?: AuditSeverity[];
  userId?: string;
  userRole?: UserRole[];
  startDate?: Date;
  endDate?: Date;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  tags?: string[];
  isSensitive?: boolean;
  requiresAttention?: boolean;
  page?: number;
  limit?: number;
}

export interface AuditLogAccessRule {
  id: string;
  userRole: UserRole;
  allowedCategories: AuditCategory[];
  canViewSensitive: boolean;
  canExport: boolean;
  canConfigureAlerts: boolean;
  retentionDays: number;
}

export interface AuditAlertRule {
  id: string;
  name: string;
  description: string;
  category: AuditCategory;
  triggerConditions: {
    action?: string[];
    severity?: string[];
    userRole?: UserRole[];
    frequency?: {
      count: number;
      timeWindow: number; // minutos
    };
    keywords?: string[];
  };
  notificationChannels: {
    email?: boolean;
    inApp?: boolean;
    webhook?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditStats {
  totalLogs: number;
  logsByCategory: Record<AuditCategory, number>;
  logsBySeverity: Record<string, number>;
  logsByUser: Array<{
    userId: string;
    userEmail: string;
    count: number;
  }>;
  recentAlerts: number;
  criticalEvents: number;
  uniqueUsers: number;
  financialEvents: number;
  securityAlerts: number;
  authFailures: number;
  personalDataAccess: number;
  dataExports: number;
  activeUsers: number;
  criticalAlerts: number;
  securityScore: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  trends?: {
    totalLogs: number;
    criticalEvents: number;
    uniqueUsers: number;
    financialEvents: number;
    securityAlerts: number;
    authFailures: number;
    personalDataAccess: number;
    dataExports: number;
  };
  timeRange: {
    from: Date;
    to: Date;
  };
}

export interface GDPRComplianceInfo {
  personalDataFields: string[];
  retentionPolicy: {
    category: AuditCategory;
    retentionDays: number;
    autoAnonymize: boolean;
  }[];
  dataSubjectRights: {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
  };
}

// Constantes para controlo de acesso
export const ROLE_PERMISSIONS: Record<UserRole, AuditLogAccessRule> = {
  super_admin: {
    id: 'super_admin',
    userRole: 'super_admin',
    allowedCategories: [
      'authentication', 'member_management', 'financial', 'events', 
      'store', 'vehicles', 'system_config', 'reports', 'communications', 
      'data_operations', 'maintenance'
    ],
    canViewSensitive: true,
    canExport: true,
    canConfigureAlerts: true,
    retentionDays: 2555, // 7 anos
  },
  presidente: {
    id: 'presidente',
    userRole: 'presidente',
    allowedCategories: [
      'authentication', 'member_management', 'financial', 'events', 
      'store', 'vehicles', 'system_config', 'reports', 'communications'
    ],
    canViewSensitive: true,
    canExport: true,
    canConfigureAlerts: true,
    retentionDays: 2555,
  },
  tesoureiro: {
    id: 'tesoureiro',
    userRole: 'tesoureiro',
    allowedCategories: ['financial', 'member_management', 'reports'],
    canViewSensitive: true,
    canExport: true,
    canConfigureAlerts: false,
    retentionDays: 2555,
  },
  secretario: {
    id: 'secretario',
    userRole: 'secretario',
    allowedCategories: ['member_management', 'events', 'communications', 'reports'],
    canViewSensitive: false,
    canExport: true,
    canConfigureAlerts: false,
    retentionDays: 1095, // 3 anos
  },
  direcao: {
    id: 'direcao',
    userRole: 'direcao',
    allowedCategories: ['events', 'store', 'communications'],
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false,
    retentionDays: 1095,
  },
  socio: {
    id: 'socio',
    userRole: 'socio',
    allowedCategories: ['events', 'store'],
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false,
    retentionDays: 365, // 1 ano
  },
  cliente: {
    id: 'cliente',
    userRole: 'cliente',
    allowedCategories: ['store'],
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false,
    retentionDays: 365,
  },
};

// Configurações GDPR
export const GDPR_CONFIG: GDPRComplianceInfo = {
  personalDataFields: [
    'userEmail', 'ipAddress', 'userAgent', 'resourceId', 
    'oldValues.email', 'newValues.email', 'oldValues.name', 'newValues.name',
    'metadata.personalData'
  ],
  retentionPolicy: [
    { category: 'authentication', retentionDays: 2555, autoAnonymize: true },
    { category: 'member_management', retentionDays: 2555, autoAnonymize: true },
    { category: 'financial', retentionDays: 2555, autoAnonymize: false },
    { category: 'events', retentionDays: 1095, autoAnonymize: true },
    { category: 'store', retentionDays: 1095, autoAnonymize: true },
    { category: 'vehicles', retentionDays: 1095, autoAnonymize: true },
    { category: 'system_config', retentionDays: 2555, autoAnonymize: false },
    { category: 'reports', retentionDays: 1095, autoAnonymize: true },
    { category: 'communications', retentionDays: 365, autoAnonymize: true },
    { category: 'data_operations', retentionDays: 2555, autoAnonymize: false },
    { category: 'maintenance', retentionDays: 365, autoAnonymize: true },
  ],
  dataSubjectRights: {
    rightToAccess: true,
    rightToRectification: true,
    rightToErasure: true,
    rightToPortability: true,
  },
};
