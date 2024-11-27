// pages/sleep_journal/sleep_journal.ts
const themeJournal = require('../../utils/theme.js');
Page({
  /**
   * 页面的初始数据
   */
  //TODO:和睡眠记录功能连接
  data: {
    records: [
      { date: "10.17", sleepStatus: "熬夜", note: "和同学在外聚餐" },
      { date: "10.18", sleepStatus: "失眠", note: "心情不好" },
      { date: "10.19", sleepStatus: "按时睡觉", note: "无" },
      { date: "10.20", sleepStatus: "熬夜", note: "赶周末ddl" },
      { date: "10.21", sleepStatus: "按时睡觉", note: "第二天上早八" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    themeJournal.applyTheme(this);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})