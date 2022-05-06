// pages/iDate/iDate.js
import { api, message } from '../../utils/index'
import { getNowMinute } from '../../utils/utils'
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
// 获取年
for (let i = 2021; i <= date.getFullYear(); i++) {
  years.push(`${i}`);
}
//获取月、日期、小时、分钟
for (let i = 0; i < 60; i++) {
  if(i && i <= 12) months.push(`${i}`)
  if(i && i <= 31) days.push(`${i}`)
  if(i < 24) hours.push(`${i}`)
  minutes.push(`${i}`)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    params: {
      area: '',
      node: '',
      start: '',
      end: '',
      limit: false,
      nPage: 1,
      nSize: 30,
    },
    totalPage: 0,
    areas: [],
    multiAreas: [],
    multiAreaIdx: [0, 0],
    starTimeArr: [years, months, days, hours, minutes],
    starTimeIdx: [],
    endTimeArr: [years, months, days, hours, minutes],
    endTimeIdx: [],
  },
  onShow() {
    // 获取当前时间
    const now = new Date()
    const y = now.getFullYear() - 2021
    const m = now.getMonth()
    const d = now.getDate() - 1
    const hh = now.getHours()
    const mm = now.getMinutes()
    this.setData({
      starTimeIdx: [y, m, d, hh, mm],
      endTimeIdx: [y, m, d, hh, mm],
    })
    if(this.data.list.length <= 0) {
      this.getList()
      this.getUserInfo()
    }
  },
  onLoad() {
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
      start: '',
      end: '',
      limit: false,
      nPage: 1,
    }
    this.setData({ 
      params, 
      multiAreaIdx: [0, 0] 
    })
    await this.getList()
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { nPage } = this.data.params
    if(nPage < this.data.totalPage) {
      nPage++
      this.setData({ ['params.nPage']: nPage })
      this.getList()
    }
  },
  /**
   * 选择开始时间
   */
  bindStarTimeChange(e) {
    const {value} = e.detail
    const {end} = this.data.params
    const now = getNowMinute(new Date())
    const date = this.checkTimeChange(value, 'start')
    // 1. 开始时间 < 当前时间
    // 2. 开始时间 < 结束时间
    if(date >= now) {
      wx.showToast({
        title: '开始时间过近',
        icon: 'none',
      })
    } else if(date < end && end) {
      wx.showToast({
        title: '开始时间不能晚于结束时间',
        icon: 'none',
      })
    } else {
      this.setData({
        ['params.start']: date,
        starTimeIdx: value
      })
      this.getList()
    }
  },
  /**
   * 选择结束时间
   */
  bindEndTimeChange(e) {
    const {value} = e.detail
    const {start} = this.data.params
    const now = getNowMinute(new Date())
    const date = this.checkTimeChange(value, 'end')
    // 1. 结束时间 <= 当前时间
    // 2. 结束时间 > 开始时间
    if(date > now) {
      wx.showToast({
        title: '结束时间有误',
        icon: 'none',
      })
    } else if(date < start && start) {
      wx.showToast({
        title: '结束时间不得早于开始时间',
        icon: 'none',
      })
    } else {
      this.setData({
        ['params.end']: date,
        endTimeIdx: value
      })
      this.getList()
    }
  },
  /**
   * 处理选择开始、结束的时间
   * @param {值} val 
   * @param {类型} type 
   * @returns 当前选择的日期
   */
  checkTimeChange(val, type) {
    const {starTimeArr, endTimeArr} = this.data
    const y = type === 'start' ? starTimeArr[0][val[0]] : endTimeArr[0][val[0]]
    const m = type === 'start' ? starTimeArr[1][val[1]] : endTimeArr[1][val[1]]
    const d = type === 'start' ? starTimeArr[2][val[2]] : endTimeArr[2][val[2]]
    const hh = type === 'start' ? starTimeArr[3][val[3]] : endTimeArr[3][val[3]]
    const mm = type === 'start' ? starTimeArr[4][val[4]] : endTimeArr[4][val[4]]
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm
  },
  /**
   * 监听开始时间滚动事件
   */
  bindStarTimeColumnChange(e) {
    this.checkTimePickerColumn(e, 'start')
  },
  /**
   * 监听结束时间滚动事件
   */
  bindEndTimeColumnChange(e) {
    this.checkTimePickerColumn(e, 'end')
  },
  checkTimePickerColumn(e, type) {
    const {column, value} = e.detail
    const {starTimeArr, starTimeIdx, endTimeArr, endTimeIdx} = this.data
    if(column == 1) {   // 处理月份
      let num = parseInt(starTimeArr[column][value]);
      let temp = [];
      for(let i = 1; i <= 31; i++) {
        // 判断31天的月份
        if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) temp.push(`${i}`)
        // 判断30天的月份
        else if ((num == 4 || num == 6 || num == 9 || num == 11) && i <= 30) temp.push(`${i}`)
        // 判断2月份天数（闰年2月29天，平年2月28天）
        else if (num == 2 && i <= 29) {
          let year = parseInt(starTimeArr[starTimeIdx[0]])
          if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) temp.push(`${i}`)
          else {
            if(i <= 28) temp.push(`${i}`)
          } 
        }
      }
      if(type === 'start') {
        this.setData({
          ['starTimeArr[2]']: temp
        })
      } else {
        this.setData({
          ['endTimeArr[2]']: temp
        })
      }
    }
    if(type === 'start') {
      starTimeIdx[column] = value
      this.setData({ starTimeArr, starTimeIdx })
    } else {
      endTimeIdx[column] = value
      this.setData({ endTimeArr, endTimeIdx })
    }
  },
  /**
   * 获取列表数据
   */
  getList() {
    api({ url: '/LastData', params: this.data.params }).then(res => {
      const data = JSON.parse(res.data)
      const result = data.map(v => {
        const {tvalue, hvalue, tmin, tmax, hmin, hmax} = this.setStrToNumber({tvalue: v.tvalue, hvalue: v.hvalue, tmin: v.tmin, tmax: v.tmax, hmin: v.hmin, hmax: v.hmax})
        if(tvalue >= tmin && tvalue <= tmax) v.tBias = true
        else v.tBias = false
        if(hvalue >= hmin && hvalue <= hmax) v.hBias = true
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
      obj[i] !== null ? obj[i] = parseFloat(obj[i]) : ''
    }
    return obj
  },
  /**
   * 获取筛选列表
   */
  getUserInfo() {
    const mul = [['全部'],['全部']]
    api({ url: '/UserInfo' }).then(res => {
      const result = res.data.areas.map(v => {
        v.children = []
        res.data.nodes.forEach(c => {
          if(c.area === v.code) {
            v.children.push(c)
            mul[1].push(c.name)
          }
        })
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
  },
  /**
   * 显示超标
   */
  handleShowError(e) {
    this.setData({
      ['params.limit']: Boolean(e.detail.value[0]),
    })
    this.getList()
  }
})