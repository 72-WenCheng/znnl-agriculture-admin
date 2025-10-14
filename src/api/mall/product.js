import request from '@/utils/request'

export function listProducts(query) {
  return request({
    url: '/mall/product/list',
    method: 'get',
    params: query
  })
}

export function getProductDetail(id) {
  return request({
    url: '/mall/product/detail',
    method: 'get',
    params: { id }
  })
}

export function recommendProducts(limit = 8) {
  return request({
    url: '/mall/product/recommend',
    method: 'get',
    params: { limit }
  })
} 