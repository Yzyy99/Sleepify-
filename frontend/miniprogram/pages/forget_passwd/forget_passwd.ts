// pages/forget_passwd/forget_passwd.ts
const theme_forget_passwd = require('../../utils/theme.js')
Page({
  data: {
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  },

  onShow() {
    // 页面显示时根据全局状态应用主题
    const app = getApp();
    this.setData({
      isDarkMode: app.globalData.isDarkMode
    });
    theme_forget_passwd.applyTheme(this);  // 应用主题
  },
  // 获取输入的手机号
  onPhoneInput(event: any) {
    this.setData({
      phoneNumber: event.detail.value
    });
  },

  onValidationInput(event: any) {
    this.setData({
      validationCode: event.detail.value
    })
  },

  // 获取输入的密码
  onPasswordInput(event: any) {
    this.setData({
      password: event.detail.value
    });
  },

  // 获取确认密码
  onConfirmPasswordInput(event: any) {
    this.setData({
      confirmPassword: event.detail.value
    });
  },

  // 注册按钮逻辑
  onReset() {
    const { phoneNumber, validationCode, password, confirmPassword } = this.data;

    // 简单的表单验证
    if (!phoneNumber || !validationCode || !password || !confirmPassword) {
      wx.showToast({
        title: '请填写完整的信息',
        icon: 'none'
      });
      return;
    }

    // TODO: 检查验证码

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }

    // 模拟注册成功后的跳转
    wx.showToast({
      title: '重置成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 延时跳转到登录页面
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/login/login'  // 跳转到登录页面
          });
        }, 2000);  // 延迟2秒后跳转
      }
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});