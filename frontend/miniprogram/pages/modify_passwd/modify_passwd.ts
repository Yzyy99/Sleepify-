// 引入 theme.js 工具文件
const thememodifypassword = require('../../utils/theme.js');
Page({
  data: {
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    verificationCode: '', // 验证码
    token: '', // 临时 token，用于验证验证码
    isCodeSent: false, // 是否已发送验证码
    countdown: 60, // 倒计时
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    thememodifypassword.applyTheme(this);
  },

  // 获取输入的手机号
  onPhoneInput(event: any) {
    this.setData({
      phoneNumber: event.detail.value
    });
  },

  // 获取输入的验证码
  onCodeInput(event: any) {
    this.setData({
      verificationCode: event.detail.value
    });
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

  // 发送验证码
  onSendCode() {
    const { phoneNumber } = this.data;

    // 校验手机号是否为空
    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    // 发送验证码请求
    wx.request({
      url: 'http://127.0.0.1:8000/api/send_verification_code_without_check/', 
      method: 'POST',
      data: { phone_number: phoneNumber },
      success: (res:any) => {
        if (res.statusCode === 200) {
          this.setData({
            isCodeSent: true,
            token: res.data.token // 保存后端返回的 token
          });

          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });

          // 开始倒计时
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.error || '发送验证码失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error(err); // 打印错误信息
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 倒计时逻辑
  startCountdown() {
    let countdown = this.data.countdown;

    const timer = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          countdown: 60,
          isCodeSent: false // 倒计时结束后可以重新发送验证码
        });
      } else {
        this.setData({
          countdown: countdown - 1
        });
        countdown -= 1;
      }
    }, 1000);
  },

  // 注册按钮逻辑
  onRegister() {
    const { phoneNumber, password, confirmPassword, verificationCode, token } = this.data;

    // 简单的表单验证
    if (!phoneNumber || !password || !confirmPassword || !verificationCode) {
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

    // 验证验证码并完成注册
    wx.request({
      url: 'http://127.0.0.1:8000/api/verify-code/', 
      method: 'POST',
      data: {
        token: token,
        code: verificationCode,
        password: password
      },
      success: (res:any) => {
        if (res.statusCode === 200) {
          // 修改成功
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              // 跳转到登录页面
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/login/login'
                });
              }, 2000);
            }
          });
        } else {
          // 修改失败，显示错误信息
          wx.showToast({
            title: res.data.error || '修改失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
});