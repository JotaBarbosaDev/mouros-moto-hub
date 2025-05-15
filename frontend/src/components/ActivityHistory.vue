<template>
  <div class="activity-history">
    <h2 class="text-2xl font-semibold mb-4">Histórico de Atividades</h2>
    
    <!-- Filtros -->
    <div class="filters bg-gray-100 p-4 rounded-lg mb-6">
      <details>
        <summary class="cursor-pointer font-medium">Filtros</summary>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Ação</label>
            <select 
              v-model="filters.action" 
              class="w-full border rounded p-2"
              @change="applyFilters"
            >
              <option 
                v-for="option in actionOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group" v-if="!entityType">
            <label class="block text-sm font-medium mb-1">Tipo de Entidade</label>
            <select 
              v-model="filters.entityType" 
              class="w-full border rounded p-2"
              @change="applyFilters"
            >
              <option 
                v-for="option in entityTypeOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Data Inicial</label>
            <input 
              type="date" 
              v-model="filters.fromDate" 
              class="w-full border rounded p-2"
            />
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium mb-1">Data Final</label>
            <input 
              type="date" 
              v-model="filters.toDate" 
              class="w-full border rounded p-2"
            />
          </div>
          
          <div class="form-group col-span-1 md:col-span-3 mt-2">
            <button 
              @click="applyFilters" 
              class="bg-primary text-white px-4 py-2 rounded"
            >
              Aplicar Filtros
            </button>
            <button 
              @click="resetFilters" 
              class="bg-gray-300 px-4 py-2 rounded ml-2"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </details>
    </div>
    
    <!-- Tabela de Logs -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-2 px-3 border-b text-left">Data/Hora</th>
            <th class="py-2 px-3 border-b text-left">Usuário</th>
            <th class="py-2 px-3 border-b text-left">Ação</th>
            <th class="py-2 px-3 border-b text-left">Entidade</th>
            <th class="py-2 px-3 border-b text-left">Detalhes</th>
          </tr>
        </thead>
        <tbody v-if="!loading && logs.length > 0">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="py-2 px-3 border-b">{{ formatDate(log.created_at) }}</td>
            <td class="py-2 px-3 border-b">{{ log.username || 'Sistema' }}</td>
            <td class="py-2 px-3 border-b">
              <span :class="getActionClass(log.action)">
                {{ formatAction(log.action) }}
              </span>
            </td>
            <td class="py-2 px-3 border-b">
              {{ formatEntityType(log.entity_type) }}
              <span v-if="log.details?.memberName" class="block text-xs text-gray-500">
                {{ log.details.memberName }}
              </span>
            </td>
            <td class="py-2 px-3 border-b">
              <details>
                <summary class="cursor-pointer text-blue-600">Ver detalhes</summary>
                <pre class="whitespace-pre-wrap text-xs bg-gray-100 p-2 mt-1 rounded">{{ JSON.stringify(log.details, null, 2) }}</pre>
              </details>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr>
            <td colspan="5" class="py-4 text-center">
              <div class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 mr-3 text-primary" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando histórico...
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="py-4 text-center">
              <p v-if="error" class="text-red-500">{{ error }}</p>
              <p v-else class="text-gray-500">Nenhum registro de atividade encontrado.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginação -->
    <div v-if="totalPages > 1" class="pagination flex justify-center mt-4">
      <button 
        @click="goToPage(filters.page - 1)" 
        :disabled="filters.page === 1"
        class="px-3 py-1 border rounded mx-1"
        :class="{ 'opacity-50 cursor-not-allowed': filters.page === 1 }"
      >
        Anterior
      </button>
      
      <button 
        v-for="page in totalPages" 
        :key="page" 
        @click="goToPage(page)"
        class="px-3 py-1 border rounded mx-1"
        :class="{ 'bg-primary text-white': page === filters.page }"
      >
        {{ page }}
      </button>
      
      <button 
        @click="goToPage(filters.page + 1)" 
        :disabled="filters.page === totalPages"
        class="px-3 py-1 border rounded mx-1"
        :class="{ 'opacity-50 cursor-not-allowed': filters.page === totalPages }"
      >
        Próximo
      </button>
    </div>
  </div>
</template>

<script setup>
import { useActivityLogs } from '@/composables/use-activity-logs';

const props = defineProps({
  entityType: {
    type: String,
    default: null
  },
  entityId: {
    type: String,
    default: null
  }
});

const {
  logs,
  loading,
  error,
  filters,
  totalPages,
  actionOptions,
  entityTypeOptions,
  applyFilters,
  goToPage,
  formatDate,
  formatAction,
  formatEntityType
} = useActivityLogs(props.entityType, props.entityId);

// Reseta todos os filtros exceto entity_type e entity_id se foram fornecidos como props
const resetFilters = () => {
  filters.value = {
    action: null,
    entityType: props.entityType || null,
    entityId: props.entityId || null,
    fromDate: null,
    toDate: null,
    userId: null,
    limit: 50,
    page: 1
  };
  applyFilters();
};

// Retorna a classe CSS apropriada para o tipo de ação
const getActionClass = (action) => {
  const actionClasses = {
    'CREATE': 'text-green-600',
    'UPDATE': 'text-blue-600',
    'DELETE': 'text-red-600',
    'VIEW': 'text-gray-600'
  };
  return actionClasses[action] || '';
};
</script>

<style scoped>
.activity-history {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 640px) {
  table {
    font-size: 0.8rem;
  }
  
  td, th {
    padding: 0.5rem 0.25rem;
  }
}
</style>
