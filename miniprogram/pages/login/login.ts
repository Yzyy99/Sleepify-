// 引入 theme.js 工具文件
const themelogin = require('../../utils/theme.js');

Page({
  data: {
    phoneNumber: '',
    password: ''
  },
  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themelogin.applyTheme(this);
  },
  // 获取输入的手机号
  onPhoneInput(event:any) {
    this.setData({
      phoneNumber: event.detail.value
    });
  },

  // 获取输入的密码
  onPasswordInput(event:any) {
    this.setData({
      password: event.detail.value
    });
  },

  // 登录按钮逻辑
  onLogin() {
    const { phoneNumber, password } = this.data;

    // 简单的表单验证
    if (!phoneNumber || !password) {
      wx.showToast({
        title: '请填写手机号和密码',
        icon: 'none'
      });
      return;
    }

    // 模拟登录成功后的跳转
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 延时跳转到主页
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index'  // 跳转到主页
          });
        }, 2000);  // 延迟2秒后跳转
      }
    });
    /*
    // 发起网络请求，验证用户名和密码
    wx.request({
      url: 'https://your-server-url.com/login', // 替换为你的服务器地址
      method: 'POST',
      data: {
        username,
        password
      },
      success(res) {
        if (res.data) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          // 登录成功后跳转到主页
          wx.switchTab({
            url: '/pages/index/index'
          });
        } else {
          wx.showToast({
            title: '用户名或密码错误',
            icon: 'none'
          });
        }
      }
    });
    */
  }
});