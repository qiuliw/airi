import { describe, expect, it } from 'vitest'

import { resolveProxyRules } from './proxy'

describe('resolveProxyRules', () => {
  it('maps an enabled proxy with host and port to proxy rules', () => {
    expect(resolveProxyRules({ enabled: true, host: '127.0.0.1', port: '7897' }))
      .toBe('127.0.0.1:7897')
  })

  it('trims surrounding whitespace from the host and port', () => {
    expect(resolveProxyRules({ enabled: true, host: ' proxy.local ', port: ' 8080 ' }))
      .toBe('proxy.local:8080')
  })

  it('returns undefined when the proxy is disabled', () => {
    expect(resolveProxyRules({ enabled: false, host: '127.0.0.1', port: '7897' }))
      .toBeUndefined()
  })

  it('returns undefined for a missing host or port', () => {
    expect(resolveProxyRules({ enabled: true, host: '', port: '7897' }))
      .toBeUndefined()
    expect(resolveProxyRules({ enabled: true, host: '127.0.0.1', port: '  ' }))
      .toBeUndefined()
  })

  it('returns undefined for a missing config', () => {
    expect(resolveProxyRules(undefined)).toBeUndefined()
  })
})
