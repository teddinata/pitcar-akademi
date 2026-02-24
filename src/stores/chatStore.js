import { defineStore } from 'pinia'
import apiClient from '@/config/api'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [],
    archivedChats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    isLoadingMessages: false,
    isThinking: false,
    error: null
    // REMOVED: tempChat: null, // Temporary chat no longer needed
  }),
  
  getters: {
    filteredChats: (state) => (filter) => {
      if (filter === 'all') return state.chats
      return state.chats.filter(chat => 
        chat.category === filter || 
        (chat.topic_tags && chat.topic_tags.includes(filter))
      )
    },
    
    // Other getters...
  },
  
  actions: {
    // MODIFIED: createChat function (renamed from createTempChat)
    createChat(name, category = 'general') {
      console.log("Creating chat in store:", name, category)
      
      // Set current chat object
      this.currentChat = {
        name: name || `Chat ${new Date().toLocaleDateString()}`,
        category: category,
        topic_tags: category === 'business' ? ['business', 'analysis'] : ['general']
      }
      
      // Reset messages
      this.messages = []
      
      return this.currentChat
    },
    
  
    // REMOVED: promptForChatName() method is no longer needed
    
    // Fetch chat list from server
    async fetchChats() {
      this.isLoading = true
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'get_chat_list',
            include_archived: false,
            params: {}
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        const result = response.data.result
        
        if (result.success) {
          this.chats = result.chats.map(chat => ({
            ...chat,
            preview: chat.last_message || 'New conversation',
            category: chat.name.toLowerCase().includes('business') ? 'business' : 'general',
            topic_tags: this.extractTopicTags(chat)
          }))
          
          this.sortChats()
        } else {
          this.error = 'Failed to load chat list: ' + result.error
        }
      } catch (error) {
        console.error('Error fetching chat list:', error)
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
      } finally {
        this.isLoading = false
      }
    },
    
    // Get messages for a specific chat
    async fetchMessages(chatId) {
      // MODIFIED: Simplified check, no temporary IDs anymore
      if (!chatId || chatId === 0) {
        this.messages = []
        return
      }
      
      this.isLoadingMessages = true
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'get_chat_messages',
            params: { chat_id: chatId }
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        const result = response.data.result
        
        if (result.success) {
          this.currentChat = result.chat
          
          this.messages = result.messages.map(message => {
            if (message.type === 'assistant' && message.content) {
              message.visualizations = this.extractVisualizations(message.content)
              message.data_sources = this.extractDataSources(message.content)
            }
            return message
          })
        } else {
          this.error = 'Failed to load messages: ' + result.error
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
      } finally {
        this.isLoadingMessages = false
      }
    },
    
    // MODIFIED: Send message function to handle new and existing chats
    async sendMessage(messageContent, model, queryMode = 'auto') {
      if (!messageContent || !messageContent.trim()) {
        console.error("Cannot send empty message")
        return
      }
      
      console.log("Sending message:", messageContent.substring(0, 30) + "...")
      this.isThinking = true
      
      // Add user message to list
      const tempMessageId = Date.now()
      this.messages.push({
        id: tempMessageId,
        message_id: 'temp-' + tempMessageId,
        content: messageContent,
        type: 'user',
        timestamp: new Date().toISOString()
      })
      
      try {
        let chatId
        
        // Check if we need to create a new chat
        if (!this.currentChat || !this.currentChat.id) {
          console.log("Creating new chat on server")
          try {
            // Create chat on server first
            const chatResponse = await apiClient.post('/web/ai/chat', {
              jsonrpc: "2.0",
              method: "call",
              params: {
                operation: 'create_chat',
                params: {
                  name: this.currentChat?.name || messageContent.substring(0, 30),
                  category: this.currentChat?.category || 'general'
                }
              },
              id: Math.floor(Math.random() * 1000000)
            })
            
            if (chatResponse.data.result && chatResponse.data.result.success) {
              // Use new chat ID
              chatId = chatResponse.data.result.chat_id
              console.log("Chat created with ID:", chatId)
              
              // Update current chat with server info
              this.currentChat = {
                ...(this.currentChat || {}),
                id: chatId,
                session_token: chatResponse.data.result.session_token || null
              }
              
              // Add to chat list
              this.chats.unshift({
                ...this.currentChat,
                preview: messageContent.substring(0, 30),
                last_message_date: new Date().toISOString(),
                total_messages: 1
              })
              this.sortChats()
            } else {
              throw new Error('Failed to create chat: ' + 
                (chatResponse.data.result?.error || 'Unknown error'))
            }
          } catch (error) {
            console.error('Error creating chat:', error)
            
            // Add error message to messages
            this.messages.push({
              id: Date.now(),
              message_id: 'error-' + Date.now(),
              content: `Error creating chat: ${error.message || 'Unknown error'}`,
              type: 'system',
              timestamp: new Date().toISOString()
            })
            
            this.isThinking = false
            return
          }
        } else {
          // Use existing chat ID
          chatId = this.currentChat.id
          console.log("Using existing chat ID:", chatId)
        }
        
        // Send message to server
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'send_message',
            params: {
              chat_id: chatId,
              message: messageContent,
              model: model,
              query_mode: queryMode
            }
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        const result = response.data.result
        
        if (result.success) {
          const responseContent = result.response.content
          const visualizations = this.extractVisualizations(responseContent)
          const dataSources = this.extractDataSources(responseContent)
          
          // Add AI response to messages
          this.messages.push({
            id: result.response.id,
            message_id: result.response.message_id,
            content: responseContent,
            type: 'assistant',
            model_used: result.response.model_used,
            token_count: result.response.token_count,
            visualizations: visualizations,
            data_sources: dataSources,
            timestamp: new Date().toISOString()
          })
          
          // Update chat in list
          this.updateChatPreview(chatId, messageContent)
          
          // If chat has been updated with new info
          if (result.chat_updated && result.chat) {
            this.updateChatInList(result.chat)
          }
          
          // Emit an event or callback to notify components that a new chat was created
          if (this.onChatCreated && typeof this.onChatCreated === 'function') {
            this.onChatCreated(chatId)
          }
        } else {
          // Add error message
          this.messages.push({
            id: Date.now(),
            message_id: 'error-' + Date.now(),
            content: `Error: ${result.error}`,
            type: 'system',
            timestamp: new Date().toISOString()
          })
          this.error = 'Failed to get response: ' + result.error
        }
      } catch (error) {
        console.error('Error sending message:', error)
        
        // Add error message to messages
        this.messages.push({
          id: Date.now(),
          message_id: 'error-' + Date.now(),
          content: `Network error: ${error.message || 'Unable to connect to the server'}`,
          type: 'system',
          timestamp: new Date().toISOString()
        })
        
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
      } finally {
        this.isThinking = false
      }
    },
    
    // Rest of your methods remain the same
    sortChats() {
      this.chats.sort((a, b) => {
        return new Date(b.last_message_date || b.created_at) - 
               new Date(a.last_message_date || a.created_at)
      })
    },
    
    updateChatPreview(chatId, message) {
      const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
      if (chatIndex !== -1) {
        this.chats[chatIndex] = {
          ...this.chats[chatIndex],
          preview: message,
          last_message_date: new Date().toISOString(),
          total_messages: (this.chats[chatIndex].total_messages || 0) + 1
        }
        this.sortChats()
      }
    },
    
    updateChatInList(updatedChat) {
      if (!updatedChat || !updatedChat.id) return
      
      const index = this.chats.findIndex(chat => chat.id === updatedChat.id)
      if (index !== -1) {
        this.chats[index] = {
          ...this.chats[index],
          name: updatedChat.name,
          topic: updatedChat.topic || this.chats[index].topic,
        }
        
        // Update currentChat if needed
        if (this.currentChat && this.currentChat.id === updatedChat.id) {
          this.currentChat = {
            ...this.currentChat,
            name: updatedChat.name,
            topic: updatedChat.topic || this.currentChat.topic,
          }
        }
      }
    },

    async archiveChat(chatId) {
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'archive_chat',
            params: { chat_id: chatId }
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        if (response.data.result.success) {
          // Update chat in list
          const index = this.chats.findIndex(c => c.id === chatId)
          if (index !== -1) {
            this.chats[index].state = 'archived'
            this.chats[index].active = false
          }
          
          // Update current chat if needed
          if (this.currentChat && this.currentChat.id === chatId) {
            this.currentChat.state = 'archived'
            this.currentChat.active = false
          }
          
          return true
        } else {
          throw new Error(response.data.result.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Error archiving chat:', error)
        throw error
      }
    },

    // Tambahkan metode di chatStore
    async fetchArchivedChats() {
      this.isLoading = true
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'get_archived_chats',  // Gunakan operasi khusus untuk archived
            params: {}
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        const result = response.data.result
        
        if (result.success) {
          // Semua chat yang dikembalikan sudah pasti terarsipkan
          const archivedChats = result.chats.map(chat => ({
            ...chat,
            preview: chat.last_message || 'New conversation',
            category: chat.name.toLowerCase().includes('business') ? 'business' : 'general',
            topic_tags: this.extractTopicTags(chat)
          }))
            
          this.archivedChats = archivedChats
        } else {
          this.error = 'Failed to load archived chats: ' + result.error
        }
      } catch (error) {
        console.error('Error fetching archived chats:', error)
        this.error = 'Network error: ' + (error.response?.data?.error || error.message)
      } finally {
        this.isLoading = false
      }
    },
    
    async restoreChat(chatId) {
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'restore_chat',
            params: { chat_id: chatId }
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        if (response.data.result.success) {
          // Update chat in list
          const index = this.chats.findIndex(c => c.id === chatId)
          if (index !== -1) {
            this.chats[index].state = 'active'
            this.chats[index].active = true
          }
          
          // Update current chat if needed
          if (this.currentChat && this.currentChat.id === chatId) {
            this.currentChat.state = 'active'
            this.currentChat.active = true
          }
          
          return true
        } else {
          throw new Error(response.data.result.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Error restoring chat:', error)
        throw error
      }
    },
    
    async clearChat(chatId) {
      try {
        const response = await apiClient.post('/web/ai/chat', {
          jsonrpc: "2.0",
          method: "call",
          params: {
            operation: 'clear_chat',
            params: { chat_id: chatId }
          },
          id: Math.floor(Math.random() * 1000000)
        })
        
        if (response.data.result.success) {
          // Clear messages locally
          this.messages = []
          return true
        } else {
          throw new Error(response.data.result.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Error clearing chat:', error)
        throw error
      }
    },
    
    extractTopicTags(chat) {
      const commonTags = ['sales', 'inventory', 'finance', 'customers', 'products']
      const tags = []
      
      if (chat.topic) {
        const lowerTopic = chat.topic.toLowerCase()
        commonTags.forEach(tag => {
          if (lowerTopic.includes(tag)) {
            tags.push(tag)
          }
        })
      }
      
      return tags.length > 0 ? tags : ['general']
    },
    
    extractVisualizations(content) {
      // Logic to extract visualizations
      const visualizations = []
      
      if (content.includes('<!-- VISUALIZATION')) {
        const regex = /<!-- VISUALIZATION\s*(\{.*?\})\s*-->/gs
        let match
        
        while ((match = regex.exec(content)) !== null) {
          try {
            const vizData = JSON.parse(match[1])
            visualizations.push(vizData)
          } catch (e) {
            console.error('Error parsing visualization:', e)
          }
        }
      }
      
      return visualizations
    },
    
    extractDataSources(content) {
      // Logic to extract data sources
      const sources = []
      
      if (content.includes('Data source:')) {
        const regex = /Data source: (.*?)(\.|$|\n)/g
        let match
        
        while ((match = regex.exec(content)) !== null) {
          const source = match[1].trim()
          if (source && !sources.includes(source)) {
            sources.push(source)
          }
        }
      }
      
      return sources
    }
  }
})