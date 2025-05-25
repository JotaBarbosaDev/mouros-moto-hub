import { 
  AuditLog, 
  AuditLogFilter, 
  AuditStats, 
  AuditAlertRule,
  UserRole,
  AuditCategory,
  AuditSeverity
} from '../types/audit';
import { fetchWithAuth } from './api';

// Configurações GDPR
const GDPR_CONFIG = {
  personalDataFields: [
    'user.email',
    'user.name', 
    'user.phone',
    'user.address',
    'details.personalInfo',
    'metadata.userAgent',
    'metadata.ipAddress'
  ],
  retentionPolicies: [
    { category: 'authentication' as AuditCategory, retentionDays: 365 },
    { category: 'financial' as AuditCategory, retentionDays: 2555 }, // 7 anos
    { category: 'user_management' as AuditCategory, retentionDays: 1095 }, // 3 anos
    { category: 'system' as AuditCategory, retentionDays: 730 }, // 2 anos
    { category: 'security' as AuditCategory, retentionDays: 1825 }, // 5 anos
    { category: 'inventory' as AuditCategory, retentionDays: 1095 }, // 3 anos
    { category: 'sales' as AuditCategory, retentionDays: 2555 }, // 7 anos
    { category: 'maintenance' as AuditCategory, retentionDays: 730 }, // 2 anos
    { category: 'gdpr' as AuditCategory, retentionDays: 1825 } // 5 anos
  ]
};

// Permissões por role
const ROLE_PERMISSIONS = {
  admin: {
    canView: () => true,
    canViewSensitive: true,
    canExport: true,
    canConfigureAlerts: true
  },
  manager: {
    canView: (category: AuditCategory) => !['security', 'gdpr'].includes(category),
    canViewSensitive: false,
    canExport: true,
    canConfigureAlerts: false
  },
  employee: {
    canView: (category: AuditCategory) => ['inventory', 'sales', 'maintenance'].includes(category),
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false
  },
  mechanic: {
    canView: (category: AuditCategory) => ['maintenance', 'inventory'].includes(category),
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false
  },
  customer: {
    canView: () => false,
    canViewSensitive: false,
    canExport: false,
    canConfigureAlerts: false
  }
};

export class AuditService {
  private baseUrl = '/api/audit';

  // Métodos de verificação de permissão
  hasPermission(userRole: UserRole, action: 'view_logs' | 'export_data' | 'configure_alerts'): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    
    switch (action) {
      case 'view_logs':
        return typeof permissions.canView === 'function' ? true : permissions.canView;
      case 'export_data':
        return permissions.canExport;
      case 'configure_alerts':
        return permissions.canConfigureAlerts;
      default:
        return false;
    }
  }

  canUserViewAuditLogs(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'view_logs');
  }

  canUserExportLogs(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'export_data');
  }

  canUserConfigureAlerts(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'configure_alerts');
  }

  async getLogs(filter?: AuditLogFilter): Promise<{ data: AuditLog[]; total: number }> {
    const params = new URLSearchParams();

    if (filter) {
      if (filter.category?.length) {
        params.append('categories', filter.category.join(','));
      }
      if (filter.severity?.length) {
        params.append('severity', filter.severity.join(','));
      }
      if (filter.userId) {
        params.append('userId', filter.userId);
      }
      if (filter.userRole?.length) {
        params.append('userRoles', filter.userRole.join(','));
      }
      if (filter.dateFrom) {
        params.append('dateFrom', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        params.append('dateTo', filter.dateTo.toISOString());
      }
      if (filter.searchTerm) {
        params.append('search', filter.searchTerm);
      }
      if (filter.tags?.length) {
        params.append('tags', filter.tags.join(','));
      }
      if (filter.isSensitive !== undefined) {
        params.append('isSensitive', filter.isSensitive.toString());
      }
      if (filter.requiresAttention !== undefined) {
        params.append('requiresAttention', filter.requiresAttention.toString());
      }
      params.append('page', (filter.page || 0).toString());
      params.append('limit', (filter.limit || 50).toString());
    }

    const response = await fetchWithAuth(`${this.baseUrl}/logs?${params}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar logs de auditoria: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getStats(timeRange: { from: Date; to: Date }): Promise<AuditStats> {
    const params = new URLSearchParams({
      from: timeRange.from.toISOString(),
      to: timeRange.to.toISOString()
    });

    const response = await fetchWithAuth(`${this.baseUrl}/stats?${params}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }
    
    return response.json();
  }

  async exportLogs(filter: AuditLogFilter, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    params.append('format', format);

    const response = await fetchWithAuth(`${this.baseUrl}/export?${params}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao exportar logs: ${response.statusText}`);
    }
    
    return response.blob();
  }

  async createAlertRule(rule: Omit<AuditAlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AuditAlertRule> {
    const response = await fetchWithAuth(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rule)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar regra de alerta: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAlertRules(): Promise<AuditAlertRule[]> {
    const response = await fetchWithAuth(`${this.baseUrl}/alerts`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar regras de alerta: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateAlertRule(id: string, rule: Partial<AuditAlertRule>): Promise<AuditAlertRule> {
    const response = await fetchWithAuth(`${this.baseUrl}/alerts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rule)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar regra de alerta: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteAlertRule(id: string): Promise<void> {
    const response = await fetchWithAuth(`${this.baseUrl}/alerts/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar regra de alerta: ${response.statusText}`);
    }
  }

  async anonymizePersonalData(userId: string, retainFinancialData: boolean = false): Promise<void> {
    const response = await fetchWithAuth(`${this.baseUrl}/gdpr/anonymize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, retainFinancialData })
    });

    if (!response.ok) {
      throw new Error(`Erro ao anonimizar dados: ${response.statusText}`);
    }
  }

  async exportPersonalData(userId: string): Promise<Blob> {
    const response = await fetchWithAuth(`${this.baseUrl}/gdpr/export/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao exportar dados pessoais: ${response.statusText}`);
    }
    
    return response.blob();
  }

  getUserPermissions(userRole: UserRole): {
    canView: (category: AuditCategory) => boolean;
    canViewSensitive: boolean;
    canExport: boolean;
    canConfigureAlerts: boolean;
  } {
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions || ROLE_PERMISSIONS.customer;
  }

  async logActivity(auditData: Partial<AuditLog>): Promise<void> {
    try {
      // Sanitizar dados sensíveis
      const sanitizedData = this.sanitizeSensitiveData(auditData);
      
      // Inserir log na base de dados
      await this.insertAuditLog(sanitizedData);
      
      // Verificar regras de alerta
      await this.checkAlertRules(sanitizedData);
    } catch (error) {
      console.error('Erro ao registrar atividade de auditoria:', error);
      throw error;
    }
  }

  private sanitizeSensitiveData(auditData: Partial<AuditLog>): Partial<AuditLog> {
    const sanitized = { ...auditData };
    const personalDataFields = GDPR_CONFIG.personalDataFields;
    let hasSensitiveData = false;

    // Verificar se contém dados pessoais
    personalDataFields.forEach(field => {
      const fieldPath = field.split('.');
      const value = this.getNestedValue(sanitized, fieldPath);
      if (value) {
        hasSensitiveData = true;
      }
    });

    sanitized.isSensitive = hasSensitiveData;

    // Adicionar data de retenção GDPR
    if (sanitized.category) {
      const retentionPolicy = GDPR_CONFIG.retentionPolicies.find(
        policy => policy.category === sanitized.category
      );
      if (retentionPolicy) {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() + retentionPolicy.retentionDays);
        sanitized.gdprRetentionDate = retentionDate;
      }
    }

    return sanitized;
  }

  private async insertAuditLog(auditData: Partial<AuditLog>): Promise<void> {
    const response = await fetchWithAuth(`${this.baseUrl}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auditData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao inserir log de auditoria: ${response.statusText}`);
    }
  }

  private async checkAlertRules(auditData: Partial<AuditLog>): Promise<void> {
    // Implementação de verificação de alertas
    console.debug('Verificação de alertas para:', auditData.action, auditData.category);
    // Aqui seria implementada a lógica de verificação de regras de alerta
  }

  private getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
    return path.reduce((current, key) => current?.[key], obj);
  }
}

export const auditService = new AuditService();

// Funções de conveniência para compatibilidade
export const getAuditLogs = async (filter?: AuditLogFilter) => {
  return auditService.getLogs(filter);
};

export const getAuditStats = async (timeRange: { from: Date; to: Date }) => {
  return auditService.getStats(timeRange);
};

export const exportAuditLogs = async (filter: AuditLogFilter, format: 'csv' | 'json' | 'xlsx' = 'csv') => {
  return auditService.exportLogs(filter, format);
};

export const canUserViewAuditLogs = (userRole: UserRole, category: AuditCategory): boolean => {
  const permissions = auditService.getUserPermissions(userRole);
  return permissions.canView(category);
};

export default auditService;
