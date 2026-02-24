<!-- TeamPerformance.vue -->
<template>
  <!-- Loading state -->
  <div v-if="loading" class="py-4">
    <div class="animate-pulse space-y-4">
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      <div class="h-8 bg-gray-200 rounded"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>

  <!-- Content -->
  <div v-else>
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <h2 class="text-lg font-medium">Team Performance</h2>
    </div>

    <div class="space-y-6">
      <div v-for="team in teams" :key="team.id" 
        class="border-b pb-4 last:border-b-0 space-y-4"
      >
        <!-- Team Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-2 sm:space-y-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium">{{ team.name }}'s Team</p>
              <!-- Team Members Tooltip -->
              <div 
                class="relative group cursor-pointer"
                @mouseenter="showTooltip = team.id"
                @mouseleave="showTooltip = null"
              >
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <div 
                  v-if="showTooltip === team.id"
                  class="absolute left-0 z-10 w-64 p-3 mt-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg"
                >
                  <p class="font-semibold mb-2">Anggota Tim ({{ team.member_count }}):</p>
                  <div v-if="teamMembers[team.id]" class="space-y-2">
                    <div v-for="member in teamMembers[team.id]" :key="member.id" 
                      class="flex items-center"
                    >
                      <div class="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <span class="text-xs font-medium text-white">
                          {{ getInitials(member.name) }}
                        </span>
                      </div>
                      <div>
                        <div class="font-medium">{{ member.name }}</div>
                        <div class="text-xs text-gray-300">{{ member.position }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-gray-300">Loading members...</div>
                </div>
              </div>
              <span class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ team.member_count }} mekanik
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium">{{ formatCurrency(team.metrics.revenue.total) }}</p>
            <p class="text-xs text-gray-500">
              Target: {{ formatCurrency(team.metrics.revenue.target) }}
            </p>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="space-y-4">
          <!-- Revenue Achievement -->
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Achievement</span>
              <span>{{ formatPercentage(team.metrics.revenue.achievement) }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-600 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(team.metrics.revenue.achievement, 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Other Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500">Orders</p>
              <p class="font-medium">{{ team.metrics.orders.total }}</p>
              <p class="text-xs text-gray-500">
                Avg: {{ formatCurrency(team.metrics.orders.average_value) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500">Rating</p>
              <div class="flex items-center">
                <span class="font-medium">
                  {{ formatNumber(team.metrics.performance.rating, 1) }}
                </span>
                <StarIcon class="h-4 w-4 text-yellow-400 ml-1 fill-current" />
              </div>
            </div>
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500">Tingkat Ketepatan Waktu</p>
              <p class="font-medium">
                {{ formatPercentage(team.metrics.performance.on_time_rate) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <p class="text-xs text-gray-500">Labor Utilization</p>
              <div class="flex items-center flex-wrap gap-1">
                <p class="font-medium">
                  {{ formatPercentage(team.metrics.utilization?.average_utilization || 0) }}
                </p>
                <span class="text-xs text-gray-500">
                  of {{ formatPercentage(85) }} target
                </span>
              </div>
              <p class="text-xs text-gray-500">
                {{ formatNumber(team.metrics.utilization?.total_productive_hours || 0, 1) }}h productive
              </p>
            </div>
          </div>

          <!-- Completion Rates -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500">Selesai Lebih Cepat</p>
              <p class="font-medium text-green-600">
                {{ formatPercentage(team.metrics.performance.early_completion_rate) }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500">Keterlambatan Selesai</p>
              <p class="font-medium text-red-600">
                {{ formatPercentage(team.metrics.performance.late_completion_rate) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { UsersIcon, StarIcon } from '@heroicons/vue/24/outline'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'

const props = defineProps({
  teams: {
    type: Array,
    required: true,
    default: () => []
  },
  mechanics: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const showTooltip = ref(null);

// Compute team members once and store them
const teamMembers = computed(() => {
  const membersByTeam = {};
  
  if (props.mechanics && props.mechanics.length > 0) {
    props.teams.forEach(team => {
      membersByTeam[team.id] = props.mechanics.filter(
        m => m.leader?.id === team.id || m.id === team.id
      );
    });
  }
  
  return membersByTeam;
});

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};
</script>