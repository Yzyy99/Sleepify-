// pages/post_new/post_new.ts
const app3=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    chooseImgs: [] as string[],
    image_full: false,
    content: '',
    isDarkMode: app3.globalData.isDarkMode // 是否夜间模式
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
    this.themePostNew(); 
  },

  // 应用主题
  themePostNew() {
    const app = getApp();  // 获取全局小程序实例
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    })
    const isDarkMode = app.globalData.isDarkMode;

    if (isDarkMode) {
      this.setData({
        pageBackgroundColor: '#1E1E2F', // 深蓝灰背景
        textColor: '#F4F4F9', // 柔和白色文字
        bubbleColor: '#28293E', // 深色气泡颜色
        buttonBackgroundColor: '#28293E', // 按钮背景深蓝灰
        buttonTextColor: '#FFFFFF', // 按钮文字白色
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
        bubbleColor: '#D3D3D3', // 浅色气泡颜色
        buttonBackgroundColor: '#dce4c9', 
        buttonTextColor: '#432e54', // 按钮文字深紫色
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

  cancel() {
    wx.showModal({
      title: '提示',
      content: '确定放弃编辑？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，清除数据并返回上一页面
          this.setData({
            content: '',
            chooseImgs: [],
            image_full: false
          });
          wx.navigateBack(); // 返回上一页面
        }
      }
    });
  },

  content_input(e: any) {
    this.setData({
      content: e.detail.value
    });
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
        if (this.data.chooseImgs.length == 3) {
          this.setData({ image_full: true })
        }
        console.log(this.data.chooseImgs)
      }

    })
  },
  upload() {
    const fs = wx.getFileSystemManager();
    var image_names: string[] = [];

    const uploadImage = (filePath: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        fs.readFile({
          filePath: filePath,
          encoding: 'base64',
          success: (res) => {
            const imageType = filePath.split('.').pop();
            wx.request({
              url: 'https://124.220.46.241:443/api/forum/create_picture/',
              method: 'POST',
              header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
              },
              data: {
                image_type: imageType,
                image_data: res.data
              },
              success: (uploadRes) => {
                console.log('Image uploaded successfully', uploadRes);
                resolve((uploadRes.data as any).filename);
              },
              fail: (err) => {
                console.error('Image upload failed', err);
                reject(err);
              }
            });
          },
          fail: (err) => {
            console.error('Failed to read file', err);
            reject(err);
          }
        });
      });
    };

    const uploadPost = async () => {
      try {
        for (let i = 0; i < this.data.chooseImgs.length; i++) {
          const filePath = this.data.chooseImgs[i];
          const filename = await uploadImage(filePath);
          image_names.push(filename);
        }
        console.log('image_names', image_names);

        const requestData = {
          content: this.data.content,
          picture_count: image_names.length,
          picture_names: image_names
        };
        
        // 打印即将发送的数据
        console.log('Request data:', requestData);
        

        // upload post
        wx.request({
          url: 'https://124.220.46.241:443/api/forum/create_post/',
          method: 'POST',
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
          },
          data: {
            content: this.data.content,
            picture_count: image_names.length,
            picture_names: image_names
          },
          success: (res) => {
            console.log('Post created successfully', res);
            wx.showToast({
              title: 'Post created successfully',
              icon: 'success',
              duration: 2000
            });
          },
          fail: (err) => {
            console.error('Post creation failed', err);
            wx.showToast({
              title: 'Post creation failed',
              icon: 'none',
              duration: 2000
            });
          }
        });

        // clear textarea and images
        this.setData({
          content: '',
          chooseImgs: [],
          image_full: false
        });

        // redirect to community
        wx.switchTab({
          url: '/pages/community/community',
        });
      } catch (error) {
        console.error('Error uploading images', error);
      }
    };

    uploadPost();
  }
})

