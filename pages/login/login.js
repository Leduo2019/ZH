// pages/login/login.js
import { api, message } from '../../utils/index'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: {
      code: '',
      phone: ''
    },
  },
  /**
   * 发起用户授权弹窗
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '需要获取您的头像和昵称等信息',
      success: res => {
        // const system = wx.getSystemInfoSync()
        this.wxLogin()
      }
    })
  },
  /**
   * 微信登录接口
   */
  wxLogin() {
    const _this = this
    wx.login({
      success (res) {
        if (res.code) {
          _this.setData({
            ['params.code']: res.code
          })
          _this.wxLoginApi()
        } else {
          message('登录失败', 'error')
        }
      }
    })
  },
  wxLoginApi() {
    api({ url: '/WxLogin', params: this.data.params }).then(res => {
      app.globalData.token = res.data
      wx.setStorageSync('token', res.data)
      wx.switchTab({
        url: '/pages/index/index'
      })
    })
  },
})