import request from '@/utils/request'

export function createOrder(data) {
  return request({
    url: '/mall/order/create',
    method: 'post',
    data
  })
}

export function getOrderDetail(id) {
  return request({
    url: '/mall/order/detail',
    method: 'get',
    params: { id }
  })
}

export function listOrders(query) {
  return request({
    url: '/mall/order/list',
    method: 'get',
    params: query
  })
}

export function updateOrderStatus(id, action) {
  return request({
    url: `/mall/order/${action}`,
    method: 'post',
    params: { id }
  })
} 