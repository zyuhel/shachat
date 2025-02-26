import { computed, Ref } from 'vue'
import { useI18n, VueI18nTranslation } from 'vue-i18n'

import { NodeStatusResult } from '@/lib/nodes/abstract.node'
import { NodeStatus } from '@/lib/nodes/types'

import { mdiCubeOutline } from '@mdi/js'

type StatusColor = 'green' | 'red' | 'grey' | 'orange'
type NodeStatusDetail = {
  text: string | number
  /**
   * Icon name
   */
  icon?: string
}

function getNodeStatusTitle(node: NodeStatusResult, t: VueI18nTranslation) {
  const i18n: Record<NodeStatus, string> = {
    online: node.ping + ' ',
    offline: 'nodes.offline',
    disabled: 'nodes.inactive',
    sync: 'nodes.sync',
    unsupported_version: 'nodes.unsupported'
  }
  if (node.status === 'online') {
    return i18n[node.status]
  } else {
    const i18nKey = i18n[node.status]
    return t(i18nKey)
  }
}

function getNodeStatusDetail(
  node: NodeStatusResult,
  t: VueI18nTranslation
): NodeStatusDetail | null {
  if (!node.active || !node.online) {
    return null
  }

  if (!node.hasSupportedProtocol) {
    return {
      text: t('nodes.unsupported_reason_protocol')
    }
  } else if (!node.hasMinNodeVersion) {
    return {
      text: t('nodes.unsupported_reason_api_version')
    }
  } else if (node.online) {
    return {
      text: node.formattedHeight,
      icon: mdiCubeOutline
    }
  }

  return null
}

function getNodeStatusColor(node: NodeStatusResult) {
  const statusColorMap: Record<NodeStatus, StatusColor> = {
    online: 'green',
    unsupported_version: 'red',
    disabled: 'grey',
    offline: 'red',
    sync: 'orange'
  }

  return statusColorMap[node.status]
}

type UseNodeStatusResult = {
  nodeStatusTitle: Ref<string>
  nodeStatusDetail: Ref<NodeStatusDetail | null>
  nodeStatusColor: Ref<StatusColor>
}

export function useNodeStatus(node: Ref<NodeStatusResult>): UseNodeStatusResult {
  const { t } = useI18n()

  const nodeStatusTitle = computed(() => getNodeStatusTitle(node.value, t))
  const nodeStatusDetail = computed(() => getNodeStatusDetail(node.value, t))
  const nodeStatusColor = computed(() => getNodeStatusColor(node.value))

  return {
    nodeStatusTitle,
    nodeStatusDetail,
    nodeStatusColor
  }
}
