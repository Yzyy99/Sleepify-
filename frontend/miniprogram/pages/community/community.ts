// pages/community/community.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    replynow: -1,
    comment_value: "",
    posts: [
      // userphotosrc: "../../assets/music2.png",
      // username: "测试测试",
      // content: "不想写软工不想写软工",
      // imagenum: 1,
      // images: ["../../assets/music6.png"],
      // time: "3分钟前",
      // like: 100,
      // commentnum: 2,
      // comments: [{
      //   username: "aaa",
      //   content: "你也没写多少啊。。。"
      // },
      // {
      //   username: "bbb",
      //   content: "快点写😡"
      // }

    ] as Array<{ [key: string]: any }>
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // TODO: load real posts data from backend
    this.setData({ phone_number: wx.getStorageSync('phone_number') })
    wx.request({
      url: 'http://127.0.0.1:8000/api/forum/posts/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      success: (res) => {
        if (res.statusCode === 200) {
          var datan = Array.isArray(res.data) ? res.data : [];
          datan = datan.map((post: any) => ({
            id: post.id,
            userphotosrc: "../../assets/photo_default.png",
            username: post.username,
            content: post.content,
            time: new Date(post.created_at).toLocaleString(),
            imagenum: post.picture_count,
            images: post.picture_names == undefined ? [] : post.picture_names.map((name: string) => `http://127.0.0.1:8000/static/media/forum_pictures/${name}`),
            like: post.likes,
            commentnum: post.replies,
            comments: post.reply_content.map((reply: any) => ({
              username: reply.username,
              content: reply.content
            })),
            isliked: post.isliked
          }));
          console.log(datan.map((post: any) => post.images));
          this.setData({ posts: datan as Array<{ [key: string]: any }> });
        } else {
          console.error('Failed to load posts:', res);
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
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
    this.onLoad();
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
    const id = this.data.posts[index].id;
    wx.request({
      url: 'http://127.0.0.1:8000/api/forum/like_post/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      data: {
        postid: id
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const updatedPosts = this.data.posts.map((post, idx) => {
            if (idx === index) {
              return {
                ...post,
                like: (res.data as any).likes,
                isliked: (res.data as any).isliked
              };
            }
            return post;
          });
          this.setData({ posts: updatedPosts });
        } else {
          console.error('Failed to like post:', res);
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
  },

  comment_post(e: any) {
    this.setData({ replynow: e?.currentTarget.dataset.index })
  },

  send_comment(e: any) {
    const index = e?.currentTarget.dataset.index;
    console.log("send to " + index + ": " + this.data.comment_value);
    const id = this.data.posts[index].id;
    wx.request({
      url: 'http://127.0.0.1:8000/api/forum/reply_post/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      data: {
        postid: id,
        reply_content: this.data.comment_value
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const updatedPosts = this.data.posts.map((post, idx) => {
            if (idx === index) {
              return {
                ...post,
                commentnum: (res.data as any).replies,
                comments: (res.data as any).reply_content.map((reply: any) => ({
                  username: reply.username,
                  content: reply.content
                }))
              };
            }
            return post;
          });
          this.setData({ posts: updatedPosts, comment_value: "", replynow: -1 });
        } else {
          console.error('Failed to send comment:', res);
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
  },

  get_comment_value(e: any) {
    this.setData({ comment_value: e.detail.value })
  },

  delete_post(e: any) {
    const index = e?.currentTarget?.dataset.index;
    console.log("delete " + index);
    const id = this.data.posts[index].id;
    wx.request({
      url: 'http://127.0.0.1:8000/api/forum/delete_post/',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      data: {
        postid: id
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const updatedPosts = this.data.posts.filter((post, idx) => idx !== index);
          this.setData({ posts: updatedPosts });
        } else {
          console.error('Failed to delete post:', res);
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
  }

})
