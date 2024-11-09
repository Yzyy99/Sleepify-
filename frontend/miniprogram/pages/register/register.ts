// 引入 theme.js 工具文件
const themeregister = require('../../utils/theme.js');

Page({
  data: {
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themeregister.applyTheme(this);
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

  // 获取确认密码
  onConfirmPasswordInput(event: any) {
    this.setData({
      confirmPassword: event.detail.value
    });
  },

  // 注册按钮逻辑
  onRegister() {
    const { phoneNumber, password, confirmPassword } = this.data;

    // 简单的表单验证
    if (!phoneNumber || !password || !confirmPassword) {
      wx.showToast({
        title: '请填写完整的信息',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }

    // 模拟注册成功后的跳转
    wx.showToast({
      title: '注册成功',
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
  }
});