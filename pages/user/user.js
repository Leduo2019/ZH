import { api, message } from '../../utils/index'

// pages/user/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {},
    company: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAboutCompany()
  },
  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  /**
   * 
   */
  getAboutCompany() {
    api({ url: '/About' }).then(res => {
      const company = {
        logo: res.data.icon,
        name: res.data.name,
        phone: res.data.tel,
        content: res.data.content
      }
      app.globalData.company = company
      this.setData({ company })
    })
  },
  logout() {
    wx.showModal({
      title: '您确定要切换账号吗？',
      success: res => {
        if(res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },
  login() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
})