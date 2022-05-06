// pages/iAlarm/iAlarm.js
import { api, message } from '../../utils/index'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: {
      area: '',
      node: '',
    },
    list: [],
    areas: [],
    multiAreas: [],
    multiAreaIdx: [0, 0],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前时间
    this.getList()
    this.getUserInfo()
  },
  /**
   * 监听用户下拉动作
   */
  async onPullDownRefresh() {
    const params = {
      area: '',
      node: '',
    }
    this.setData({ 
      params, 
      multiAreaIdx: [0, 0] 
    })
    await this.getList()
    wx.stopPullDownRefresh()
  },
  /**
   * 获取列表数据
   */
  getList() {
    api({ url: '/WaringRecord', params: this.data.params }).then(res => {
      this.setData({
        list: JSON.parse(res.data),
      })
    })
  },
  /**
   * 获取筛选列表
   */
  getUserInfo() {
    const mul = [['全部'],['全部']]
    api({ url: '/UserInfo' }).then(res => {
      const result = res.data.areas.map(v => {
        v.children = []
        res.data.nodes.forEach(c => c.area === v.code ? v.children.push(c) : '' )
        mul[0].push(v.name)
        return v
      })
      this.setData({
        areas: result,
        multiAreas: mul
      })
    })
  },
  /**
   * 获取区域选择结果
   */
  bindChange(e) {
    const [a, b] = e.detail.value
    const {areas} = this.data
    this.setData({
      ['params.area']: a ? (areas[a-1].code || '') : '',
      ['params.node']: b ? (areas[a-1].children[b-1].code || '') : '',
      multiAreaIdx: [a, b],
      list: []
    })
    this.getList()
  },
  bindChangeColunm(e) {
    const {column, value} = e.detail
    const col2 = ['全部'] 
    const idx = value ? value - 1 : 0
    if(!column) {
      this.data.areas[idx].children.map(v => col2.push(v.name))
      this.setData({
        multiAreas: [this.data.multiAreas[0], col2]
      })
    }
  }
})