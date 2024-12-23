// 引入 theme.js 工具文件
const themelogin = require('../../utils/theme.js');

// 成功时的响应结构
interface TokenResponse {
  refresh: string;
  access: string;
}

// 失败时的响应结构
interface ErrorResponse {
  error: string;
}

// 定义统一的响应类型
type ApiResponse = TokenResponse | ErrorResponse;

// 类型守卫函数：判断是否是 TokenResponse
function isTokenResponse(data: any): data is TokenResponse {
  return data && typeof data === "object" && "refresh" in data && "access" in data;
}

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
  onPhoneInput(event: any) {
    this.setData({
      phoneNumber: event.detail.value
    });
  },

  // 获取输入的密码
  onPasswordInput(event: any) {
    this.setData({
      password: event.detail.value
    });
  },

  // 登录按钮逻辑
  onLogin() {
    
    const { phoneNumber, password } = this.data;
    // for simple login
    /*
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 延时跳转到主页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        }, 2000);
      },
    });
    */

    // 简单的表单验证
    if (!phoneNumber || !password) {
      wx.showToast({
        title: '请填写手机号和密码',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://127.0.0.1:8000/api/login/',
      method: 'POST',
      data: {
        phone_number: phoneNumber,
        password: password,
      },
      success(res) {
        // 判断 HTTP 状态码
        if (res.statusCode === 200) {
          // 使用类型守卫判断 res.data 是否是成功的 TokenResponse
          if (isTokenResponse(res.data)) {
            const { access, refresh } = res.data;

            // 保存 token 到本地存储
            wx.setStorageSync('access_token', access);
            wx.setStorageSync('refresh_token', refresh);
            wx.setStorageSync('phone_number', phoneNumber);
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000,
              success: () => {
                // 延时跳转到主页
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/index/index',
                  });
                }, 2000);
              },
            });
          } else {
            // 如果数据格式不符合预期，显示错误提示
            wx.showToast({
              title: '数据格式错误',
              icon: 'none',
            });
          }
        } else {
          // 登录失败，处理错误数据
          const errorData = res.data as ErrorResponse; // 断言为 ErrorResponse
          wx.showToast({
            title: errorData.error || '登录失败',
            icon: 'none',
          });
        }
      },
      fail() {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
      },
    });
   


  },

  onBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
