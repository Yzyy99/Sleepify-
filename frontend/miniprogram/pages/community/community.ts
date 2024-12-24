// pages/community/community.ts\
const app4=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDarkMode: app4.globalData.isDarkMode, // 是否夜间模式
    replynow: -1,
    comment_value: "",
    posts: [
    ] as Array<{ [key: string]: any }>,
    personalizedRecommendation : false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const personalizedRecommendation = wx.getStorageSync("personalizedRecommendation") || false;
    console.log("个性化推荐开关状态:", personalizedRecommendation);
    this.setData({ personalizedRecommendation });

    // 加载帖子数据
    this.loadPosts();
    this.setData({ phone_number: wx.getStorageSync('phone_number') })
    /*
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
          console.log(datan.map((post: any) => post.images))
          this.setData({ posts: datan as Array<{ [key: string]: any }> });
        } else {
          console.error('Failed to load posts:', res);
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
    */
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
    console.log("社区页面 onShow 被触发");
    const personalizedRecommendation = wx.getStorageSync("personalizedRecommendation") || false;
  console.log("页面显示时个性化推荐状态:", personalizedRecommendation); // 打印状态
    this.setData({ personalizedRecommendation });
    this.loadPosts(); 
    this.themeCommunity(); 
  },

  loadPosts() {
    // 根据开关状态调用不同的后端接口
    if (this.data.personalizedRecommendation) {
      this.fetchPersonalizedPosts(); // 获取个性化推荐帖子
    } else {
      this.fetchDefaultPosts(); // 获取默认推荐帖子
    }
  },

  fetchDefaultPosts() {
    wx.request({
      url: "https://124.220.46.241:443/api/forum/posts/", // 默认推荐接口
      method: "POST",
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: async(res) => {
        if (res.statusCode === 200) {
          const datan = Array.isArray(res.data) ? res.data : [];
          await this.processPosts(datan); // 处理帖子数据
        } else {
          console.error("Failed to load default posts:", res);
        }
      },
      fail: (err) => {
        console.error("Request failed:", err);
      },
    });
  },

  /**
   * 获取个性化推荐帖子
   */
  fetchPersonalizedPosts() {
    wx.request({
      url: "https://124.220.46.241:443/api/forum/similarity_posts/", // 个性化推荐接口
      method: "POST",
      header: {
        "content-type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: async(res) => {
        if (res.statusCode === 200) {
          const datan = Array.isArray(res.data) ? res.data : [];
          await this.processPosts(datan); // 处理帖子数据
        } else {
          console.error("Failed to load personalized posts:", res);
        }
      },
      fail: (err) => {
        console.error("Request failed:", err);
      },
    });
  },

  async processPosts(posts: any[]) {
    const fetchUserPhoto = async (username: string): Promise<string> => {
      return new Promise((resolve) => {
        wx.request({
          url: `https://124.220.46.241:443/api/otheruser/?phone_number=${username}`,
          method: 'GET',
          header: {
            'Authorization': "Bearer " + wx.getStorageSync("access_token")
          },
          success: (res: any) => {
            if (res.statusCode === 200 && res.data.avatar) {
              resolve(res.data.avatar);
            } else {
              // 当状态码不是200或没有avatar时返回默认图片
              resolve("../../assets/photo_default.png");
            }
          },
          fail: () => {
            // 请求失败时返回默认图片
            resolve("../../assets/photo_default.png");
          }
        });
      });
    };
  
    const processedPosts = await Promise.all(posts.map(async (post: any) => {
      let userPhoto = "../../assets/photo_default.png";
      if (post.username && post.username.length === 11) {
        userPhoto = await fetchUserPhoto(post.username);
      }

      return {
        id: post.id,
        userphotosrc: userPhoto,
        username: post.username,
        content: post.content,
        time: new Date(post.created_at).toLocaleString(),
        imagenum: post.picture_count,
        images: post.picture_names
          ? post.picture_names.map(
              (name: string) => `https://124.220.46.241:443/static/media/forum_pictures/${name}`
            )
          : [],
        like: post.likes,
        commentnum: post.replies,
        comments: post.reply_content.map((reply: any) => ({
          username: reply.username,
          content: reply.content,
        })),
        isliked: post.isliked,
      };
    }));
  
    this.setData({ posts: processedPosts });
  },

  themeCommunity() {
    
    const app = getApp();  // 获取全局小程序实例
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    })
    const isDarkMode = app.globalData.isDarkMode;

    if (isDarkMode) {
      this.setData({
        pageBackgroundColor: '#1E1E2F', // 深蓝灰背景
        textColor: '#F4F4F9', // 柔和白色文字
        bubbleColor: '#28293E' // 深色气泡颜色
      });
      wx.setNavigationBarColor({
        frontColor: '#ffffff', // 导航栏文字白色
        backgroundColor: '#1E1E2F' // 导航栏背景深蓝灰
      });
      wx.setTabBarStyle({
        backgroundColor: '#1E1E2F' // 导航栏背景深蓝灰
      });
    } else {
      this.setData({
        pageBackgroundColor: '#f5f5dc', // 浅米色背景
        textColor: '#333', // 深灰色文字
        bubbleColor: '#DCE4C9' // 浅色气泡颜色
      });
      wx.setNavigationBarColor({
        frontColor: '#000000', // 导航栏文字黑色
        backgroundColor: '#f5f5dc' // 导航栏背景浅米色
      });
      wx.setTabBarStyle({
        backgroundColor:'#f5f5dc'
      })
    }
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
      url: 'https://124.220.46.241:443/api/forum/like_post/',
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
      url: 'https://124.220.46.241:443/api/forum/reply_post/',
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
      url: 'https://124.220.46.241:443/api/forum/delete_post/',
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
