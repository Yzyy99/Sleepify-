const theme = require('../../utils/theme.js')

Page({
  data: {
    isDarkMode: false  // 初始为日间模式
  },

  onShow() {
    // 页面显示时根据全局状态应用主题
    const app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    });
    theme.applyTheme(this);  // 应用主题
  },

  onToggleDarkMode(e: any) {
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
    theme.applyTheme(this);
  },

  onLogin() {
    // 登录按钮点击事件处理
    console.log("登录按钮被点击");
    wx.navigateTo({
      url: '/pages/login/login' // 跳转到登录页面
    });
  },

  onRegister() {
    // 注册按钮点击事件处理
    console.log("注册按钮被点击");
    wx.navigateTo({
      url: '/pages/register/register' // 跳转到注册页面
    });
  },

  toTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },
});
