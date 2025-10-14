<template>
  <div class="cart-page">
    <el-card shadow="never">
      <el-table :data="items" size="small" empty-text="购物车为空">
        <el-table-column label="商品" min-width="220">
          <template slot-scope="{ row }">
            <div class="cell-flex">
              <img :src="row.sellproImg" class="thumb" />
              <div>
                <div class="name">{{ row.sellproName }}</div>
                <div class="sub">规格：{{ row.sellproGuige || '—' }}｜产地：{{ row.sellproArea || '—' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="120" align="center">
          <template slot-scope="{ row }">￥{{ (row.price||0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="数量" width="160" align="center">
          <template slot-scope="{ row }">
            <el-input-number class="qty-input" size="small" :min="1" :max="999" v-model="row.quantity" @change="updateQty(row)" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="{ row }">￥{{ ((row.price||0)*row.quantity).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <div>
          合计：<span class="amount">￥{{ amount.toFixed(2) }}</span>（共 {{ count }} 件）
        </div>
        <div>
          <el-button @click="$router.push('/mall/index')">继续购物</el-button>
          <el-button type="primary" :disabled="items.length===0" @click="checkout">去结算</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createOrder } from '@/api/mall/order'
export default {
  name: 'MallCart',
  computed: {
    ...mapGetters('cart', ['cartItems', 'cartCount', 'cartAmount']),
    items() { return this.cartItems },
    count() { return this.cartCount },
    amount() { return this.cartAmount }
  },
  methods: {
    updateQty(row) { this.$store.dispatch('cart/updateQty', { id: row.sellproId, quantity: row.quantity }) },
    remove(row) { this.$store.dispatch('cart/removeFromCart', row.sellproId) },
    async checkout() {
      const { data, msg } = await createOrder({ items: this.items })
      this.$message.success(msg || '下单成功')
      const snapshot = { id: data.id, items: this.items, amount: this.amount, createTime: new Date() }
      sessionStorage.setItem('last_order_snapshot', JSON.stringify(snapshot))
      this.$store.dispatch('cart/clearCart')
      this.$router.push({ path: '/mall/order/detail', query: { id: data.id } })
    }
  }
}
</script>

<style scoped>
.cart-page { padding: 16px; }
.cell-flex { display: flex; align-items: center; }
.thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 4px; margin-right: 8px; }
.footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; }
.amount { color: #f56c6c; font-weight: 600; }
.qty-input { width: 120px; }
</style> 