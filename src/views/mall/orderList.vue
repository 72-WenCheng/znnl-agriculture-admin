<template>
  <div class="order-list-page">
    <el-card shadow="never">
      <el-table :data="list" size="small">
        <el-table-column prop="id" label="订单号" min-width="220" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="amount" label="金额" width="120" align="center">
          <template slot-scope="{ row }">￥{{ (row.amount||0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="260">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="$router.push({ path: '/mall/order/detail', query: { id: row.id } })">详情</el-button>
            <el-button size="mini" @click="doAction(row,'pay')" :disabled="row.status!=='CREATED'">支付</el-button>
            <el-button size="mini" @click="doAction(row,'ship')" :disabled="row.status!=='PAID'">发货</el-button>
            <el-button size="mini" @click="doAction(row,'finish')" :disabled="row.status!=='SHIPPED'">完成</el-button>
            <el-button size="mini" type="danger" @click="doAction(row,'cancel')" :disabled="row.status!=='CREATED'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="query.pageNum" :limit.sync="query.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import { listOrders, updateOrderStatus } from '@/api/mall/order'
export default {
  name: 'MallOrderList',
  data() {
    return { list: [], total: 0, query: { pageNum: 1, pageSize: 10 } }
  },
  created() { this.getList() },
  methods: {
    async getList() {
      const { rows, total } = await listOrders(this.query)
      this.list = rows || []
      this.total = total || 0
    },
    async doAction(row, action) {
      await updateOrderStatus(row.id, action)
      this.$message.success('操作成功')
      this.getList()
    }
  }
}
</script>

<style scoped>
.order-list-page { padding: 16px; }
</style> 