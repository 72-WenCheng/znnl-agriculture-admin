import request from '@/utils/request'

export function createBooking(data) {
  return request({
    url: '/booking/create',
    method: 'post',
    data
  })
}

export function listBookings(date) {
  return request({
    url: '/booking/list',
    method: 'get',
    params: { date }
  })
}

export function monthBookings(year, month) {
  return request({
    url: '/booking/month',
    method: 'get',
    params: { year, month }
  })
}

export function getCapacity() {
  return request({
    url: '/booking/capacity',
    method: 'get'
  })
} 