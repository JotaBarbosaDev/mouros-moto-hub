// backend/src/routes/audit.js - Rotas de Auditoria
const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/audit');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { auditData } = require('../middleware/advanced-audit');

/**
 * Middleware para verificar permissões de auditoria
 */
const checkAuditPermission = (req, res, next) => {
  const userRole = req.user?.role || 'socio';
  const allowedRoles = ['super_admin', 'presidente', 'tesoureiro', 'secretario', 'direcao'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      error: 'Acesso negado',
      details: 'Sem permissão para aceder ao sistema de auditoria'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Obter logs de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Categorias separadas por vírgula
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Severidades separadas por vírgula
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de pesquisa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite por página
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 total:
 *                   type: integer
 *                 hasNext:
 *                   type: boolean
 */
router.get('/logs', authenticate, checkAuditPermission, auditData(), AuditController.getLogs);

/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Obter estatísticas de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Estatísticas de auditoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditStats'
 */
router.get('/stats', authenticate, checkAuditPermission, auditData(), AuditController.getStats);

/**
 * @swagger
 * /api/audit/export:
 *   get:
 *     summary: Exportar logs de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Formato de exportação
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Categorias separadas por vírgula
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Ficheiro exportado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export', authenticate, checkAuditPermission, auditData(), AuditController.exportLogs);

/**
 * @swagger
 * /api/audit/gdpr/anonymize:
 *   post:
 *     summary: Anonimizar dados pessoais (GDPR)
 *     tags: [Auditoria, GDPR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID do utilizador
 *               retainFinancialData:
 *                 type: boolean
 *                 default: false
 *                 description: Manter dados financeiros
 *     responses:
 *       200:
 *         description: Dados anonimizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 retainFinancialData:
 *                   type: boolean
 */
router.post('/gdpr/anonymize', authenticate, isAdmin, auditData(), AuditController.anonymizePersonalData);

/**
 * @swagger
 * /api/audit/gdpr/export/{userId}:
 *   get:
 *     summary: Exportar dados pessoais de um utilizador (GDPR)
 *     tags: [Auditoria, GDPR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Dados pessoais exportados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 exportDate:
 *                   type: string
 *                   format: date-time
 *                 dataSubjectRights:
 *                   type: object
 *                 personalData:
 *                   type: array
 */
router.get('/gdpr/export/:userId', authenticate, checkAuditPermission, auditData(), AuditController.exportPersonalData);

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         user_id:
 *           type: string
 *         user_email:
 *           type: string
 *         user_role:
 *           type: string
 *         category:
 *           type: string
 *           enum: [authentication, member_management, financial, events, store, vehicles, system_config, reports, communications, data_operations, maintenance]
 *         action:
 *           type: string
 *         description:
 *           type: string
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         ip_address:
 *           type: string
 *         response_status:
 *           type: integer
 *         execution_time_ms:
 *           type: integer
 *         is_sensitive:
 *           type: boolean
 *         requires_attention:
 *           type: boolean
 *     
 *     AuditStats:
 *       type: object
 *       properties:
 *         totalLogs:
 *           type: integer
 *         logsByCategory:
 *           type: object
 *         logsBySeverity:
 *           type: object
 *         logsByUser:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               count:
 *                 type: integer
 *         topActions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               count:
 *                 type: integer
 */

module.exports = router;
