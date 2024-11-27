// pages/forget_passwd/forget_passwd.ts
const themeModifyPasswd = require('../../utils/theme.js');
Page({
  data: {
    phoneNumber: '12345678901',
    validationCode: '',
    password: '',
    confirmPassword: ''
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themeModifyPasswd.applyTheme(this);
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
      title: '修改成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // TODO: 退出登录状态
        // 延时跳转到登录页面
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }, 2000);
      }
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
