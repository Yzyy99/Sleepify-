// pages/forget_passwd/forget_passwd.ts

Page({
  data: {
    phoneNumber: '12345678901',
    newPhoneNumber: '',
    validationCode: '',
    newValidationCode: ''
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themeregister.applyTheme(this);
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

  onNewPhoneInput(event: any) {
    this.setData({
      newPhoneNumber: event.detail.value
    });
  },

  // 获取确认密码
  onNewValidationInput(event: any) {
    this.setData({
      newValidationCode: event.detail.value
    });
  },

  // 注册按钮逻辑
  onReset() {
    const { phoneNumber, validationCode, newPhoneNumber, newValidationCode } = this.data;

    // 简单的表单验证
    if (!phoneNumber || !validationCode || !newPhoneNumber || !newValidationCode) {
      wx.showToast({
        title: '请填写完整的信息',
        icon: 'none'
      });
      return;
    }

    // TODO: 检查验证码


    // 模拟注册成功后的跳转
    wx.showToast({
      title: '手机号更新成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        wx.navigateBack({
          delta: 1
        });
      }
    });
  },

  onBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
