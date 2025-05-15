<template>
  <div class="history-page">
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Histórico do Sistema</h1>
        <button
          @click="refreshLogs"
          class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded flex items-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="mr-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span>Atualizar</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <ActivityHistory />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ActivityHistory from '@/components/ActivityHistory.vue';
import { useTitle } from '@/composables/use-title';

// Configurar o título da página
useTitle('Histórico do Sistema | Mouros Moto Hub');

const isLoading = ref(false);

// Função para atualizar os dados
const refreshLogs = async () => {
  isLoading.value = true;
  try {
    // A atualização real acontece dentro do componente ActivityHistory
    // Este é apenas um wrapper para atualizar o estado isLoading
    await new Promise(resolve => setTimeout(resolve, 500)); // delay simulado
    window.location.reload(); // recarrega a página para atualizar todos os dados
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
