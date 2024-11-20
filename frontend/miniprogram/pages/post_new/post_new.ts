// pages/post_new/post_new.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseImgs: [] as string[],
    image_full: false
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

  upload_new_img() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed', 'original'],
      sourceType: ['camera', 'album'],
      success: (result) => {
        this.setData({
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths]
        });
        if (this.data.chooseImgs.length > 3) {
          this.setData({
            chooseImgs: this.data.chooseImgs.slice(0, 3)
          })
          wx.showToast({
            title: '最多只可上传三张图片',
            icon: 'none',
            duration: 1000
          });
        }
        if(this.data.chooseImgs.length == 3){
          this.setData({image_full: true})
        }
        console.log(this.data.chooseImgs)
      }

    })
  },
  upload(){
    //TODO
  }
})

