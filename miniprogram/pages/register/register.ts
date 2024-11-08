// pages/register/register.js
Page({
  data: {
    username: '',
    password: ''
  },

  // 输入框事件：获取用户名
  onInputUsername(e: any) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入框事件：获取密码
  onInputPassword(e: any) {
    this.setData({
      password: e.detail.value
    });
  },

  // 注册按钮点击事件
  onRegister() {
    const { username, password } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 这里可以将注册信息发送到服务器
    // wx.request({
    //   url: 'https://your-server-url.com/register',
    //   method: 'POST',
    //   data: {
    //     username,
    //     password
    //   },
    //   success(res) {
    //     // 注册成功后跳转到登录页面
    //     wx.navigateTo({
    //       url: '/pages/login/login'
    //     });
    //   }
    // });

    // 模拟注册成功，直接跳转到登录页面
    wx.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 2000
    });

    // 使用 wx.navigateTo 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/login'  // 跳转到 login 页面
    });
  }
});