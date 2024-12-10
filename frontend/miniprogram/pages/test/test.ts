// pages/test/test.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sleepmode: false,
    count: 0,
    recordmode: false,
    recordoption: 0,
    // options: [
    //   { text: '直至睡眠结束', value: 'enable' },
    //   { text: '10min', value: 'enable' },
    //   { text: '30min', value: 'enable' },
    //   { text: '1h', value: 'enable' },
    //   { text: '2h', value: 'enable' },
    //   { text: '3h', value: 'enable' },
    //   { text: '6h', value: 'enable' },
    // ],
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
    if (this.data.sleepmode) {
      console.log("screen on")
      this.setData({
        count: this.data.count + 1
      })
      console.log(this.data.count)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log("screen hide")
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

  enableSleep() {
    console.log("sleeping")
    this.setData({
      sleepmode: true,
    })
  },

  disableSleep() {
    this.setData({
      sleepmode: false
    })
  },

  toRecord() {
    // show a confirm
    wx.showModal({
      title: '提示',
      content: '噪声检测需要启用麦克风功能，并将禁止屏幕自动熄灭，可能会消耗更多电量，是否继续？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showActionSheet({
            itemList: ['直至睡眠结束', '30min', '1h', '2h', '3h', '6h'],
            success: (res) => {
              console.log(res.tapIndex)
              this.setData({
                recordmode: true,
                recordoption: res.tapIndex
              })
            },
            fail: (res) => {
              console.log(res.errMsg)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          return;
        }
      }
    })
    // show a picker

  }
})
