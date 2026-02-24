import { defineStore } from 'pinia'
import { 
  ShoppingCartIcon, CubeIcon, CurrencyDollarIcon,
  UserGroupIcon, WrenchIcon
} from '@heroicons/vue/24/outline'

export const useDataStore = defineStore('data', {
  state: () => ({
    dataModules: [
      {
        name: 'Sales',
        icon: ShoppingCartIcon,
        enabled: true,
        description: 'Akses data pesanan penjualan, informasi pelanggan, dan analisis penjualan.',
        topFields: ['total', 'date_order', 'partner_id', 'state', 'amount_total'],
        totalFields: 15
      },
      {
        name: 'Inventory',
        icon: CubeIcon,
        enabled: true,
        description: 'Akses level stok produk, pergerakan, dan informasi gudang.',
        topFields: ['product_id', 'quantity', 'location_id', 'state'],
        totalFields: 12
      },
      {
        name: 'Accounting',
        icon: CurrencyDollarIcon,
        enabled: true,
        description: 'Akses faktur, pembayaran, dan laporan keuangan.',
        topFields: ['date', 'amount', 'partner_id', 'state', 'journal_id'],
        totalFields: 18
      },
      {
        name: 'CRM',
        icon: UserGroupIcon,
        enabled: false,
        description: 'Akses leads, peluang, dan pipeline pelanggan.',
        topFields: ['name', 'partner_id', 'expected_revenue', 'stage_id'],
        totalFields: 10
      },
      {
        name: 'Manufacturing',
        icon: WrenchIcon,
        enabled: false,
        description: 'Akses pesanan produksi, BOM, dan data produksi.',
        topFields: ['product_id', 'qty', 'date', 'state'],
        totalFields: 14
      }
    ]
  }),
  
  getters: {
    activeDataModules: (state) => {
      return state.dataModules.filter(module => module.enabled)
    },
    
    activeModuleNames: (state) => {
      return state.dataModules
        .filter(module => module.enabled)
        .map(module => module.name)
    }
  },
  
  actions: {
    toggleModule(moduleName, enabled) {
      const moduleIndex = this.dataModules.findIndex(m => m.name === moduleName)
      if (moduleIndex !== -1) {
        this.dataModules[moduleIndex].enabled = enabled
      }
    }
  }
})