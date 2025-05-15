import { ref, computed, onMounted } from 'vue';
import { activityLogService } from '@/services/activity-log-service';
import { useUserStore } from '@/stores/user-store';

export function useActivityLogs(entityType = null, entityId = null) {
  const userStore = useUserStore();
  const logs = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const filters = ref({
    action: null,
    entityType: entityType || null,
    entityId: entityId || null,
    fromDate: null,
    toDate: null,
    userId: null,
    limit: 50,
    page: 1
  });
  
  const totalPages = ref(1);
  
  // Filtros formatados para exibição
  const actionOptions = [
    { value: null, label: 'Todas as ações' },
    { value: 'CREATE', label: 'Criação' },
    { value: 'UPDATE', label: 'Atualização' },
    { value: 'DELETE', label: 'Exclusão' },
    { value: 'VIEW', label: 'Visualização' }
  ];
  
  const entityTypeOptions = [
    { value: null, label: 'Todos os tipos' },
    { value: 'MEMBER', label: 'Membro' },
    { value: 'VEHICLE', label: 'Veículo' },
    { value: 'SETTINGS', label: 'Configurações' },
    { value: 'EVENT', label: 'Evento' }
  ];
  
  // Carregar logs com filtros aplicados
  const loadLogs = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Calcular offset com base na página
      const offset = (filters.value.page - 1) * filters.value.limit;
      
      const result = await activityLogService.getLogs({
        ...filters.value,
        offset
      });
      
      logs.value = result;
      
      // TODO: implementar contagem total quando houver suporte na API
      totalPages.value = Math.ceil(result.length / filters.value.limit) || 1;
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      error.value = 'Não foi possível carregar o histórico de atividades.';
    } finally {
      loading.value = false;
    }
  };
  
  // Carregar logs quando os filtros mudarem
  const applyFilters = async () => {
    filters.value.page = 1; // Resetar para primeira página
    await loadLogs();
  };
  
  // Navegar entre páginas
  const goToPage = async (page) => {
    filters.value.page = page;
    await loadLogs();
  };
  
  // Formatadores
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };
  
  const formatAction = (action) => {
    const actionMap = {
      'CREATE': 'criou',
      'UPDATE': 'atualizou',
      'DELETE': 'excluiu',
      'VIEW': 'visualizou'
    };
    return actionMap[action] || action;
  };
  
  const formatEntityType = (type) => {
    const typeMap = {
      'MEMBER': 'membro',
      'VEHICLE': 'veículo',
      'SETTINGS': 'configurações',
      'EVENT': 'evento'
    };
    return typeMap[type] || type;
  };
  
  // Carregar logs iniciais
  onMounted(async () => {
    if (userStore.isAuthenticated) {
      await loadLogs();
    }
  });
  
  // Exportar funções e propriedades para uso no componente
  return {
    logs,
    loading,
    error,
    filters,
    totalPages,
    actionOptions,
    entityTypeOptions,
    loadLogs,
    applyFilters,
    goToPage,
    formatDate,
    formatAction,
    formatEntityType
  };
}
