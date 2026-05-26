import apiClient from '../config/api'

export async function odooRpc(model, method, args = [], kwargs = {}) {
  const { data } = await apiClient.post('/web/dataset/call_kw', {
    jsonrpc: '2.0',
    method: 'call',
    params: { model, method, args, kwargs },
  })
  if (data.error) {
    const errData = data.error.data || {}
    const msg = errData.message || errData.name || data.error.message || 'RPC Error'
    throw Object.assign(new Error(msg), { rpcError: data.error })
  }
  return data.result
}

export const orm = {
  searchRead: (model, domain, fields, opts = {}) =>
    odooRpc(model, 'search_read', [domain], {
      fields,
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
      order: opts.order ?? 'id desc',
    }),

  read: (model, ids, fields) =>
    odooRpc(model, 'read', [Array.isArray(ids) ? ids : [ids]], { fields }),

  searchCount: (model, domain) =>
    odooRpc(model, 'search_count', [domain]),

  create: (model, vals) =>
    odooRpc(model, 'create', [vals]),

  write: (model, ids, vals) =>
    odooRpc(model, 'write', [Array.isArray(ids) ? ids : [ids], vals]),

  unlink: (model, ids) =>
    odooRpc(model, 'unlink', [Array.isArray(ids) ? ids : [ids]]),

  // Call a model method (e.g. action_activate)
  call: (model, method, ids, kwargs = {}) =>
    odooRpc(model, method, [Array.isArray(ids) ? ids : [ids]], kwargs),

  // Get selection field values
  fieldsGet: (model, fields) =>
    odooRpc(model, 'fields_get', [fields], { attributes: ['selection', 'string', 'type'] }),
}
