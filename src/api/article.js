import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/article/fetch',
    method: 'post',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail/' + id,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/add',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'put',
    data
  })
}
