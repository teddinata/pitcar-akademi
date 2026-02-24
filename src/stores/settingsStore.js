import { defineStore } from 'pinia'
import apiClient from '@/config/api'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    defaultModel: 'gpt-3.5-turbo',
    dailyGpt4Limit: 5,
    gpt4UsageCount: 0,
    remainingGpt4: 5,
    fallbackToGpt35: true,
    temperature: 0.7,
    maxTokens: 2000,
    customSystemPrompt: '',
    defaultDataContext: 'balanced',
    dataModules: [],
    isLoading: false,
    error: null
  }),
  
  actions: {
    async fetchSettings() {
      this.isLoading = true
      try {
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
          this.defaultModel = result.settings.default_model
          this.dailyGpt4Limit = result.settings.daily_gpt4_limit
          this.gpt4UsageCount = result.settings.gpt4_usage_count
          this.remainingGpt4 = result.settings.remaining_gpt4
          this.fallbackToGpt35 = result.settings.fallback_to_gpt35
          this.temperature = result.settings.temperature
          this.maxTokens = result.settings.max_tokens
          this.customSystemPrompt = result.settings.has_custom_prompt ? result.settings.custom_system_prompt : ''
          this.defaultDataContext = result.settings.default_data_context
          this.dataModules = result.settings.data_modules
        } else {
          this.error = 'Failed to load settings: ' + result.error
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
      } finally {
        this.isLoading = false
      }
    },
    
    async updateSettings(settings) {
      this.isLoading = true
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'update_settings',
            params: settings
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        const result = response.data.result
        
        if (result.success) {
          // Update settings in store
          this.fetchSettings()
          return true
        } else {
          this.error = 'Failed to save settings: ' + result.error
          return false
        }
      } catch (error) {
        console.error('Error updating settings:', error)
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
})