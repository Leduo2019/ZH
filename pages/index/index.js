import { api, message } from '../../utils/index'

const app = getApp()
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    areas: [],
    selected: '',
    params: {
      onlyerr: false,
      area: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getUserInfo()
    this.getList()
  },
  onShow() {
    if(this.data.list.length <= 0) {
      this.getUserInfo()
      this.getList()
    }
  },
  /**
   * 监听用户下拉动作
   */
  async onPullDownRefresh() {
    const params = {
      area: '',
      onlyerr: false,
    }
    this.setData({ params, selected: 0 })
    await this.getList()
    wx.stopPullDownRefresh()
  },
  /**
   * 获取列表数据
   */
  getList() {
    api({ url: '/LastData', params: this.data.params }).then(res => {
      const data = JSON.parse(res.data)
      const result = data.map(v => {
        const {tvalue, hvalue, tmin, tmax, hmin, hmax} = this.setStrToNumber({tvalue: v.tvalue, hvalue: v.hvalue, tmin: v.tmin, tmax: v.tmax, hmin: v.hmin, hmax: v.hmax})
        if(tvalue !== null && tvalue >= tmin && tvalue <= tmax) v.tBias = true
        else v.tBias = false
        if(hvalue !== null && hvalue >= hmin && hvalue <= hmax) v.hBias = true
        else v.hBias = false
        return { ...v, tvalue, hvalue, tmin, tmax, hmin, hmax, show: true }
      })
      this.setData({
        list: result
      })
    })
  },
  /**
   * 字符串转小数
   */
  setStrToNumber(obj) {
    for(const i in obj) {
      obj[i] = parseFloat(obj[i]) || null
    }
    return obj
  },
  /**
   * 获取区域列表
   */
  getUserInfo() {
    const all = {name: '全部', code: 0}
    api({ url: '/UserInfo' }).then(res => {
      app.globalData.userInfo = res.data.info
      this.setData({
        areas: [all, ...res.data.areas]
      })
    }).catch(err => {
      app.globalData.userInfo = {}
    })
  },
  /**
   * 选择区域
   */
  bindChange(e) {
    const idx = Number(e.detail.value) || 0
    const {list, areas} = this.data
    const code = areas[idx].code
    const result = list.map(v => {
      v.areacode === code || !code ? v.show = true : v.show = false
      return v
    })
    this.setData({
      selected: idx,
      list: result,
      ['params.area']: this.data.areas[idx].code
    })
    this.getList()
  },
  /**
    * 只显示异常
    */
  handleShowError(e) {
    this.setData({
      ['params.onlyerr']: Boolean(e.detail.value[0]),
    })
    this.getList()
  }
})