// Komponen AISettings.vue
<template>
  <div class="max-w-3xl mx-auto py-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Cog6ToothIcon class="w-6 h-6 text-blue-500 mr-2" />
        Pengaturan AI Assistant
      </h3>
      
      <div v-if="loading" class="py-8 flex justify-center">
        <div class="animate-spin h-8 w-8 text-blue-600 rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
      
      <div v-else>
        <form @submit.prevent="saveSettings">
          <!-- Model Preferences -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-800 mb-4">Preferensi Model</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Model Default</label>
                <select 
                  v-model="settings.defaultModel" 
                  class="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Daily GPT-4 Limit</label>
                <input 
                  type="number" 
                  v-model="settings.dailyGpt4Limit" 
                  min="1" 
                  max="100"
                  class="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">GPT-4 digunakan: {{ settings.gpt4UsageCount }}/{{ settings.dailyGpt4Limit }} hari ini</p>
              </div>
              
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="fallback" 
                  v-model="settings.fallbackToGpt35"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="fallback" class="ml-2 block text-sm text-gray-700">Fallback ke GPT-3.5 jika limit tercapai</label>
              </div>
            </div>
          </div>
          
          <!-- Generation Settings -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-800 mb-4">Pengaturan Generasi</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <div class="flex items-center">
                  <input 
                    type="range" 
                    v-model.number="settings.temperature" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ settings.temperature }}</span>
                </div>
                <p class="mt-1 text-xs text-gray-500">Nilai lebih tinggi menghasilkan output lebih acak</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <select 
                  v-model="settings.maxTokens" 
                  class="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option :value="1000">1000 tokens</option>
                  <option :value="2000">2000 tokens</option>
                  <option :value="4000">4000 tokens</option>
                  <option :value="8000">8000 tokens</option>
                  <option :value="16000">16000 tokens</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">Batas maksimum panjang respons</p>
              </div>
            </div>
          </div>
          
          <!-- Custom System Prompt -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-800 mb-4">System Prompt Kustom</h4>
            <div>
              <textarea 
                v-model="settings.customSystemPrompt" 
                rows="4" 
                placeholder="Masukkan instruksi tambahan untuk AI di sini..."
                class="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Instruksi tambahan untuk AI Assistant</p>
            </div>
          </div>
          
          <!-- Analytics -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-800 mb-4">Analytics</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Total Token Usage</div>
                <div class="text-xl font-semibold">{{ settings.totalTokensUsed.toLocaleString() }}</div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Token Usage This Month</div>
                <div class="text-xl font-semibold">{{ settings.tokenUsageThisMonth.toLocaleString() }}</div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 mt-8">
            <button 
              type="button" 
              @click="resetSettings" 
              class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset to Default
            </button>
            
            <button 
              type="submit" 
              class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="saving"
            >
              <ArrowPathIcon v-if="saving" class="animate-spin inline-block w-4 h-4 mr-1" />
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Cog6ToothIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import apiClient from '@/config/api'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const settings = ref({
  defaultModel: 'gpt-3.5-turbo',
  dailyGpt4Limit: 5,
  gpt4UsageCount: 0,
  fallbackToGpt35: true,
  temperature: 0.7,
  maxTokens: 2000,
  customSystemPrompt: '',
  totalTokensUsed: 0,
  tokenUsageThisMonth: 0
})

const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    // Fetch settings from server using the correct API format
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'get_settings',
        params: {}
      },
      id: Math.floor(Math.random() * 1000000)
    })
    
    const result = response.data.result
    
    if (result.success) {
      // Map the backend settings format to our frontend model
      settings.value = {
        defaultModel: result.settings.default_model || 'gpt-3.5-turbo',
        dailyGpt4Limit: result.settings.daily_gpt4_limit || 5,
        gpt4UsageCount: result.settings.gpt4_usage_count || 0,
        fallbackToGpt35: result.settings.fallback_to_gpt35 !== undefined ? result.settings.fallback_to_gpt35 : true,
        temperature: result.settings.temperature || 0.7,
        maxTokens: result.settings.max_tokens || 2000,
        customSystemPrompt: result.settings.custom_system_prompt || '',
        totalTokensUsed: result.settings.total_tokens_used || 0,
        tokenUsageThisMonth: result.settings.token_usage_this_month || 0
      }
    } else {
      showToast({
        message: 'Failed to load settings: ' + (result.error || 'Unknown error'),
        type: 'error'
      })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    showToast({
      message: 'Network error loading settings',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
})

const saveSettings = async () => {
  saving.value = true
  try {
    // Convert frontend settings model to backend format
    const backendSettings = {
      default_model: settings.value.defaultModel,
      daily_gpt4_limit: parseInt(settings.value.dailyGpt4Limit),  // Pastikan ini integer
      fallback_to_gpt35: Boolean(settings.value.fallbackToGpt35), // Pastikan ini boolean
      temperature: parseFloat(settings.value.temperature),        // Pastikan ini float
      max_tokens: parseInt(settings.value.maxTokens),            // Pastikan ini integer
      custom_system_prompt: settings.value.customSystemPrompt || ''
    }
    
    console.log('Saving settings:', backendSettings);
    
    // Save settings to server using the correct API format
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'update_settings',
        params: {
          settings: backendSettings
        }
      },
      id: Math.floor(Math.random() * 1000000)
    })
    
    console.log('Save settings response:', response.data);
    
    const result = response.data.result
    
    if (result.success) {
      // Update local settings from the response to ensure sync
      if (result.settings) {
        settings.value = {
          defaultModel: result.settings.default_model || 'gpt-3.5-turbo',
          dailyGpt4Limit: result.settings.daily_gpt4_limit || 5,
          gpt4UsageCount: result.settings.gpt4_usage_count || 0,
          fallbackToGpt35: result.settings.fallback_to_gpt35 !== undefined ? result.settings.fallback_to_gpt35 : true,
          temperature: result.settings.temperature || 0.7,
          maxTokens: result.settings.max_tokens || 2000,
          customSystemPrompt: result.settings.custom_system_prompt || '',
          totalTokensUsed: result.settings.total_tokens_used || 0,
          tokenUsageThisMonth: result.settings.token_usage_this_month || 0
        }
      }
      
      showToast({
        message: 'Settings saved successfully!',
        type: 'success'
      })
    } else {
      showToast({
        message: 'Error saving settings: ' + (result.error || 'Unknown error'),
        type: 'error'
      })
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    showToast({
      message: 'Network error saving settings',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to default?')) {
    settings.value = {
      defaultModel: 'gpt-3.5-turbo',
      dailyGpt4Limit: 5,
      gpt4UsageCount: 0,
      fallbackToGpt35: true,
      temperature: 0.7,
      maxTokens: 2000,
      customSystemPrompt: '',
      totalTokensUsed: 0,
      tokenUsageThisMonth: 0
    }
    
    // Optionally, you could also call saveSettings() here to instantly save the reset values
  }
}
</script>