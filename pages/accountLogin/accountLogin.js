// pages/accountLogin/accountLogin.js
import { api, message } from '../../utils/index'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: 'system',
    pwd: '1234560',
    loading: false,
    disabled: false,
    closeType: 0,   // 1.用户名，2.密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  /**
   * 表单提交
   */
  submit(e) {
    const { name, pwd } = e.detail.value || {}
    if(name === '') {
      return wx.showToast({
        title: '用户名不能为空',
        icon: 'error'
      })
    } else if(pwd === '') {
      return wx.showToast({
        title: '用户名不能为空',
        icon: 'error'
      })
    }
    const _this = this
    api({ url: '/Login', params: { name, pwd } }).then(res => {
      app.globalData.token = res.data
      wx.setStorageSync('token', res.data)
      wx.switchTab({
        url: '/pages/index/index'
      })
    })
  },
  /**
   * 用户名 || 密码 输入框聚焦
   */
  handleFocus(e) {
    const type = e.currentTarget.dataset.type || ''
    this.setData({
      closeType: type === 'name' ? 1 : 2,
    })
  },
  /**
   * 用户名 || 密码 输入框失焦
   */
  handleBlur(e) {
    this.setData({
      closeType: 0,
    })
  },
  /**
   * 清空输入框
   */
  clear(e) {
    const { clear } = e.currentTarget.dataset || {}
    if(clear === 'name') {
      this.setData({
        name: '',
        closeType: 1
      })
    } else {
      this.setData({
        pwd: '',
        closeType: 2
      })
    }
  }
})