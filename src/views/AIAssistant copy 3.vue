<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Chat History Sidebar -->
    <div 
      class="w-64 bg-white border-r flex-shrink-0 flex flex-col transition-all duration-300 h-screen fixed lg:fixed z-30"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
    >
      <div 
        class="w-64 bg-white border-r flex-shrink-0 flex flex-col transition-all duration-300 h-screen fixed lg:fixed z-30"
        :class="showSidebar ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- Sidebar Header - Fixed -->
        <div class="p-4 border-b flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">AI Business Assistant</h2>
            <button 
              class="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              @click="showSidebar = false"
            >
              <XMarkIcon class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <button
            @click="createNewChat"
            class="mt-2 w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        <!-- Filter Tabs - Fixed -->
        <div class="flex space-x-2 px-4 py-2 overflow-x-auto flex-shrink-0 border-b">
          <div 
            class="px-3 py-1 text-sm rounded-full cursor-pointer transition-colors"
            :class="currentFilter === 'all' ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600'"
            @click="toggleCategoryFilter('all')"
          >
            <ChatBubbleLeftIcon class="w-4 h-4 inline mr-1" />
            <span>All</span>
          </div>
          <div 
            class="px-3 py-1 text-sm rounded-full cursor-pointer transition-colors"
            :class="currentFilter === 'business' ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600'"
            @click="toggleCategoryFilter('business')"
          >
            <BriefcaseIcon class="w-4 h-4 inline mr-1" />
            <span>Business</span>
          </div>
          <div 
            class="px-3 py-1 text-sm rounded-full cursor-pointer transition-colors"
            :class="currentFilter === 'support' ? 'bg-blue-100 text-blue-600 font-medium' : 'bg-gray-100 text-gray-600'"
            @click="toggleCategoryFilter('support')"
          >
            <LifebuoyIcon class="w-4 h-4 inline mr-1" />
            <span>Support</span>
          </div>
        </div>

        <!-- Chat List - Scrollable Container -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div v-if="isLoading" class="flex flex-col items-center justify-center p-6 text-gray-500">
            <div class="w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-3"></div>
            <span>Loading...</span>
          </div>
          
          <div v-else-if="filteredChatList.length === 0" class="flex flex-col items-center justify-center p-6 text-gray-500">
            <p class="mb-4">No chats yet.</p>
            <button @click="createNewChat" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              Start new chat
            </button>
          </div>
          
          <button
            v-for="chat in filteredChatList"
            :key="chat.id"
            @click="selectChat(chat.id)"
            class="w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 flex items-start border-l-[3px]"
            :class="currentChat && currentChat.id === chat.id ? 'bg-gray-100 border-l-blue-500' : 'border-l-transparent'"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate mb-1">{{ chat.name }}</p>
              <p class="text-xs text-gray-500 truncate mb-1">{{ chat.preview }}</p>
              <span class="text-xs text-gray-400">{{ formatDate(chat.last_message_date) }}</span>
              
              <div v-if="chat.topic_tags && chat.topic_tags.length" class="flex flex-wrap gap-1 mt-1.5">
                <span 
                  v-for="tag in chat.topic_tags" 
                  :key="tag" 
                  class="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- Sidebar Footer - Fixed -->
        <div class="flex p-3 border-t border-gray-200 flex-shrink-0">
          <button @click="showSettings" class="flex-1 flex justify-center items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm mr-2">
            <Cog6ToothIcon class="w-4 h-4 mr-1.5" />
            Settings
          </button>
          <button @click="showArchivedChats" class="flex-1 flex justify-center items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
            <ArchiveBoxIcon class="w-4 h-4 mr-1.5" />
            Archived
          </button>
        </div>
      </div>
    </div>

    <!-- Spacer div to compensate for fixed sidebar -->
    <div class="w-64 flex-shrink-0 hidden lg:block" v-if="showSidebar"></div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Header -->
      <div class="lg:hidden flex items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <button @click="toggleSidebar" class="p-2 mr-3 text-gray-500 hover:text-gray-700">
          <Bars3Icon class="w-6 h-6" />
        </button>
        <h2 class="text-lg font-semibold text-gray-800 flex-1 truncate">
          {{ currentChat ? currentChat.name : 'AI Business Assistant' }}
        </h2>
        <div class="flex">
          <button @click="exportChat" class="p-2 text-gray-500 hover:text-gray-700" title="Export">
            <ArrowDownTrayIcon class="w-5 h-5" />
          </button>
          <button @click="clearChat" class="p-2 text-gray-500 hover:text-gray-700" title="Clear">
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Welcome screen - Redesigned to be more responsive and intuitive -->
      <div v-if="!currentChat" class="flex-1 overflow-y-auto bg-gradient-to-br from-white to-blue-50">
        <div class="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <!-- Header Section -->
          <div class="text-center mb-10">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span class="text-blue-600">AI</span> Business Assistant
            </h1>
            <p class="text-gray-600 text-lg max-w-2xl mx-auto">
              Get instant insights from your business data and answers to any questions with AI-powered assistance.
            </p>
          </div>
          
          <!-- Quick Start Cards Section -->
          <div class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Business Analysis Card -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 p-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0 bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
                    <ChartBarIcon class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Business Analysis</h3>
                    <p class="text-gray-600 mb-4">Analyze your sales, inventory, and financial data with detailed insights and visualizations.</p>
                    <button 
                      @click="createNewBusinessChat" 
                      class="w-full md:w-auto mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ChartBarIcon class="w-5 h-5 mr-2" />
                      Start Business Analysis
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- General Chat Card -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 p-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0 bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
                    <ChatBubbleLeftRightIcon class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">General Assistance</h3>
                    <p class="text-gray-600 mb-4">Get answers to any question, brainstorm ideas, or chat about anything beyond just business data.</p>
                    <button 
                      @click="createNewChat" 
                      class="w-full md:w-auto mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon class="w-5 h-5 mr-2" />
                      Start General Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Common Questions Section -->
          <div class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <SparklesIcon class="w-6 h-6 text-amber-500 mr-2" />
              Popular Questions
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="(suggestion, index) in suggestions" 
                :key="index"
                class="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                @click="startWithSuggestion(suggestion)"
              >
                <div class="flex items-center mb-2">
                  <component :is="suggestion.icon" class="w-5 h-5 text-blue-500 mr-2" />
                  <h4 class="font-medium text-gray-800">{{ suggestion.title }}</h4>
                </div>
                <p class="text-gray-600 text-sm">{{ suggestion.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Data Sources Section -->
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <ServerIcon class="w-6 h-6 text-green-500 mr-2" />
              Connected Data Sources
            </h2>
            
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div 
                  v-for="(module, index) in dataModules.slice(0, 3)" 
                  :key="index" 
                  class="p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <component :is="module.icon" class="w-5 h-5 text-gray-500 mr-2" />
                      <span class="font-medium text-gray-700">{{ module.name }}</span>
                    </div>
                    
                    <!-- Toggle switch -->
                    <div class="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        :id="'module-' + index" 
                        v-model="module.enabled"
                        @change="updateDataAccess(module, index)"
                        class="sr-only peer"
                      />
                      <label 
                        :for="'module-' + index" 
                        class="block h-6 overflow-hidden bg-gray-300 peer-checked:bg-blue-500 rounded-full cursor-pointer transition-colors"
                      >
                        <span 
                          class="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transform transition-transform peer-checked:translate-x-4"
                        ></span>
                      </label>
                    </div>
                  </div>
                  
                  <p class="text-gray-600 text-sm mb-2">{{ module.description }}</p>
                  
                  <div v-if="module.enabled" class="mt-3">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="field in module.topFields.slice(0, 3)" 
                        :key="field" 
                        class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {{ field }}
                      </span>
                      <span 
                        v-if="module.topFields.length > 3 || module.topFields.length < module.totalFields" 
                        class="px-2 py-0.5 text-xs text-blue-500 hover:underline cursor-pointer"
                        @click="showAllFields(module)"
                      >
                        + {{ (module.totalFields - (module.topFields.length < 3 ? module.topFields.length : 3)) }} fields
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="border-t border-gray-200 p-3 bg-gray-50 flex justify-between items-center">
                <span class="text-sm text-gray-500">{{ dataModules.filter(m => m.enabled).length }} of {{ dataModules.length }} modules enabled</span>
                <button 
                  @click="showSettings" 
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <Cog6ToothIcon class="w-4 h-4 mr-1" />
                  Configure Data Access
                </button>
              </div>
            </div>
          </div>
          
          <!-- Getting Started Tips -->
          <div class="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <LightBulbIcon class="w-5 h-5 mr-2" />
              Tips for Getting Started
            </h3>
            <ul class="space-y-2 text-sm text-blue-700">
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Be specific in your questions to get more accurate insights</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Use time ranges like "this month" or "last quarter" for business queries</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ask for specific visualizations such as "show me a bar chart of..."</span>
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Toggle modules on/off to control which data sources are used</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Chat messages -->
      <div v-else class="flex-1 overflow-y-auto p-5" ref="messagesContainer">
        <div v-if="isLoadingMessages" class="flex flex-col items-center justify-center h-40 text-gray-500">
          <div class="w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-3"></div>
          <span>Loading messages...</span>
        </div>
        
        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-500">
          <p>No messages yet. Start the conversation below.</p>
        </div>
        
        <div v-else class="space-y-6">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="flex gap-3 max-w-[92%] animate-fadeIn"
            :class="message.type === 'user' ? 'ml-auto flex-row-reverse' : ''"
          >
            <!-- Avatar -->
            <div 
              class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-blue-500 text-white': message.type === 'user',
                'bg-green-500 text-white': message.type === 'assistant',
                'bg-amber-500 text-white': message.type === 'system'
              }"
            >
              <UserCircleIcon v-if="message.type === 'user'" class="w-5 h-5" />
              <SparklesIcon v-else-if="message.type === 'assistant'" class="w-5 h-5" />
              <ExclamationTriangleIcon v-else class="w-5 h-5" />
            </div>
            
            <!-- Message content -->
            <div 
              class="rounded-lg p-4 flex-1 min-w-0"
              :class="{
                'bg-blue-500 text-white': message.type === 'user',
                'bg-white border border-gray-200 shadow-sm': message.type === 'assistant',
                'bg-amber-50 border border-amber-200': message.type === 'system'
              }"
            >
              <!-- Message metadata for assistant -->
              <div v-if="message.type === 'assistant'" class="flex flex-wrap gap-2 mb-2 text-xs">
                <span class="font-medium text-green-600 flex items-center">
                  {{ message.model_used || 'AI' }}
                </span>
                <!-- Tambahkan badge untuk jenis respons -->
                <span 
                v-if="message.response_type" 
                class="px-2 py-0.5 rounded-full text-xs"
                :class="{
                  'bg-blue-100 text-blue-800': message.response_type === 'BUSINESS',
                  'bg-purple-100 text-purple-800': message.response_type === 'GENERAL'
                }"
              >
                {{ message.response_type === 'BUSINESS' ? 'Business' : 'General Knowledge' }}
              </span>

              <span v-if="message.token_count" class="text-gray-400 flex items-center">
                {{ message.token_count }} tokens
              </span>
                <span v-if="message.data_sources && message.data_sources.length" class="flex items-center text-gray-500">
                  <ServerIcon class="w-3 h-3 mr-1" /> Data sources: 
                  <span v-for="source in message.data_sources" :key="source" class="ml-1 px-1.5 py-0.5 bg-gray-100 rounded">
                    {{ source }}
                  </span>
                </span>
              </div>
              
              <!-- Message text -->
              <div 
                class="prose prose-sm max-w-none"
                :class="{ 'prose-invert': message.type === 'user' }"
                v-html="formatMessage(message.content)"
              ></div>
              
              <!-- Visualizations section -->
              <div v-if="message.visualizations && message.visualizations.length" class="mt-4 space-y-4">
                <div 
                  v-for="(viz, vizIndex) in message.visualizations" 
                  :key="vizIndex" 
                  class="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div class="flex justify-between items-center bg-gray-50 px-3 py-2">
                    <span class="font-medium text-gray-700 text-sm">{{ viz.title }}</span>
                    <button @click="expandVisualization(viz)" class="p-1 text-gray-500 hover:text-gray-700">
                      <ArrowsPointingOutIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="p-4 overflow-auto max-h-[400px]" v-html="viz.content"></div>
                </div>
              </div>
              
              <!-- Message timestamp -->
              <div class="text-right mt-2">
                <span 
                  class="text-xs"
                  :class="message.type === 'user' ? 'text-blue-200' : 'text-gray-400'"
                >
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
              
              <!-- Message actions -->
              <div 
                v-if="message.type === 'assistant'" 
                class="flex mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button @click="copyToClipboard(message.content)" class="text-xs text-gray-500 hover:text-gray-700 mr-4">
                  <ClipboardDocumentIcon class="w-4 h-4 inline mr-1" /> Copy
                </button>
                <button @click="saveAsNote(message)" class="text-xs text-gray-500 hover:text-gray-700 mr-4">
                  <BookmarkIcon class="w-4 h-4 inline mr-1" /> Save as note
                </button>
                <button 
                  v-if="message.visualizations && message.visualizations.length" 
                  @click="exportVisualization(message)" 
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 inline mr-1" /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Thinking indicator -->
        <div v-if="isThinking" class="py-2">
          <div class="flex gap-3">
            <div class="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <SparklesIcon class="w-5 h-5" />
            </div>
            <div class="rounded-lg p-4 bg-white border border-gray-200 shadow-sm flex-1">
              <div class="flex items-center justify-center h-6">
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-1.5" style="animation-delay: 0.2s"></span>
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></span>
              </div>
              <div v-if="thinkingStatus" class="text-center text-sm text-gray-500 mt-1">
                {{ thinkingStatus }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <form @submit.prevent="sendMessage">
          <div class="relative bg-white border border-gray-300 rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500">
            <!-- Query builder -->
            <div v-if="dataQueryMode" class="bg-blue-50 p-4 border-b border-blue-100 rounded-t-lg">
              <div class="flex justify-between items-center mb-3">
                <span class="font-medium text-blue-700">Business Query Builder</span>
                <button type="button" @click="toggleDataQueryMode" class="p-1 text-blue-500 hover:text-blue-700">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
              
              <div class="space-y-4">
                <!-- Modules selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select data modules to include:</label>
                  <div class="flex flex-wrap gap-2">
                    <div 
                      v-for="(module, idx) in activeDataModules" 
                      :key="idx"
                      class="px-3 py-1.5 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      :class="selectedModules.includes(module.name) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                      @click="toggleModuleSelection(module.name)"
                    >
                      <component :is="module.icon" class="w-4 h-4" />
                      <span>{{ module.name }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Time range -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Time range:</label>
                  <div class="space-y-2">
                    <select 
                      v-model="queryTimeRange"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="last_3_months">Last 3 Months</option>
                      <option value="last_6_months">Last 6 Months</option>
                      <option value="this_year">This Year</option>
                      <option value="last_year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    
                    <div v-if="queryTimeRange === 'custom'" class="flex gap-2">
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">From:</label>
                        <input 
                          type="date" 
                          v-model="queryCustomStart"
                          class="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                      </div>
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">To:</label>
                        <input 
                          type="date" 
                          v-model="queryCustomEnd"
                          class="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Visualization type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Visualization type:</label>
                  <div class="flex flex-wrap gap-2">
                    <div 
                      v-for="(vizType, idx) in visualizationTypes" 
                      :key="idx"
                      class="px-3 py-1.5 rounded-md text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      :class="selectedVizType === vizType.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                      @click="selectedVizType = vizType.value"
                    >
                      <component :is="vizType.icon" class="w-4 h-4" />
                      <span>{{ vizType.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Preview -->
              <div class="mt-4 p-3 bg-white border border-gray-200 rounded-md text-sm text-blue-600">
                <p>{{ generateQueryPreview() }}</p>
              </div>
            </div>
            
            <!-- Message input -->
            <textarea 
              v-model="newMessage" 
              placeholder="Ask about your business data or type your message..." 
              class="w-full px-4 py-3 rounded-lg text-gray-800 resize-none focus:outline-none"
              :class="dataQueryMode ? 'rounded-t-none' : ''"
              rows="2"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="newMessage += '\n'"
              ref="messageInput"
              :disabled="isThinking"
            ></textarea>
            
            <!-- Input actions -->
            <div class="absolute bottom-2 right-2 flex items-center gap-2">
              <!-- Tambahkan toggle mode -->
              <div class="inline-block">
                <select 
                  v-model="queryMode" 
                  class="rounded-md border-gray-300 py-1 pl-2 pr-7 text-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="auto">Auto Detect</option>
                  <option value="business">Business Mode</option>
                  <option value="general">General Knowledge</option>
                </select>
              </div>
              <button 
                type="button" 
                @click="toggleDataQueryMode" 
                class="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title="Business Query Builder"
                :disabled="queryMode === 'general'"
              >
                <ServerIcon class="w-5 h-5" />
              </button>
              
              <div class="inline-block">
                <select 
                  v-model="selectedModel" 
                  :disabled="isThinking"
                  class="rounded-md border-gray-300 py-1 pl-2 pr-7 text-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5</option>
                  <option value="gpt-4">GPT-4 ({{ remainingGpt4 }} left)</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                :disabled="isThinking || (!newMessage.trim() && !dataQueryMode)"
              >
                <PaperAirplaneIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Settings modal -->
    <div v-if="showSettingsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black bg-opacity-40" @click="showSettingsModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col animate-fade-slide-up">
        <div class="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">AI Business Assistant Settings</h3>
          <button @click="showSettingsModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5 space-y-8">
          <!-- Model Preferences -->
          <div>
            <h4 class="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 mb-4">Model Preferences</h4>
            
            <div class="mb-5">
              <label class="block font-medium text-gray-700 mb-2">Default Model</label>
              <select 
                v-model="userSettings.default_model"
                class="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>
            
            <div class="mb-5">
              <label class="block font-medium text-gray-700 mb-2">
                Daily GPT-4 Limit: {{ userSettings.daily_gpt4_limit }}
              </label>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                <div 
                  class="h-full bg-blue-500 rounded-full" 
                  :style="{width: `${(userSettings.gpt4_usage_count / userSettings.daily_gpt4_limit) * 100}%`}"
                ></div>
              </div>
              <div class="text-xs text-gray-500 text-right">
                Used {{ userSettings.gpt4_usage_count }} of {{ userSettings.daily_gpt4_limit }}
              </div>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="fallback-setting" 
                v-model="userSettings.fallback_to_gpt35"
                class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              >
              <label for="fallback-setting" class="ml-2 text-gray-700">
                Fallback to GPT-3.5 when GPT-4 limit is reached
              </label>
            </div>
          </div>
          
          <!-- Response Settings -->
          <div>
            <h4 class="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 mb-4">Response Settings</h4>
            
            <div class="mb-5">
              <label class="block font-medium text-gray-700 mb-2">
                Temperature: {{ userSettings.temperature }}
              </label>
              <input 
                type="range" 
                v-model.number="userSettings.temperature" 
                min="0" 
                max="2" 
                step="0.1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              >
              <div class="flex justify-between text-sm text-gray-500 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div class="mb-5">
              <label class="block font-medium text-gray-700 mb-2">Max Response Length</label>
              <select 
                v-model.number="userSettings.max_tokens"
                class="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="500">Short (500 tokens)</option>
                <option value="1000">Medium (1000 tokens)</option>
                <option value="2000">Long (2000 tokens)</option>
                <option value="4000">Very Long (4000 tokens)</option>
              </select>
            </div>
          </div>
          
          <!-- Business Data Access -->
          <div>
            <h4 class="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 mb-4">Business Data Access</h4>
            
            <div class="mb-5">
              <label class="block font-medium text-gray-700 mb-2">Default Data Context</label>
              <select 
                v-model="userSettings.default_data_context"
                class="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="minimal">Minimal (Better Performance)</option>
                <option value="balanced">Balanced</option>
                <option value="comprehensive">Comprehensive (Higher Token Usage)</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">
                Controls how much Odoo data is included in each request.
              </p>
            </div>
            
            <div>
              <label class="block font-medium text-gray-700 mb-2">Data Modules Access</label>
              <div class="border border-gray-200 rounded-md overflow-hidden max-h-64 overflow-y-auto">
                <div 
                  v-for="(module, mIdx) in allDataModules" 
                  :key="mIdx" 
                  class="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0"
                >
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="module.enabled"
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-gray-700">{{ module.name }}</span>
                  </label>
                  <span class="text-xs text-gray-400">{{ module.shortDescription }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Custom Instructions -->
          <div>
            <h4 class="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 mb-4">Custom Instructions</h4>
            
            <div>
              <textarea 
                v-model="userSettings.custom_system_prompt"
                placeholder="Add custom instructions for the AI..."
                rows="5"
                class="w-full rounded-md border-gray-300 py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">
                These instructions will be added to every conversation
              </p>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            @click="resetSettings" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button 
            @click="saveSettings" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Visualization modal -->
    <div v-if="showVizModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black bg-opacity-40" @click="showVizModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-slide-up">
        <div class="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">{{ currentViz.title }}</h3>
          <button @click="showVizModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5">
          <div class="w-full h-[500px] flex items-center justify-center" v-html="currentViz.content"></div>
        </div>
        
        <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            @click="exportCurrentViz" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-1.5 inline" /> Export
          </button>
          <button 
            @click="showVizModal = false" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Export modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black bg-opacity-40" @click="showExportModal = false"></div>
      <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col animate-fade-slide-up">
        <div class="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Export Chat</h3>
          <button @click="showExportModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5 space-y-3">
          <div 
            v-for="format in exportFormats" 
            :key="format.value"
            class="flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
            :class="[
              selectedExportFormat === format.value ? 
              'border-blue-500 bg-blue-50' : 
              'border-gray-200 hover:border-blue-300'
            ]"
            @click="selectedExportFormat = format.value"
          >
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-blue-500 text-xl">
              <component :is="format.icon" class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-lg font-medium text-gray-800 mb-1">{{ format.name }}</h4>
              <p class="text-sm text-gray-500">{{ format.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            @click="showExportModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="downloadExport" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" /> Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { format } from 'date-fns'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Import Heroicons
import {
  XMarkIcon,
  PlusIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  LifebuoyIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  UserCircleIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ServerIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentIcon,
  BookmarkIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  TableCellsIcon
} from '@heroicons/vue/24/outline'
import apiClient from '@/config/api'
import { useToast } from '@/composables/useToast'

// Setup toast
const { toast, showToast } = useToast()


// State
const showSidebar = ref(window.innerWidth >= 1024)
const isLoading = ref(false)
const isLoadingMessages = ref(false)
const isThinking = ref(false)
const thinkingStatus = ref("")
const showSettingsModal = ref(false)
const showExportModal = ref(false)
const showVizModal = ref(false)
const currentViz = ref({ title: "", content: "" })
const dataQueryMode = ref(false)
const currentFilter = ref('all')
const queryMode = ref('auto')

// Chat data
const chatList = ref([])
const currentChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const selectedModel = ref('gpt-3.5-turbo')
const remainingGpt4 = ref(5)

// References
const messagesContainer = ref(null)
const messageInput = ref(null)

// Data query options
const selectedModules = ref([])
const queryTimeRange = ref('this_month')
const queryCustomStart = ref('')
const queryCustomEnd = ref('')
const selectedVizType = ref('auto')

// User settings
const userSettings = ref({
  default_model: 'gpt-3.5-turbo',
  daily_gpt4_limit: 5,
  gpt4_usage_count: 0,
  remaining_gpt4: 5,
  fallback_to_gpt35: true,
  temperature: 0.7,
  max_tokens: 2000,
  custom_system_prompt: '',
  default_data_context: 'balanced'
})

// Data access configuration
const dataModules = ref([
  {
    name: 'Sales',
    icon: ShoppingCartIcon,
    enabled: true,
    description: 'Access sales orders, customer information, and sales analytics.',
    topFields: ['total', 'date_order', 'partner_id', 'state', 'amount_total'],
    totalFields: 15
  },
  {
    name: 'Inventory',
    icon: CubeIcon,
    enabled: true,
    description: 'Access product stock levels, movements, and warehouse information.',
    topFields: ['product_id', 'quantity', 'location_id', 'state'],
    totalFields: 12
  },
  {
    name: 'Accounting',
    icon: CurrencyDollarIcon,
    enabled: true,
    description: 'Access invoices, payments, and financial reports.',
    topFields: ['date', 'amount', 'partner_id', 'state', 'journal_id'],
    totalFields: 18
  },
  {
    name: 'CRM',
    icon: UserGroupIcon,
    enabled: false,
    description: 'Access leads, opportunities, and customer pipeline.',
    topFields: ['name', 'partner_id', 'expected_revenue', 'stage_id'],
    totalFields: 10
  },
  {
    name: 'Manufacturing',
    icon: WrenchIcon,
    enabled: false,
    description: 'Access manufacturing orders, BOM, and production data.',
    topFields: ['product_id', 'qty', 'date', 'state'],
    totalFields: 14
  }
])

// For settings panel
const allDataModules = ref([
  { name: 'Sales', enabled: true, shortDescription: 'Orders, customers, performance' },
  { name: 'Invoicing', enabled: true, shortDescription: 'Invoices, payments' },
  { name: 'Inventory', enabled: true, shortDescription: 'Products, stock, movements' },
  { name: 'CRM', enabled: false, shortDescription: 'Leads, opportunities' },
  { name: 'Purchasing', enabled: false, shortDescription: 'Purchase orders, vendors' },
  { name: 'Manufacturing', enabled: false, shortDescription: 'Production, BOM' },
  { name: 'HR', enabled: false, shortDescription: 'Employees, attendance' },
  { name: 'Projects', enabled: false, shortDescription: 'Tasks, timesheets' }
])

// Visualization types
const visualizationTypes = ref([
  { label: 'Auto', value: 'auto', icon: WrenchScrewdriverIcon },
  { label: 'Bar Chart', value: 'bar', icon: ChartBarSquareIcon },
  { label: 'Line Chart', value: 'line', icon: ChartBarIcon },
  { label: 'Pie Chart', value: 'pie', icon: ChartPieIcon },
  { label: 'Table', value: 'table', icon: TableCellsIcon }
])

// Export options
const selectedExportFormat = ref('json')
const exportFormats = ref([
  {
    name: 'JSON',
    value: 'json',
    icon: 'CodeBracketIcon',
    description: 'Complete data with all metadata'
  },
  {
    name: 'Text',
    value: 'txt',
    icon: 'DocumentTextIcon',
    description: 'Simple text format'
  },
  {
    name: 'HTML',
    value: 'html',
    icon: 'CodeBracketSquareIcon',
    description: 'Formatted web page'
  },
  {
    name: 'Markdown',
    value: 'markdown',
    icon: 'DocumentIcon',
    description: 'Markdown document'
  },
  {
    name: 'CSV',
    value: 'csv',
    icon: 'TableCellsIcon',
    description: 'Data in CSV format'
  }
])

// Suggestions for new chats
const suggestions = ref([
  {
    title: 'Monthly Sales Analysis',
    description: 'Get insights on your sales performance over time',
    icon: ChartBarIcon,
    prompt: 'Analyze my company\'s sales performance for the last 3 months. Show trends, top products, and any notable changes.'
  },
  {
    title: 'Inventory Status',
    description: 'Check stock levels and identify low stock items',
    icon: CubeIcon,
    prompt: 'Give me a report on my current inventory status. Highlight products with low stock levels and suggest reordering options.'
  },
  {
    title: 'Customer Insights',
    description: 'Analyze customer behavior and purchases',
    icon: UserGroupIcon,
    prompt: 'Who are my top 5 customers based on revenue? What products do they usually buy, and how frequently do they order?'
  },
  {
    title: 'Financial Summary',
    description: 'Get a quick overview of financial performance',
    icon: CurrencyDollarIcon,
    prompt: 'Provide a summary of my financial performance this month compared to last month. Include revenue, expenses, and profit margin.'
  }
])

// Computed properties
const filteredChatList = computed(() => {
  if (currentFilter.value === 'all') {
    return chatList.value
  }
  return chatList.value.filter(chat => 
    chat.category === currentFilter.value || 
    (chat.topic_tags && chat.topic_tags.includes(currentFilter.value))
  )
})

const activeDataModules = computed(() => {
  return dataModules.value.filter(module => module.enabled)
})


// Core functions
async function fetchChatList() {
  isLoading.value = true
  try {
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'get_chat_list',
        params: {}
      },
      id: Math.floor(Math.random() * 1000000)
    })
    
    const result = response.data.result
    
    if (result.success) {
      // Pastikan chat list diupdate dengan benar
      console.log('Chat list received:', result.chats)
      
      chatList.value = result.chats.map(chat => ({
        ...chat,
        preview: chat.last_message || 'New conversation',
        pinned: false,
        category: chat.name.toLowerCase().includes('business') ? 'business' : 'general',
        topic_tags: extractTopicTags(chat)
      }))
      
      sortChatList()
    } else {
      showError('Failed to load chat list: ' + result.error)
    }
  } catch (error) {
    console.error('Error fetching chat list:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  } finally {
    isLoading.value = false
  }
}


function detectChatCategory(chat) {
  // This is a simplified version - in production, you'd implement
  // more sophisticated classification based on chat content
  if (chat.topic && chat.topic.toLowerCase().includes('sales')) {
    return 'business'
  } else if (chat.topic && chat.topic.toLowerCase().includes('help')) {
    return 'support'
  }
  return 'general'
}

function extractTopicTags(chat) {
  // This would be implemented with a more sophisticated algorithm in production
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
}

function sortChatList() {
  chatList.value.sort((a, b) => {
    // Pinned chats first
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    
    // Then sort by last message date
    return new Date(b.last_message_date || b.created_at) - 
           new Date(a.last_message_date || a.created_at)
  })
}

async function fetchUserSettings() {
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
    
    const result = response.data.result // Perhatikan perubahan disini
    
    if (result.success) {
      userSettings.value = {
        ...result.settings,
        default_data_context: result.settings.default_data_context || 'balanced'
      }
      
      selectedModel.value = result.settings.default_model
      remainingGpt4.value = result.settings.remaining_gpt4
    } else {
      showError('Failed to load settings: ' + result.error)
    }
  } catch (error) {
    console.error('Error fetching user settings:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  }
}



async function selectChat(chatId) {
  if (currentChat.value && currentChat.value.id === chatId) return
  
  isLoadingMessages.value = true
  messages.value = []
  
  try {
    console.log('Selecting chat with ID:', chatId)
    
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
    console.log('Chat messages response:', result)
    
    if (result.success) {
      currentChat.value = result.chat
      
      messages.value = result.messages.map(message => {
        if (message.type === 'assistant' && message.content) {
          message.visualizations = extractVisualizations(message.content)
          message.data_sources = extractDataSources(message.content)
        }
        return message
      })
      
      if (window.innerWidth < 768) {
        showSidebar.value = false
      }
      
      await nextTick()
      scrollToBottom()
      
      if (messageInput.value) {
        messageInput.value.focus()
      }
    } else {
      showError('Failed to load messages: ' + result.error)
    }
  } catch (error) {
    console.error('Error selecting chat:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  } finally {
    isLoadingMessages.value = false
  }
}

// Extract visualization data from a message
function extractVisualizations(content) {
  // This is a simplified version - in production, you'd implement
  // more sophisticated extraction of visualization blocks
  const visualizations = []
  
  // Check for special visualization markers (this is just an example approach)
  // In a real implementation, you might use regex or properly formatted JSON blocks
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
}

// Extract data sources from the message
function extractDataSources(content) {
  // This is a simplified version - in production, you'd implement
  // more sophisticated extraction
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

async function createNewChat() {
  isLoading.value = true
  
  try {
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'create_chat',
        params: {
          name: `Chat ${new Date().toLocaleDateString()}`
        }
      }
    })
    
    const result = response.data
    
    if (result.success) {
      const newChat = {
        id: result.chat_id,
        name: result.name,
        last_message_date: new Date().toISOString(),
        preview: 'New conversation',
        total_messages: 0,
        total_tokens: 0,
        pinned: false,
        category: 'general',
        topic_tags: ['general']
      }
      
      chatList.value.unshift(newChat)
      sortChatList()
      
      await selectChat(result.chat_id)
      
      if (window.innerWidth < 768) {
        showSidebar.value = false
      }
    } else {
      showError('Failed to create new chat: ' + result.error)
    }
  } catch (error) {
    console.error('Error creating chat:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  } finally {
    isLoading.value = false
  }
}


// Create a new chat specifically for business analysis
async function createNewBusinessChat() {
  isLoading.value = true
  
  try {
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
        params: {
        operation: 'create_chat',
        params: {
          name: `Business Analysis ${new Date().toLocaleDateString()}`,
          category: 'business'
        }
      }
    })
    
    const result = response.data
    
    if (result.success) {
      const newChat = {
        id: result.chat_id,
        name: result.name,
        last_message_date: new Date().toISOString(),
        preview: 'New business analysis',
        total_messages: 0,
        total_tokens: 0,
        pinned: false,
        category: 'business',
        topic_tags: ['business', 'analysis']
      }
      
      chatList.value.unshift(newChat)
      sortChatList()
      
      await selectChat(result.chat_id)
      
      toggleDataQueryMode()
      
      if (window.innerWidth < 768) {
        showSidebar.value = false
      }
    } else {
      showError('Failed to create business chat: ' + (result.error || 'Unknown error'))
    }
  } catch (error) {
    console.error("Error creating business chat:", error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  } finally {
    isLoading.value = false
  }
}


async function sendMessage() {
  if (!currentChat.value || (!newMessage.value.trim() && !dataQueryMode.value) || isThinking.value) return
  
  const messageContent = dataQueryMode.value ? 
    generateQueryPreview() : 
    newMessage.value.trim()
  
  // Tambahkan log untuk debug
  console.log('Sending message to chat ID:', currentChat.value.id)
  console.log('Message content:', messageContent)
  console.log('Selected model:', selectedModel.value)
  
  newMessage.value = ''
  isThinking.value = true
  thinkingStatus.value = dataQueryMode.value ? "Analyzing business data..." : "Thinking..."
  
  if (dataQueryMode.value) {
    dataQueryMode.value = false
  }
  
  // Tambahkan pesan pengguna ke daftar sebelum mengirim ke server
  messages.value.push({
    id: Date.now(),
    message_id: 'temp-' + Date.now(),
    content: messageContent,
    type: 'user',
    timestamp: new Date().toISOString()
  })
  
  await nextTick()
  scrollToBottom()
  
  try {
    const requestParams = {
      chat_id: currentChat.value.id,
      message: messageContent,
      model: selectedModel.value,
      query_mode: queryMode.value // Tambahkan parameter ini
    }
    
    // Log parameter untuk debug
    console.log('Request params:', requestParams)
    
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'send_message',
        params: requestParams
      },
      id: Math.floor(Math.random() * 1000000)
    })
    
    // Log response untuk debug
    console.log('Server response:', response.data)
    
    const result = response.data.result
    
    if (result.success) {
      const responseContent = result.response.content
      const visualizations = extractVisualizations(responseContent)
      const dataSources = extractDataSources(responseContent)
      
      messages.value.push({
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
      
      if (result.response.model_used && result.response.model_used.startsWith('gpt-4')) {
        fetchUserSettings()
      }
      
      updateChatListPreview(currentChat.value.id, messageContent)
      
      await nextTick()
      scrollToBottom()
    } else {
      messages.value.push({
        id: Date.now(),
        message_id: 'error-' + Date.now(),
        content: `Error: ${result.error}`,
        type: 'system',
        timestamp: new Date().toISOString()
      })
      showError('Failed to get response: ' + result.error)
    }
  } catch (error) {
    console.error('Error sending message:', error)
    
    messages.value.push({
      id: Date.now(),
      message_id: 'error-' + Date.now(),
      content: `Network error: ${error.message || 'Unable to connect to the server'}`,
      type: 'system',
      timestamp: new Date().toISOString()
    })
    showError('Network error: ' + (error.response?.data?.error || error.message))
  } finally {
    isThinking.value = false
    thinkingStatus.value = ""
    
    await nextTick()
    scrollToBottom()
    if (messageInput.value) {
      messageInput.value.focus()
    }
  }
}


function updateChatListPreview(chatId, message) {
  const chatIndex = chatList.value.findIndex(chat => chat.id === chatId)
  if (chatIndex !== -1) {
    // Update chat details
    chatList.value[chatIndex] = {
      ...chatList.value[chatIndex],
      preview: message,
      last_message_date: new Date().toISOString(),
      total_messages: (chatList.value[chatIndex].total_messages || 0) + 1
    }
    
    // Re-analyze the chat category and tags based on new content
    chatList.value[chatIndex].category = detectChatCategory(chatList.value[chatIndex])
    chatList.value[chatIndex].topic_tags = extractTopicTags(chatList.value[chatIndex])
    
    // Sort chat list by last message date
    sortChatList()
  }
}

async function archiveChat(chatId) {
  if (!confirm('Are you sure you want to archive this chat?')) return
  
  try {
    const response = await apiClient.post('/web/ai/chat', {
      operation: 'archive_chat',
      params: { chat_id: chatId }
    })
    
    const result = response.data
    
    if (result.success) {
      chatList.value = chatList.value.filter(chat => chat.id !== chatId)
      
      if (currentChat.value && currentChat.value.id === chatId) {
        currentChat.value = null
        messages.value = []
      }
      
      showNotification('Chat archived successfully')
    } else {
      showError('Failed to archive chat: ' + result.error)
    }
  } catch (error) {
    console.error('Error archiving chat:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  }
}


function showArchivedChats() {
  // This would show a modal with archived chats that can be restored
  showNotification('Archived chats feature coming soon')
  // In a real implementation, you'd fetch archived chats and display them
}

// Pin/unpin a chat to the top of the list
function pinChat(chatId) {
  const chatIndex = chatList.value.findIndex(chat => chat.id === chatId)
  if (chatIndex !== -1) {
    // Toggle pinned state
    chatList.value[chatIndex].pinned = !chatList.value[chatIndex].pinned
    // Re-sort the list to move pinned chats to top
    sortChatList()
  }
}

async function clearChat() {
  if (!currentChat.value) return
  if (!confirm('Are you sure you want to clear all messages? This cannot be undone.')) return
  
  try {
    const response = await apiClient.post('/web/ai/chat', {
      operation: 'clear_chat',
      params: { chat_id: currentChat.value.id }
    })
    
    const result = response.data
    
    if (result.success) {
      messages.value = []
      
      updateChatListPreview(currentChat.value.id, 'New conversation')
      
      showNotification('Chat cleared successfully')
    } else {
      showError('Failed to clear chat: ' + result.error)
    }
  } catch (error) {
    console.error('Error clearing chat:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  }
}



function exportChat() {
  if (!currentChat.value) return
  showExportModal.value = true
}

async function downloadExport() {
  if (!currentChat.value) return
  
  try {
    const response = await apiClient.post('/web/ai/chat', {
      operation: 'export_chat',
      params: {
        chat_id: currentChat.value.id,
        format: selectedExportFormat.value
      }
    })
    
    const result = response.data
    
    if (result.success) {
      let mimeType
      switch (selectedExportFormat.value) {
        case 'json': mimeType = 'application/json'; break
        case 'txt': mimeType = 'text/plain'; break
        case 'html': mimeType = 'text/html'; break
        case 'markdown': mimeType = 'text/markdown'; break
        case 'csv': mimeType = 'text/csv'; break
        default: mimeType = 'application/json'
      }
      
      const blob = new Blob(
        [typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)], 
        { type: mimeType }
      )
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showExportModal.value = false
      
      showNotification('Export downloaded successfully')
    } else {
      showError('Failed to export chat: ' + result.error)
    }
  } catch (error) {
    console.error('Error exporting chat:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  }
}


function getMimeType() {
  switch (selectedExportFormat.value) {
    case 'json': return 'application/json';
    case 'txt': return 'text/plain';
    case 'html': return 'text/html';
    case 'markdown': return 'text/markdown';
    case 'csv': return 'text/csv';
    default: return 'application/json';
  }
}

function showSettings() {
  showSettingsModal.value = true
}

async function saveSettings() {
  try {
    const settingsToSend = {
      ...userSettings.value,
      data_modules: allDataModules.value.filter(m => m.enabled).map(m => m.name)
    }
    
    const response = await apiClient.post('/web/ai/chat', {
      jsonrpc: "2.0",
      method: "call",
      params: {
        operation: 'update_settings',
        params: settingsToSend
      }
    })
    
    const result = response.data
    
    if (result.success) {
      userSettings.value = result.settings
      selectedModel.value = result.settings.default_model
      remainingGpt4.value = result.settings.remaining_gpt4
      showSettingsModal.value = false
      
      showNotification('Settings saved successfully')
    } else {
      showError('Failed to save settings: ' + result.error)
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    showError('Network error: ' + (error.response?.data?.error || error.message))
  }
}


function resetSettings() {
  // Reset to original settings
  fetchUserSettings()
  showNotification('Settings reset to defaults')
}

// Business query builder methods
function toggleDataQueryMode() {
  dataQueryMode.value = !dataQueryMode.value
  
  if (dataQueryMode.value) {
    // Reset selected modules to default enabled ones
    selectedModules.value = activeDataModules.value.map(m => m.name)
  }
}

function toggleModuleSelection(moduleName) {
  const index = selectedModules.value.indexOf(moduleName)
  if (index === -1) {
    selectedModules.value.push(moduleName)
  } else {
    selectedModules.value.splice(index, 1)
  }
}

function generateQueryPreview() {
  // Generate a natural language query based on selected options
  let query = "Analyze "
  
  // Add modules
  if (selectedModules.value.length === 0) {
    query += "my business data"
  } else if (selectedModules.value.length === 1) {
    query += `my ${selectedModules.value[0].toLowerCase()} data`
  } else {
    const lastModule = selectedModules.value.pop()
    query += `my ${selectedModules.value.join(', ').toLowerCase()} and ${lastModule.toLowerCase()} data`
    selectedModules.value.push(lastModule) // Restore the array
  }
  
  // Add time range
  switch (queryTimeRange.value) {
    case 'this_month':
      query += " for this month"
      break
    case 'last_month':
      query += " for last month"
      break
    case 'last_3_months':
      query += " for the last 3 months"
      break
    case 'last_6_months':
      query += " for the last 6 months"
      break
    case 'this_year':
      query += " for this year"
      break
    case 'last_year':
      query += " for last year"
      break
    case 'custom':
      query += ` from ${queryCustomStart.value} to ${queryCustomEnd.value}`
      break
  }
  
  // Add visualization preference
  if (selectedVizType.value !== 'auto') {
    query += `. Show the results as a ${selectedVizType.value} chart`
  } else {
    query += ". Please include appropriate visualizations"
  }
  
  return query
}

// Visualization methods
function expandVisualization(viz) {
  currentViz.value = viz
  showVizModal.value = true
}

function exportVisualization(message) {
  // This would allow exporting a specific visualization
  showNotification('Visualization export feature coming soon')
  // In a real implementation, you'd generate and download the viz
}

function exportCurrentViz() {
  // Export the currently displayed visualization
  showNotification('Visualization export feature coming soon')
}

// Utility methods
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showNotification('Copied to clipboard'))
    .catch(err => showError('Failed to copy: ' + err))
}

function saveAsNote(message) {
  // This would save the message as a note in Odoo
  showNotification('Save as note feature coming soon')
  // In a real implementation, you'd create a note in Odoo
}

function toggleCategoryFilter(category) {
  currentFilter.value = category
}

function updateDataAccess(module, index) {
  // Update corresponding module in the all modules list
  const allModulesIndex = allDataModules.value.findIndex(m => m.name === module.name)
  if (allModulesIndex !== -1) {
    allDataModules.value[allModulesIndex].enabled = module.enabled
  }
}

function startWithSuggestion(suggestion) {
  // Create new chat with suggestion as first message
  createNewBusinessChat().then(() => {
    newMessage.value = suggestion.prompt
    sendMessage()
  })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleResponsiveDisplay() {
  showSidebar.value = window.innerWidth >= 768
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

function formatMessage(content) {
  // Tambahkan deteksi indikator jenis respons
  let formattedContent = content
  
  // Hapus indikator dari konten jika ada
  if (content.includes('[RESPONSE_TYPE:')) {
    const match = content.match(/\[RESPONSE_TYPE:\s*(.*?)\]/)
    if (match) {
      responseType = match[1] // 'BUSINESS' atau 'GENERAL'
      formattedContent = content.replace(match[0], '')
    }
  }
  
  // Gunakan DOMPurify dan marked untuk format markdown
  const html = marked(formattedContent)
  return DOMPurify.sanitize(html)
}


function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return format(date, 'MMM d, yyyy')
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return format(date, 'h:mm a')
}

function getAvatarIcon(type) {
  switch (type) {
    case 'user': return UserCircleIcon
    case 'assistant': return SparklesIcon
    case 'system': return ExclamationTriangleIcon
    default: return ChatBubbleLeftIcon
  }
}

function getFormattedDate(daysOffset) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
}

function showError(message) {
  console.error('Error:', message)
  showToast({
    message: message,
    type: 'error',
    duration: 5000
  })
}


function showNotification(message) {
  console.log('Success:', message)
  showToast({
    message: message,
    type: 'success'
  })
}

watch(showSidebar, (newValue) => {
  if (newValue && window.innerWidth < 1024) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// OnMounted and lifecycle hooks
onMounted(() => {
  fetchChatList()
  fetchUserSettings()
  
  // Initialize date ranges
  queryCustomStart.value = getFormattedDate(-30)
  queryCustomEnd.value = getFormattedDate(0)
  
  // Handle responsive sidebar
  handleResponsiveDisplay()
  window.addEventListener('resize', handleResponsiveDisplay)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResponsiveDisplay)
})
</script>

<style>
.sidebar-transition {
  transition: transform 0.3s ease;
}
/* Add custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-fade-slide-up {
  animation: fadeSlideUp 0.3s ease-out;
}

/* Add styles for markdown content */
.prose {
  color: inherit;
  max-width: 65ch;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
  font-weight: 500;
}

.prose strong {
  font-weight: 600;
  color: inherit;
}

.prose ol {
  counter-reset: list-counter;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose ul {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose ol > li {
  position: relative;
  counter-increment: list-counter;
  padding-left: 1.75em;
}

.prose ol > li::before {
  content: counter(list-counter) ".";
  position: absolute;
  font-weight: 400;
  color: #6b7280;
  left: 0;
}

.prose ul > li {
  position: relative;
  padding-left: 1.75em;
}

.prose ul > li::before {
  content: "";
  position: absolute;
  background-color: #d1d5db;
  border-radius: 50%;
  width: 0.375em;
  height: 0.375em;
  top: 0.6875em;
  left: 0.25em;
}

.prose hr {
  border-color: #e5e7eb;
  margin-top: 3em;
  margin-bottom: 3em;
}

.prose blockquote {
  font-weight: 500;
  font-style: italic;
  color: #111827;
  border-left-width: 0.25rem;
  border-left-color: #e5e7eb;
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-left: 1em;
}

.prose h1 {
  color: #111827;
  font-weight: 800;
  font-size: 2.25em;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
}

.prose h2 {
  color: #111827;
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}

.prose h3 {
  color: #111827;
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}

.prose h4 {
  color: #111827;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5;
}

.prose figure {
  margin-top: 2em;
  margin-bottom: 2em;
}

.prose figure > * {
  margin-top: 0;
  margin-bottom: 0;
}

.prose img {
  margin-top: 2em;
  margin-bottom: 2em;
}

.prose video {
  margin-top: 2em;
  margin-bottom: 2em;
}

.prose figure figcaption {
  color: #6b7280;
  font-size: 0.875em;
  line-height: 1.4285714;
  margin-top: 0.8571429em;
}

.prose code {
  color: #111827;
  font-weight: 600;
  font-size: 0.875em;
}

.prose code::before {
  content: "`";
}

.prose code::after {
  content: "`";
}

.prose pre {
  color: #e5e7eb;
  background-color: #1f2937;
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}

.prose pre code {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: 400;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}

.prose pre code::before {
  content: none;
}

.prose pre code::after {
  content: none;
}

.prose table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}

.prose thead {
  color: #111827;
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: #d1d5db;
}

.prose thead th {
  vertical-align: bottom;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}

.prose tbody tr {
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
}

.prose tbody tr:last-child {
  border-bottom-width: 0;
}

.prose tbody td {
  vertical-align: top;
  padding: 0.5714286em;
}

/* Adjust for light or dark text */
.prose-invert {
  color: white;
}

.prose-invert a {
  color: #93c5fd;
}

.prose-invert strong {
  color: white;
}

.prose-invert ol > li::before {
  color: #9ca3af;
}

.prose-invert ul > li::before {
  background-color: #6b7280;
}

.prose-invert hr {
  border-color: #374151;
}

.prose-invert blockquote {
  color: #f3f4f6;
  border-left-color: #374151;
}

.prose-invert h1,
.prose-invert h2,
.prose-invert h3,
.prose-invert h4 {
  color: white;
}

.prose-invert figure figcaption {
  color: #9ca3af;
}

.prose-invert code {
  color: white;
}

.prose-invert thead {
  color: white;
  border-bottom-color: #4b5563;
}

.prose-invert tbody tr {
  border-bottom-color: #374151;
}

/* Make prose compact for small screens */
.prose-sm {
  font-size: 0.875rem;
}

.prose-sm p {
  margin-top: 1em;
  margin-bottom: 1em;
}

.prose-sm h2 {
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
}

.prose-sm h3 {
  font-size: 1.125em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

/* Reset code blocks so they don't inherit prose styles */
.prose pre {
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}
</style>

