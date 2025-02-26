<template>
  <v-dialog v-model="show" :class="classes.root" width="500">
    <v-card :class="classes.root">
      <!-- Camera Waiting -->
      <v-row
        v-if="cameraStatus === 'waiting'"
        justify="center"
        align="center"
        class="pa-8"
        no-gutters
      >
        <div class="a-text-header">
          {{ t('scan.waiting_camera') }}
        </div>
        <v-progress-circular indeterminate color="primary" size="32" class="ml-4" />
      </v-row>

      <!-- Camera Active -->
      <v-row v-show="cameraStatus === 'active'" no-gutters>
        <v-col cols="12">
          <div :class="classes.camera">
            <video ref="videoElement" />
            <v-menu v-if="cameras.length > 1" offset-y :class="classes.cameraSelect">
              <template #activator="{ props }">
                <v-btn variant="text" color="white" v-bind="props">
                  <v-icon size="x-large" :icon="mdiCamera" />
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(camera, index) in cameras"
                  :key="index"
                  @click="currentCamera = index"
                  :disabled="currentCamera === index"
                >
                  <v-list-item-title>{{ camera.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-col>
        <v-col cols="12" class="pa-6">
          <h3 class="a-text-regular text-center">
            {{ t('scan.hold_your_device') }}
          </h3>
        </v-col>
      </v-row>

      <!-- No Camera || No access || No stream -->
      <v-row
        v-if="
          cameraStatus === 'nocamera' || cameraStatus === 'noaccess' || cameraStatus === 'nostream'
        "
        justify="center"
        align="center"
        class="text-center pa-8"
        no-gutters
      >
        <v-col cols="12">
          <template v-if="cameraStatus === 'nocamera'">
            <h3 class="a-text-header">
              {{ t('scan.no_camera_found') }}
            </h3>
            <p class="a-text-regular mt-1 mb-0">
              {{ t('scan.connect_camera') }}
            </p>
          </template>
          <template v-else-if="cameraStatus === 'noaccess'">
            <h3 class="a-text-header">
              {{ t('scan.no_camera_access') }}
            </h3>
            <p class="a-text-regular mt-1 mb-0">
              {{ t('scan.grant_camera_permissions') }}
            </p>
          </template>
          <template v-else-if="cameraStatus === 'nostream'">
            <h3 class="a-text-header">
              {{ t('scan.no_camera_stream') }}
            </h3>
            <p
              class="a-text-regular mt-1 mb-0"
              v-html="t('scan.no_stream_details', { noStreamDetails })"
            />
          </template>
        </v-col>
      </v-row>

      <v-divider class="a-divider" />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" class="a-btn-regular" @click="show = false">
          {{ t('scan.close_button') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import type { IScannerControls } from '@zxing/browser'

import { Scanner } from '@/lib/zxing'
import { mdiCamera } from '@mdi/js'

const className = 'qrcode-scanner-dialog'
const classes = {
  root: className,
  camera: `${className}__camera`,
  cameraSelect: `${className}__camera-select`
}

type CameraStatus = 'waiting' | 'active' | 'nocamera' | 'noaccess' | 'nostream'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['scan', 'update:modelValue'],
  setup(props, { emit }) {
    const store = useStore()
    const { t } = useI18n()

    const videoElement = ref<HTMLVideoElement | null>(null)
    const cameraStatus = ref<CameraStatus>('waiting')
    const scanner = ref<Scanner | null>(null)
    const cameras = ref<MediaDeviceInfo[]>([])
    const currentCamera = ref<number | null>(null)
    const noStreamDetails = ref<string | null>(null)
    const scannerControls = ref<IScannerControls | null>(null)

    const show = computed<boolean>({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const init = async () => {
      try {
        scanner.value = new Scanner({
          videoElement: videoElement.value!
        })

        await scanner.value.init()
        cameras.value = await scanner.value.getCameras()
      } catch (error) {
        cameraStatus.value = 'nocamera'
        onError(error as Error)
      }
    }

    const destroyScanner = () => {
      if (!scannerControls.value) return
      return scanner.value?.stop(scannerControls.value)
    }

    const onScan = (content: string) => {
      emit('scan', content)
      destroyScanner()
      show.value = false
    }

    const onError = (error: Error) => {
      store.dispatch('snackbar/show', {
        message: t('scan.something_wrong')
      })
      console.error(error)
    }

    watch(cameras, (cameras) => {
      if (cameras.length > 0) {
        currentCamera.value = cameras.length >= 2 ? 1 : 0

        cameraStatus.value = 'active'
      } else {
        cameraStatus.value = 'nocamera'
      }
    })

    watch(currentCamera, () => {
      void scanner.value?.start(
        currentCamera.value,
        (result, _, controls) => {
          if (result) onScan(result.getText()) // text is private field for zxing/browser

          if (controls) scannerControls.value = controls
        },
        (error) => {
          if (error.name === 'NotAllowedError') {
            cameraStatus.value = 'noaccess'
          } else {
            cameraStatus.value = 'nostream'
            noStreamDetails.value = `${error.name} ${error.message}`
          }

          onError(error)
        }
      )
    })

    onMounted(() => {
      init()
    })

    onBeforeUnmount(() => {
      destroyScanner()
    })

    return {
      t,
      cameras,
      cameraStatus,
      classes,
      currentCamera,
      noStreamDetails,
      props,
      show,
      videoElement,
      mdiCamera
    }
  }
})
</script>

<style lang="scss" scoped>
.qrcode-scanner-dialog {
  &__camera {
    width: 100%;
    height: 300px;
    background-color: #000;
    position: relative;

    video {
      width: inherit;
      height: inherit;
      position: absolute;
      left: 0;
      top: 0;
    }
  }

  &__camera-select {
    position: absolute;
    right: 0;
    bottom: 0;
    :deep(.v-btn) {
      min-width: auto;
      padding: 0 8px;
    }
  }
}
</style>
