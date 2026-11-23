<script setup>
import { computed } from 'vue'
import { BaseEdge, getSmoothStepPath } from '@vue-flow/core'
import { RELATIONS } from './notation'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  id: String, sourceX: Number, sourceY: Number, targetX: Number, targetY: Number,
  sourcePosition: String, targetPosition: String, data: Object, selected: Boolean
})
const rel = computed(() => RELATIONS[props.data?.rel] || RELATIONS.association)
const path = computed(() => getSmoothStepPath({
  sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition,
  targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition, borderRadius: 6
}))
const color = computed(() => (props.data?.invalid ? '#dc2626' : props.selected ? '#2563eb' : '#334155'))
</script>

<template>
  <BaseEdge :id="id" :path="path[0]"
            :marker-start="rel.start ? `url(#${rel.start})` : undefined"
            :marker-end="rel.end ? `url(#${rel.end})` : undefined"
            :interaction-width="14"
            :label="data?.name || undefined" :label-x="path[1]" :label-y="path[2]"
            :label-style="{ fontSize: '11px', fill: '#334155' }"
            :style="{ stroke: color, strokeWidth: selected ? 2 : 1.3, strokeDasharray: rel.dash || undefined }" />
</template>
