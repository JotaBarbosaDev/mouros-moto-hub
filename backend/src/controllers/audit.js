// backend/src/controllers/audit.js - Controlador de Auditoria
const advancedAuditService = require('../services/audit-service');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Controlador para endpoints de auditoria
 */
class AuditController {
  
  /**
   * Obter logs de auditoria com filtros
   */
  static async getLogs(req, res) {
    try {
      const {
        categories,
        severity,
        userId,
        userRoles,
        dateFrom,
        dateTo,
        search,
        tags,
        isSensitive,
        requiresAttention,
        page = 0,
        limit = 50
      } = req.query;

      // Converter strings para arrays quando necessário
      const filters = {
        categories: categories ? categories.split(',') : [],
        severity: severity ? severity.split(',') : [],
        userId,
        userRoles: userRoles ? userRoles.split(',') : [],
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
        dateTo: dateTo ? new Date(dateTo).toISOString() : null,
        searchTerm: search,
        tags: tags ? tags.split(',') : [],
        isSensitive: isSensitive === 'true' ? true : isSensitive === 'false' ? false : null,
        requiresAttention: requiresAttention === 'true' ? true : requiresAttention === 'false' ? false : null,
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100) // Máximo 100 por página
      };

      // Verificar permissões do utilizador
      const userRole = req.user?.role || 'socio';
      if (!AuditController.hasViewPermission(userRole, filters.categories)) {
        return res.status(403).json({
          error: 'Sem permissão para ver estes logs',
          details: 'O seu nível de acesso não permite visualizar estas categorias'
        });
      }

      const result = await advancedAuditService.getLogs(filters);

      res.json(result);

    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      res.status(500).json({
        error: 'Erro ao obter logs de auditoria',
        details: error.message
      });
    }
  }

  /**
   * Obter estatísticas de auditoria
   */
  static async getStats(req, res) {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios',
          details: 'from e to são obrigatórios'
        });
      }

      const dateFrom = new Date(from).toISOString();
      const dateTo = new Date(to).toISOString();

      const stats = await advancedAuditService.getStats(dateFrom, dateTo);

      res.json(stats);

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        error: 'Erro ao obter estatísticas',
        details: error.message
      });
    }
  }

  /**
   * Exportar logs de auditoria
   */
  static async exportLogs(req, res) {
    try {
      const userRole = req.user?.role || 'socio';
      
      // Verificar permissão de exportação
      if (!AuditController.hasExportPermission(userRole)) {
        return res.status(403).json({
          error: 'Sem permissão para exportar',
          details: 'O seu nível de acesso não permite exportar logs'
        });
      }

      const format = req.query.format || 'csv';
      const filters = { ...req.query };
      delete filters.format;

      // Obter logs com filtros
      const result = await advancedAuditService.getLogs({
        ...filters,
        limit: 10000 // Limite para exportação
      });

      // Gerar ficheiro baseado no formato
      let fileContent, contentType, fileName;

      switch (format) {
        case 'json':
          fileContent = JSON.stringify(result.logs, null, 2);
          contentType = 'application/json';
          fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'csv':
        default:
          fileContent = AuditController.convertToCSV(result.logs);
          contentType = 'text/csv';
          fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      // Registrar exportação
      await advancedAuditService.logActivity({
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'reports',
        action: 'EXPORT_AUDIT_LOGS',
        description: `Exportação de ${result.logs.length} logs em formato ${format}`,
        metadata: { format, recordCount: result.logs.length }
      });

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(fileContent);

    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      res.status(500).json({
        error: 'Erro ao exportar logs',
        details: error.message
      });
    }
  }

  /**
   * Compliance GDPR - Anonimizar dados pessoais
   */
  static async anonymizePersonalData(req, res) {
    try {
      const { userId, retainFinancialData = false } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'UserId é obrigatório'
        });
      }

      // Verificar permissões (apenas admins e presidente)
      const userRole = req.user?.role || 'socio';
      if (!['super_admin', 'presidente'].includes(userRole)) {
        return res.status(403).json({
          error: 'Sem permissão para anonimizar dados'
        });
      }

      await advancedAuditService.anonymizePersonalData(userId, retainFinancialData);

      // Registrar anonimização
      await advancedAuditService.logActivity({
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'data_operations',
        action: 'GDPR_ANONYMIZE',
        description: `Anonimização GDPR de dados pessoais para utilizador ${userId}`,
        metadata: { targetUserId: userId, retainFinancialData }
      });

      res.json({
        message: 'Dados pessoais anonimizados com sucesso',
        userId,
        retainFinancialData
      });

    } catch (error) {
      console.error('Erro na anonimização GDPR:', error);
      res.status(500).json({
        error: 'Erro na anonimização',
        details: error.message
      });
    }
  }

  /**
   * Compliance GDPR - Exportar dados pessoais de um utilizador
   */
  static async exportPersonalData(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'UserId é obrigatório'
        });
      }

      // Obter todos os logs do utilizador
      const result = await advancedAuditService.getLogs({
        userId,
        limit: 10000
      });

      // Filtrar apenas dados pessoais
      const personalData = result.logs.map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        description: log.description,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        category: log.category
      }));

      // Registrar exportação
      await advancedAuditService.logActivity({
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'data_operations',
        action: 'GDPR_EXPORT',
        description: `Exportação GDPR de dados pessoais para utilizador ${userId}`,
        metadata: { targetUserId: userId, recordCount: personalData.length }
      });

      const fileName = `personal-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.json({
        userId,
        exportDate: new Date().toISOString(),
        dataSubjectRights: {
          rightToAccess: true,
          rightToRectification: true,
          rightToErasure: true,
          rightToPortability: true
        },
        personalData
      });

    } catch (error) {
      console.error('Erro ao exportar dados pessoais:', error);
      res.status(500).json({
        error: 'Erro ao exportar dados pessoais',
        details: error.message
      });
    }
  }

  /**
   * Verificar permissões de visualização
   */
  static hasViewPermission(userRole, categories) {
    const rolePermissions = {
      'super_admin': ['authentication', 'member_management', 'financial', 'events', 'store', 'vehicles', 'system_config', 'reports', 'communications', 'data_operations', 'maintenance'],
      'presidente': ['authentication', 'member_management', 'financial', 'events', 'store', 'vehicles', 'system_config', 'reports', 'communications'],
      'tesoureiro': ['financial', 'member_management', 'reports'],
      'secretario': ['member_management', 'events', 'communications', 'reports'],
      'direcao': ['events', 'store', 'communications'],
      'socio': ['events', 'store'],
      'cliente': ['store']
    };

    const allowedCategories = rolePermissions[userRole] || [];
    
    // Se não especificar categorias, verificar se tem acesso a pelo menos uma
    if (!categories || categories.length === 0) {
      return allowedCategories.length > 0;
    }

    // Verificar se tem acesso a todas as categorias solicitadas
    return categories.every(cat => allowedCategories.includes(cat));
  }

  /**
   * Verificar permissões de exportação
   */
  static hasExportPermission(userRole) {
    const rolesWithExport = ['super_admin', 'presidente', 'tesoureiro', 'secretario'];
    return rolesWithExport.includes(userRole);
  }

  /**
   * Converter logs para formato CSV
   */
  static convertToCSV(logs) {
    if (!logs || logs.length === 0) {
      return '';
    }

    const headers = [
      'timestamp', 'user_email', 'user_role', 'category', 'action', 
      'description', 'severity', 'ip_address', 'response_status'
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        return headers.map(header => {
          const value = log[header] || '';
          // Escapar aspas e vírgulas
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');

    return csvContent;
  }
}

module.exports = AuditController;
