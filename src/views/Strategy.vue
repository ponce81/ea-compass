<script setup>
import { computed } from 'vue'
import { db, invTotal } from '../store'
import { money } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const goals = computed(() => db.goals.map(g => {
  const invs = db.investments.filter(i => i.goalIds.includes(g.id))
  const progress = Math.abs(g.current - g.baseline) / Math.abs(g.target - g.baseline)
  return { ...g, invs, total: invs.reduce((s, i) => s + invTotal(i), 0), progress, drivers: g.driverIds.map(id => db.drivers.find(d => d.id === id)) }
}))
const unaligned = computed(() => db.investments.filter(i => !i.goalIds.length))
</script>

<template>
  <PageHead eyebrow="Preliminary · Phase A – Architecture Vision" title="Strategy & Motivation" color="var(--c-motivation)"
            subtitle="Drivers, goals and KPIs that justify architecture change. Every investment should trace back to at least one goal." />

  <div class="card">
    <div class="card-head"><div><h2>Drivers</h2><p>Internal and external forces motivating change</p></div></div>
    <div class="row">
      <div v-for="d in db.drivers" :key="d.id" class="chip" style="cursor:default">
        <Tag :value="d.type" :t="d.type === 'Regulatory' ? 'red' : d.type === 'External' ? 'amber' : 'blue'" /> {{ d.name }}
      </div>
    </div>
  </div>

  <div class="grid g-2 mt">
    <div v-for="g in goals" :key="g.id" class="card">
      <div class="card-head">
        <div><div class="subtle">{{ g.id }}</div><h2>{{ g.name }}</h2><p>{{ g.description }}</p></div>
        <div class="right"><div class="subtle">Linked investments</div><div class="strong" style="font-size:18px">{{ money(g.total) }}</div></div>
      </div>
      <div class="row between small"><span class="muted">{{ g.kpi }}</span>
        <span>Baseline <b>{{ g.baseline }}{{ g.unit }}</b> · Current <b>{{ g.current }}{{ g.unit }}</b> · Target <b>{{ g.target }}{{ g.unit }}</b></span></div>
      <div class="progress" style="margin:6px 0 14px"><div :style="{ width: Math.max(3, g.progress * 100) + '%', background: 'var(--c-motivation)' }" /></div>
      <div class="subtle" style="margin-bottom:6px">Drivers</div>
      <div class="row" style="margin-bottom:12px"><span v-for="d in g.drivers" :key="d.id" class="tag t-grey">{{ d.name }}</span></div>
      <div class="subtle" style="margin-bottom:6px">Investments contributing ({{ g.invs.length }})</div>
      <div class="row"><EntityChip v-for="i in g.invs" :key="i.id" type="investment" :id="i.id" /></div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Traceability check</h2><p>Investments without strategic alignment</p></div></div>
      <div v-if="!unaligned.length" class="alert ok">All {{ db.investments.length }} investments are linked to at least one strategic goal.</div>
      <div v-else class="stack"><EntityChip v-for="i in unaligned" :key="i.id" type="investment" :id="i.id" /></div>
    </div>
  </div>
</template>
