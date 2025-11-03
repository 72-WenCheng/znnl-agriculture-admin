<template>
  <div class="detail-page">
    <el-row :gutter="16">
      <el-col :md="10" :xs="24">
        <el-card shadow="never">
          <img :src="imgUrl(product.sellproImg)" class="cover" />
        </el-card>
      </el-col>
      <el-col :md="14" :xs="24">
        <el-card shadow="never">
          <h2 class="title">{{ product.sellproName }}</h2>
          <p class="sub">产地：{{ product.sellproArea || '—' }}｜规格：{{ product.sellproGuige || '—' }}</p>
          <div class="price">￥{{ product.price || '—' }}</div>
          <div class="actions">
            <el-button type="primary" @click="addToCart">加入购物车</el-button>
            <el-button v-if="product.templateId" @click="viewTrace">查看溯源</el-button>
          </div>
          <el-divider />
          <div class="desc">{{ product.remark || '暂无描述' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top:16px">
      <div slot="header">为你推荐</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in recommends" :key="item.sellproId" style="margin-bottom:16px">
          <el-card :body-style="{padding:'10px'}" class="product-card" @click.native="goDetail(item.sellproId)">
            <img :src="imgUrl(item.sellproImg)" class="cover" />
            <div class="title">{{ item.sellproName }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getProductDetail, recommendProducts } from '@/api/mall/product'
export default {
  name: 'MallDetail',
  data() {
    return { product: {}, recommends: [] }
  },
  created() {
    const id = this.$route.query.id
    if (id) this.load(id)
    this.loadRecommends()
  },
  methods: {
    async load(id) {
      const { data } = await getProductDetail(id)
      this.product = data || {}
    },
    async loadRecommends() {
      const { data } = await recommendProducts(8)
      this.recommends = data.rows || []
    },
    viewTrace() {
      const url = `/originIndex?templateId=${this.product.templateId}`
      this.$router.push(url)
    },
    goDetail(id) {
      this.$router.push({ path: '/mall/detail', query: { id } })
      this.load(id)
    },
    addToCart() {
      this.$store.dispatch('cart/addToCart', { ...this.product, quantity: 1 })
      this.$message.success('已加入购物车')
    },
    imgUrl(u) {
      if (!u) return ''
      const base = process.env.VUE_APP_BASE_API || ''
      return u && u.startsWith('/profile') ? `${base}${u}` : u
    }
  }
}
</script>

<style scoped>
.detail-page { padding: 16px; }
.cover { width: 100%; height: 360px; object-fit: cover; border-radius: 4px; }
.title { margin: 0; }
.sub { color: #888; margin: 6px 0 12px; }
.price { color: #f56c6c; font-size: 22px; margin-bottom: 12px; }
actions { margin-top: 8px; }
.product-card .cover { height: 140px; }
</style> 