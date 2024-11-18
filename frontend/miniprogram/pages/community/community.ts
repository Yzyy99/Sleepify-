// pages/community/community.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [
      {
        userphotosrc: "../../assets/photo_default.png",
        username: "test1",
        content: "我好困我好困我好困",
        photo: [],
        time: "3分钟前",
        like: 10
      },
      
      {
        userphotosrc: "../../assets/music2.png",
        username: "测试测试",
        content: "不想写软工不想写软工",
        photo: [],
        time: "3分钟前",
        like: 100
      },
      
      {
        userphotosrc: "../../assets/music7.png",
        username: "username",
        content: "content",
        photo: [],
        time: "3分钟前",
        like: 996
      }
    ]
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

  }
})