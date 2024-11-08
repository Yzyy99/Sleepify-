// pages/login/login.ts
// pages/login/login.js
Page({
  data: {
    username: '',  // 存储用户名
    password: ''   // 存储密码
  },

  // 用户名输入框输入事件
  onInputUsername(e: any) {
    this.setData({
      username: e.detail.value
    });
  },

  // 密码输入框输入事件
  onInputPassword(e: any) {
    this.setData({
      password: e.detail.value
    });
  },

  // 登录按钮点击事件
  onLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }
    wx.showToast({
      title: '成功！',
      icon: 'none'
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