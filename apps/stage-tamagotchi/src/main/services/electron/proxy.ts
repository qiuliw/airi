import type { globalAppConfigSchema } from '../../configs/global'
import type { Config } from '../../libs/electron/persistence'

import { defineInvokeHandler } from '@moeru/eventa'
import { createContext } from '@moeru/eventa/adapters/electron/main'
import { ipcMain, session } from 'electron'

import { electronProxyConfigGet, electronProxyConfigSet } from '../../../shared/eventa'

export interface ProxyConfig {
  enabled: boolean
  host: string
  port: string
}

/**
 * Maps the proxy preference to Chromium proxy rules.
 *
 * A disabled or incomplete preference means the app follows the platform proxy
 * resolution again, which inside the flatpak sandbox resolves to a direct
 * connection.
 */
export function resolveProxyRules(config: Partial<ProxyConfig> | undefined): string | undefined {
  if (!config?.enabled)
    return undefined

  const host = config.host?.trim()
  const port = config.port?.trim()
  if (!host || !port)
    return undefined

  return `${host}:${port}`
}

/**
 * Applies the user's proxy preference to the app-wide session.
 *
 * Model downloads run in the renderer through Chromium, whose proxy resolution
 * cannot see the host settings behind the flatpak sandbox, so the preference
 * is applied explicitly here.
 */
export function createProxyService(params: { config: Config<typeof globalAppConfigSchema> }) {
  const { context } = createContext(ipcMain)

  async function apply() {
    const proxyRules = resolveProxyRules(params.config.get()?.proxy)
    if (proxyRules)
      await session.defaultSession.setProxy({ proxyRules, proxyBypassRules: '<local>' })
    else
      await session.defaultSession.setProxy({ mode: 'system' })
  }

  defineInvokeHandler(context, electronProxyConfigGet, () => params.config.get()?.proxy)
  defineInvokeHandler(context, electronProxyConfigSet, async (payload) => {
    params.config.update({
      ...params.config.get(),
      proxy: payload,
    })
    await apply()
  })

  void apply()
}
