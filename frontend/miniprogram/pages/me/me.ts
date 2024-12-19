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
    const phone = wx.getStorageSync('phone_number'); // 获取登录时保存的手机号
    if (phone) {
      this.setData({
        username: phone, // 将手机号设置为用户名
        phone: phone     // 设置手机号
      });
    } else {
      console.error("手机号未找到，请检查登录逻辑是否正确保存了手机号。");
    }
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
      wx.clearStorageSync(); // 清除本地存储
      wx.reLaunch({
        url: '/pages/homepage/homepage' // 跳转回登录页面
      });
    }
})
