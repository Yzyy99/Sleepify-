// pages/community/community.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    replynow: -1,
    comment_value: "",
    posts: [
      {
        userphotosrc: "../../assets/photo_default.png",
        username: "test1",
        content: "我好困我好困我好困",
        imagenum: 0,
        images: [],
        time: "3分钟前",
        like: 10,
        commentnum: 1,
        comments: [
          {
            username: "username",
            content: "你怎么还不睡！"
          }
        ]
      },

      {
        userphotosrc: "../../assets/music2.png",
        username: "测试测试",
        content: "不想写软工不想写软工",
        imagenum: 1,
        images: ["../../assets/music6.png"],
        time: "3分钟前",
        like: 100,
        commentnum: 2,
        comments: [{
          username: "aaa",
          content: "你也没写多少啊。。。"
        },
        {
          username: "bbb",
          content: "快点写😡"
        }
        ]
      },

      {
        userphotosrc: "../../assets/music7.png",
        username: "username",
        content: "content",
        imagenum: 0,
        images: [],
        time: "3分钟前",
        like: 996,
        commentnum: 0,
        comments: []
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // TODO: load real posts data from backend
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

  like_post(e: any) {
    const index = e?.currentTarget?.dataset.index;
    console.log("user liked " + index);
    // TODO: post to backend
  },

  comment_post(e: any) {
    this.setData({replynow: e?.currentTarget.dataset.index})
  },

  send_comment(e:any){
    const index = e?.currentTarget.dataset.index;
    console.log("send to " + index + ": " + this.data.comment_value);
    // TODO: post new comments
  },

  get_comment_value(e: any){
    this.setData({comment_value: e.detail.value})
  }
})
