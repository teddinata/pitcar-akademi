import apiClient from '../config/api'

// JSON-RPC wrapper — params nested under "params" key
async function call(endpoint, params = {}) {
  const { data } = await apiClient.post(endpoint, {
    jsonrpc: '2.0',
    method: 'call',
    params,
  })
  if (data.error) throw new Error(data.error.data?.message || 'Server error')
  const result = data.result
  if (result?.status === 'error') throw Object.assign(new Error(result.message), { code: result.code })
  return result?.data ?? result
}

// Plain JSON body — some endpoints use request.get_json_data() directly
async function callPlain(endpoint, body = {}) {
  const { data } = await apiClient.post(endpoint, body)
  if (data.error) throw new Error(data.error.data?.message || 'Server error')
  const result = data.result
  if (result?.status === 'error') throw Object.assign(new Error(result.message), { code: result.code })
  return result?.data ?? result
}

export const employeeApi = {
  // Master data (departments, positions, locations, selection fields)
  masters: () => call('/web/employees/masters'),

  // Employee CRUD
  list: (params = {}) => call('/web/employees', params),
  detail: (employeeId) => call('/web/employees/detail', { employee_id: employeeId }),
  create: (params) => call('/web/employees/create', params),
  update: (employeeId, params) => call('/web/employees/update', { employee_id: employeeId, ...params }),
  archive: (employeeId) => call('/web/employees/delete', { employee_id: employeeId }),

  // Department CRUD — backend reads request.get_json_data() directly
  createDepartment: (params) => callPlain('/web/department/create', params),
  updateDepartment: (params) => call('/web/department/update', params),
  archiveDepartment: (id) => call('/web/department/archive', { id }),

  // Position CRUD
  createPosition: (params) => callPlain('/web/position/create', params),
  updatePosition: (params) => call('/web/position/update', params),
  archivePosition: (id) => call('/web/position/archive', { id }),
}
