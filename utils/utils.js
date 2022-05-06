export function message(msg, type = 'success', duration = 1500) {
  wx.showToast({
    title: msg,
    icon: type,
    mask: true,
    duration,
  })
}
export function getNowDate(date) {
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  return `${Y}-${M}-${D}`
}
export function getNowMinute(date) {
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const hh = date.getHours()
  const mm = date.getMinutes()
  return `${Y}-${M}-${D} ${hh}:${mm}`
}