<template>
  <div class="mall-page">
    <el-card shadow="never">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="搜索商品名称/分类" clearable size="small" style="width:260px" @keyup.enter.native="handleQuery" />
        <el-select v-model="query.category" placeholder="分类" clearable size="small" style="width:160px;margin-left:8px">
          <el-option v-for="c in categories" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>
        <el-select v-model="query.order" placeholder="排序" clearable size="small" style="width:140px;margin-left:8px">
          <el-option label="默认" value="default" />
          <el-option label="按名称" value="name" />
          <el-option label="价格升序" value="priceAsc" />
          <el-option label="价格降序" value="priceDesc" />
        </el-select>
        <el-input v-model.number="query.minPrice" placeholder="最低价" size="small" style="width:100px;margin-left:8px" />
        <el-input v-model.number="query.maxPrice" placeholder="最高价" size="small" style="width:100px;margin-left:8px" />
        <el-button type="primary" size="small" style="margin-left:8px" @click="handleQuery">查询</el-button>
        <el-button size="small" style="margin-left:8px" @click="$router.push('/mall/cart')">购物车</el-button>
      </div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="item in list" :key="item.sellproId" style="margin-bottom:16px">
          <el-card class="product-card" :body-style="{padding:'10px'}" @click.native="openDetail(item)">
            <img :src="imgUrl(item.sellproImg || item.cover)" class="cover" />
            <div class="title">{{ item.sellproName }}</div>
            <div class="sub">产地：{{ item.sellproArea || '—' }}｜规格：{{ item.sellproGuige || '—' }}</div>
            <div class="meta">
              <span class="price">￥{{ item.price || '—' }}</span>
              <div>
                <el-button type="primary" size="mini" @click="openDetail(item)">商品详情</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <pagination v-show="total>0" :total="total" :page.sync="query.pageNum" :limit.sync="query.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import { listProducts } from '@/api/mall/product'
import { mapActions } from 'vuex'
export default {
  name: 'MallIndex',
  data() {
    return {
      query: { pageNum: 1, pageSize: 10, keyword: '', category: '', order: 'default', minPrice: undefined, maxPrice: undefined },
      list: [],
      total: 0,
      categories: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const { data } = await listProducts(this.query)
      this.list = data.rows || []
      this.total = data.total || 0
      this.categories = data.categories || this.categories
    },
    imgUrl(u) {
      if (!u) return ''
      const base = process.env.VUE_APP_BASE_API || ''
      return u.startsWith('/profile') ? `${base}${u}` : u
    },
    handleQuery() {
      this.query.pageNum = 1
      this.getList()
    },
    addToCart(row) {
      this.$store.dispatch('cart/addToCart', row)
      this.$message.success('已加入购物车')
    },
    viewTrace(row) {
      if (!row.templateId) return
      const url = `/originIndex?templateId=${row.templateId}`
      this.$router.push(url)
    },
    openDetail(row) {
      this.$router.push({ path: '/mall/detail', query: { id: row.sellproId } })
    }
  }
}
</script>

<style scoped>
.mall-page { padding: 16px; }
.cover { width: 100%; height: 160px; object-fit: cover; border-radius: 4px; }
.title { margin: 8px 0 2px; font-weight: 600; }
.sub { color: #888; font-size: 12px; margin-bottom: 6px; }
.meta { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-size: 16px; }
.toolbar { margin-bottom: 12px; }
</style> 