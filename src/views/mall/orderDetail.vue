<template>
  <div class="order-detail-page">
    <el-card shadow="never">
      <div slot="header">订单详情</div>
      <p>订单号：{{ order.id || '-' }}</p>
      <p>下单时间：{{ formatTime(order.createTime) }}</p>
      <el-table :data="order.items || []" size="small" empty-text="暂无数据">
        <el-table-column prop="sellproName" label="商品" />
        <el-table-column prop="sellproGuige" label="规格" width="160" />
        <el-table-column label="数量" width="100" align="center">
          <template slot-scope="{ row }">{{ row.quantity }}</template>
        </el-table-column>
        <el-table-column label="单价" width="120" align="center">
          <template slot-scope="{ row }">￥{{ (row.price||0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="{ row }">￥{{ ((row.price||0)*(row.quantity||0)).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
      <div style="text-align:right;margin-top:12px">合计：<b>￥{{ amount.toFixed(2) }}</b></div>
      <div style="text-align:right;margin-top:12px">
        <el-button type="primary" @click="$router.push('/mall/index')">继续购物</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getOrderDetail } from '@/api/mall/order'
export default {
  name: 'MallOrderDetail',
  data() { return { order: {}, amount: 0 } },
  async created() {
    const id = this.$route.query.id
    if (id) {
      try {
        const { data } = await getOrderDetail(id)
        if (data && (data.items?.length || data.amount || data.id)) {
          this.order = data
          this.amount = data.amount || this.calcAmount(data.items)
          return
        }
      } catch (e) {}
    }
    // fallback: 使用刚下单时的快照
    try {
      const snap = JSON.parse(sessionStorage.getItem('last_order_snapshot') || '{}')
      this.order = snap
      this.amount = snap.amount || this.calcAmount(snap.items)
    } catch(e) {}
  },
  methods: {
    calcAmount(items) {
      if (!Array.isArray(items)) return 0
      return items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)
    },
    formatTime(t) {
      if (!t) return '-'
      try { return new Date(t).toLocaleString() } catch(e) { return t }
    }
  }
}
</script>

<style scoped>
.order-detail-page { padding: 16px; }
</style> 