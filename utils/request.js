import config from './configs'
import { message } from './utils'

// 当同时加载几个接口
let ajaxTimes = 0
export function api({ url, params, method }) {
  ajaxTimes++ ;
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    const openId = wx.getStorageSync('openId')
    method = method || 'post' 
    let contentType = 'application/json'
    // 如请求方法为 post, 自动拼接到 url 尾部
    let paramsToString = ''
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (method.toLowerCase() === 'post' && params && Object.keys(params).length > 0) {
      paramsToString = '?'
      for(const key in params) {
        paramsToString += `${key}=${params[key]}&`
      }
      // 删除最后一个&
      paramsToString = paramsToString.substring(0, paramsToString.length - 1)
    }
    const option = {
      method: method,
      url: config.domain + '/api/Values' + url + paramsToString,
      header: { 
        'content-type': contentType,
        'appId': config.appId,
        'token': token || '',
        'openId': openId || ''
      },
      data: params,
      success: (res) => {
        wx.hideLoading()    // hideLoading放在开头，防止隐藏toast提示框
        const { data } = res
        if (data.code === 0) resolve(data)
        else {
          if(data.code === 400) {
            ajaxTimes = 0
            message('请登录', 'none', 2000)
            const timer = setTimeout(() => {
              wx.redirectTo({ url: '/pages/login/login' })
              clearTimeout(timer)
            }, 2000)
          } 
          else message(data.msg, 'error')
          reject(data)
        }
      },
      fail: (err) => {
        wx.hideLoading()    // hideLoading放在开头，防止隐藏toast提示框
        message(err.msg, 'error')
        reject(err)
      },
      complete: () => {
        ajaxTimes--
      },
    }
    wx.request(option)
  })
}