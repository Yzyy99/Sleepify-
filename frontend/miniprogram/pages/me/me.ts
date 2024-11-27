// pages/me/me.ts
const thememe = require('../../utils/theme.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo: "../../assets/photo_default.png",
    username: "testUsername",
    phone: "12345678901",
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
    thememe.applyTheme(this);
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

  },

  modify_photo() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          photo: res.tempFilePaths[0]
        })
        // TODO: update to backend
      }
    })
  },

  modify_username() {
    // TODO: update to backend
    wx.showToast({
      title: '修改成功',
      icon: 'success',
    })
  },

  modify_phone() {
    wx.navigateTo({
      url: '/pages/modify_phone/modify_phone',
      success: () => {
        // 重新加载页面
        this.onLoad()
      }
    })
  },

  modify_passwd() {
    wx.navigateTo({
      url: '/pages/modify_passwd/modify_passwd',
    })
  },

  logout() {
    // TODO: logout
  }
})
