<script setup lang="ts">
import SettingsGeneralFields from '@proj-airi/stage-pages/components/settings-general-fields.vue'

import { useElectronEventaInvoke } from '@proj-airi/electron-vueuse'
import { FieldButton, FieldCheckbox, FieldInput } from '@proj-airi/ui'
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { electron, electronAppIconGet, electronAppIconSet, electronProxyConfigGet, electronProxyConfigSet } from '../../../../shared/eventa'

const { t } = useI18n()
const getHidden = useElectronEventaInvoke(electronAppIconGet)
const setHidden = useElectronEventaInvoke(electronAppIconSet)
const isLinux = useElectronEventaInvoke(electron.app.isLinux)
// The value stays undefined on Linux, and the field does not show there.
const hideAppIcon = shallowRef<boolean>()

const getProxyConfig = useElectronEventaInvoke(electronProxyConfigGet)
const setProxyConfig = useElectronEventaInvoke(electronProxyConfigSet)
const proxyEnabled = shallowRef(false)
const proxyHost = shallowRef('')
const proxyPort = shallowRef('')

onMounted(async () => {
  try {
    if (!await isLinux())
      hideAppIcon.value = await getHidden()
  }
  catch {
    toast.error(t('tamagotchi.settings.pages.system.general.hide-app-icon.load-error'))
  }

  try {
    const config = await getProxyConfig()
    proxyEnabled.value = config?.enabled ?? false
    proxyHost.value = config?.host ?? ''
    proxyPort.value = config?.port ?? ''
  }
  catch {
    toast.error(t('tamagotchi.settings.pages.system.general.proxy.load-error'))
  }
})

async function updateHidden(hidden: boolean) {
  try {
    hideAppIcon.value = await setHidden(hidden)
  }
  catch {
    toast.error(t('tamagotchi.settings.pages.system.general.hide-app-icon.save-error'))
  }
}

async function saveProxyConfig() {
  try {
    await setProxyConfig({
      enabled: proxyEnabled.value,
      host: proxyHost.value.trim(),
      port: proxyPort.value.trim(),
    })
    toast.success(t('tamagotchi.settings.pages.system.general.proxy.saved'))
  }
  catch {
    toast.error(t('tamagotchi.settings.pages.system.general.proxy.save-error'))
  }
}

async function updateProxyEnabled(enabled: boolean) {
  proxyEnabled.value = enabled
  await saveProxyConfig()
}
</script>

<template>
  <SettingsGeneralFields>
    <template #additional-fields>
      <FieldCheckbox
        v-if="hideAppIcon !== undefined"
        :model-value="hideAppIcon"
        :label="t('tamagotchi.settings.pages.system.general.hide-app-icon.title')"
        :description="t('tamagotchi.settings.pages.system.general.hide-app-icon.description')"
        @update:model-value="updateHidden"
      />
      <FieldCheckbox
        :model-value="proxyEnabled"
        :label="t('tamagotchi.settings.pages.system.general.proxy.title')"
        :description="t('tamagotchi.settings.pages.system.general.proxy.description')"
        @update:model-value="updateProxyEnabled"
      />
      <template v-if="proxyEnabled">
        <FieldInput
          v-model="proxyHost"
          :label="t('tamagotchi.settings.pages.system.general.proxy.host')"
          placeholder="127.0.0.1"
        />
        <FieldInput
          v-model="proxyPort"
          :label="t('tamagotchi.settings.pages.system.general.proxy.port')"
          placeholder="7897"
        />
        <FieldButton
          :label="t('tamagotchi.settings.pages.system.general.proxy.apply')"
          @click="saveProxyConfig"
        />
      </template>
    </template>
  </SettingsGeneralFields>
</template>

<route lang="yaml">
meta:
  layout: settings
  titleKey: settings.pages.system.general.title
  subtitleKey: settings.title
  stageTransition:
    name: slide
</route>
