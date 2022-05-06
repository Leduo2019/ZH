import * as echarts from '../../ec-canvas/echarts';
import { api, message } from '../../utils/index'
import { getNowMinute } from '../../utils/utils'

const app = getApp()
let chart = null
let option = {
  title: {
    text: '温度曲线图',
    padding: 15,
    textStyle: {
      fontSize: 12,
    },
  },
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} °C'
    },
    min: function(value) {
      return Math.floor(value.min - 0.5)
    },
    max: function(value) {
      return Math.floor(value.max + 0.5)
    }
  },
  series: [
    {
      name: 'A',
      type: 'line',
      smooth: true,
      data: [18, 36, 65, 30, 78, 40, 33]
    }
  ],
  // 缩放
  dataZoom: {
    type: 'inside'
  }
}
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart)
  return chart
}

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
  data: {
    ec: {
      onInit: initChart
    },
    params: {
      node: '',
      start: '',
      end: '',
      interval: '90'
    },
    list: [],
    areas: [],
    multiAreas: [],
    multiAreaIdx: [0, 0],
    starTimeArr: [years, months, days, hours, minutes],
    starTimeIdx: [],
    endTimeArr: [years, months, days, hours, minutes],
    endTimeIdx: [],
    isHumidity: false,  // 湿度
    curData: []
  },
  onLoad() {
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
    this.getFilterList()
  },
  setEchart() {
    const {params, isHumidity} = this.data
    const idx = isHumidity ? 1 : 0
    if(params.node === '')  message('未选择探头', 'none')
    else {
      api({ url: '/ChartData', params: params }).then(res => {
        const list = JSON.parse(res.data)
        this.setData({
          list,
          curData: list[idx].TSeriesdata[0] || []
        })
        this.setEchartOption()
      }).catch(err => { console.log(err) })
    }
  },
  /**
   * 处理图表数据
   */
  setEchartOption() {
    let { list, isHumidity } = this.data
    let data = isHumidity ? list[1] : list[0]
    let tSeriesdata = []
    if (data.TSeriesdata.length > 0) tSeriesdata = data.TSeriesdata[0].data
    option = {
      ...option,
      series: [{
        data: tSeriesdata,
        lineStyle: { width: 1 },  // 折线图粗细
        markPoint: {    // 标注最高、最低值
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        type: 'line',
        smooth: true
      }],
      legend: {
        right: 10,
        top: 10,
        data: data.Legend || [],
        selectedMode: false,    // 不允许点击
      },
      xAxis: {
        data: data.Xtitle || []
      }
    }
    chart.setOption(option)
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
        if ([1,3,5,7,8,10,12].includes(num)) temp.push(`${i}`)
        // 判断30天的月份
        else if (([4,6,9,11].includes(num)) && i <= 30) temp.push(`${i}`)
        // 判断2月份天数（闰年2月29天，平年2月28天）
        else if (num == 2 && i <= 29) {
          let year = parseInt(starTimeArr[starTimeIdx[0]])
          if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) temp.push(`${i}`)
          else {
            if(i <= 28) temp.push(`${i}`)
          } 
        }
      }
      if(type === 'start') this.setData({['starTimeArr[2]']: temp})
      else this.setData({['endTimeArr[2]']: temp })
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
   * 显示湿度报表
   */
  handleShowError(e) {
    this.setData({
      isHumidity: Boolean(e.detail.value[0]),
    })
    this.setEchartOption()
  },
  /**
   * 获取筛选列表
   */
  getFilterList() {
    api({ url: '/UserInfo' }).then(res => {
      const result = res.data.areas.map(item => {
        const data = { ...item, children: [] }
        res.data.nodes.forEach(v => {
          if (item.code === v.area) data.children.push(v)
        })
        return data
      })
      const col = result.map(item => item.name)
      const col2 = result[0].children.map(v => v.name)  // 渲染多列选择器-2列默认数据
      this.setData({
        areas: result,
        multiAreas: [col, col2]
      })
    })
  },
  /**
   * 获取区域选择结果
   */
  bindChange(e) {
    const [a, b] = e.detail.value
    const {areas} = this.data
    if(areas[a].children.length <= 0) {
      message('未选择探头', 'none')
      this.setData({
        ['params.node']: '',
      })
      return
    }
    this.setData({
      ['params.node']: areas[a].children[b].code || 0,
      multiAreaIdx: [a, b],
      list: []
    })
  },
  /**
   * 多级列表滚动监听
   */
  bindChangeColunm(e) {
    const {column, value} = e.detail
    const col2 = []
    if(!column) {
      this.data.areas[value].children.map(v => col2.push(v.name))
      this.setData({
        multiAreas: [this.data.multiAreas[0], col2]
      })
    }
  },
  /**
   * 设置间隔
   */
  setInterval(e) {
    this.setData({
      ['params.interval']: parseInt(e.detail.value) || 60
    })
  }
});
