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
    personalizedRecommendation: false,
  },

  toggleRecommendation(e:any) {
    const isChecked = e.detail.value; // 获取开关状态
    this.setData({ personalizedRecommendation: isChecked });

    // 将状态同步到后端或本地存储
    wx.setStorageSync('personalizedRecommendation', isChecked);
    console.log("个性化推荐状态已保存:", isChecked);  
    wx.showToast({
      title: isChecked ? "个性化推荐已开启" : "个性化推荐已关闭",
      icon: "success",
      duration: 2000,
    });
  },
  
  toggleDarkMode(e: any) {
    const isDarkMode = e.detail.value;  // 获取开关状态
    const app = getApp();  // 获取全局小程序实例

    // 更新全局状态
    app.globalData.isDarkMode = isDarkMode;

    // 更新本地状态
    this.setData({
      isDarkMode: isDarkMode
    });

    // 提示用户夜间模式切换
    wx.showToast({
      title: isDarkMode ? '夜间模式已开启' : '夜间模式已关闭',
      icon: 'none',
      duration: 2000
    });

    // 切换当前页面主题
    thememe.applyTheme(this);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取用户信息
    wx.request({
      url: 'https://124.220.46.241:443/api/user/',
      method: 'GET',
      header: {
        Authorization: "Bearer " + wx.getStorageSync("access_token"), // 携带用户登录时保存的 token
      },
      success: (res:any) => {
        const { username, avatar, phone_number } = res.data; // 假设返回的数据格式是 { username, avatar, phone_number }
        this.setData({
          username: username || '默认用户名', // 设置用户名
          photo: avatar || '../../assets/breathing.png', // 设置头像
          phone: phone_number || '未绑定手机号' // 设置手机号
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '加载用户信息失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
    const app = getApp();  // 获取全局小程序实例

    // 更新全局状态
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    })
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

  /*
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
  */
 modify_photo() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];

      // 将图片转为 base64
      wx.getFileSystemManager().readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (fileRes) => {
          const base64Image = `data:image/png;base64,${fileRes.data}`;

          // 调用后端接口上传头像
          wx.request({
            url: 'https://124.220.46.241:443/api/user/', 
            method: 'PUT',
            header: {
              Authorization: "Bearer " + wx.getStorageSync("access_token"), // 携带用户登录时保存的 token
              'Content-Type': 'application/json'
            },
            data: {
              avatar: base64Image
            },
            success: (res:any) => {
              this.setData({
                photo: tempFilePath // 更新页面显示的头像
              });
              wx.showToast({
                title: '头像修改成功',
                icon: 'success',
                duration: 2000
              });
            },
            fail: (err) => {
              console.error('修改头像失败', err);
              wx.showToast({
                title: '修改头像失败',
                icon: 'error',
                duration: 2000
              });
            }
          });
        },
        fail: (err) => {
          console.error('读取图片失败', err);
          wx.showToast({
            title: '图片读取失败',
            icon: 'error',
            duration: 2000
          });
        }
      });
    }
  });
},

/*
  modify_username() {
    // TODO: update to backend
    wx.showToast({
      title: '修改成功',
      icon: 'success',
    })
  },
  */
 modify_username() {
  wx.showModal({
    title: '修改用户名',
    editable: true, // 允许用户输入
    placeholderText: '请输入新的用户名',
    success: (res) => {
      if (res.confirm && res.content) {
        const newUsername = res.content;

        // 调用后端接口更新用户名
        wx.request({
          url: 'https://124.220.46.241:443/api/user/', 
          method: 'PUT',
          header: {
            Authorization: "Bearer " + wx.getStorageSync("access_token"), // 携带用户登录时保存的 token
            'Content-Type': 'application/json'
          },
          data: {
            username: newUsername
          },
          success: (res:any) => {
            this.setData({
              username: newUsername // 更新页面显示的用户名
            });
            wx.showToast({
              title: '用户名修改成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: (err) => {
            console.error('修改用户名失败', err);
            wx.showToast({
              title: '修改用户名失败',
              icon: 'error',
              duration: 2000
            });
          }
        });
      }
    }
  });
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
      wx.clearStorageSync(); // 清除本地存储
      wx.reLaunch({
        url: '/pages/homepage/homepage' // 跳转回登录页面
      });
    },
    
    delete() {
      const token = wx.getStorageSync('access_token'); // 从本地存储中获取用户的 Token
      if (!token) {
        wx.showToast({
          title: '用户未登录',
          icon: 'error',
          duration: 2000,
        });
        return;
      }
    
      // 弹窗确认注销操作
      wx.showModal({
        title: '确认注销',
        content: '注销后您的账户将被永久删除，是否继续？',
        success: (res) => {
          if (res.confirm) {
            // 用户确认后调用后端接口
            wx.request({
              url: 'https://124.220.46.241:443/api/user/', 
              method: 'DELETE',
              header: {
                Authorization: "Bearer " + wx.getStorageSync("access_token"), // 将 Token 添加到请求头中
              },
              success: (res:any) => {
                if (res.statusCode === 200) {
                  wx.showToast({
                    title: '注销成功',
                    icon: 'success',
                    duration: 2000,
                  });
    
                  // 清除用户的本地缓存（如 Token）
                  wx.clearStorageSync();
    
                  // 跳转到登录页面或首页
                  wx.reLaunch({
                    url: '/pages/homepage/homepage', 
                  });
                } else {
                  wx.showToast({
                    title: res.data.error || '注销失败',
                    icon: 'error',
                    duration: 2000,
                  });
                }
              },
              fail: (err) => {
                console.error('注销失败:', err);
                wx.showToast({
                  title: '网络错误',
                  icon: 'error',
                  duration: 2000,
                });
              },
            });
          }
        },
      });
    }
})

  
