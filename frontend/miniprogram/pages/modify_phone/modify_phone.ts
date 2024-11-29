const themeModifyPhone = require('../../utils/theme.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    oldPhoneNumber: "", // 当前绑定的旧手机号
    newPhoneNumber: "", // 用户输入的新手机号
    verificationCode: "", // 用户输入的验证码
    isCodeSent: false, // 验证码是否已发送
    countdown: 60, // 验证码发送倒计时
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themeModifyPhone.applyTheme(this);

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 获取登录时保存的旧手机号
    const oldPhone = wx.getStorageSync("phone_number");
    if (oldPhone) {
      this.setData({
        oldPhoneNumber: oldPhone, // 设置旧手机号
      });
    } else {
      console.error("手机号未找到，请检查登录逻辑是否正确保存了手机号。");
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 2000,
      });
    }
  },

  /**
   * 获取用户输入的新手机号
   */
  onPhoneInput(event: any) {
    this.setData({
      newPhoneNumber: event.detail.value,
    });
  },

  /**
   * 获取用户输入的验证码
   */
  onCodeInput(event: any) {
    this.setData({
      verificationCode: event.detail.value,
    });
  },

  /**
   * 发送验证码到新手机号
   */
  onSendCode() {
    const { newPhoneNumber } = this.data;

    // 检查新手机号是否为空
    if (!newPhoneNumber) {
      wx.showToast({
        title: "请输入新手机号",
        icon: "none",
      });
      return;
    }

    // 发送验证码请求
    wx.request({
      url: "http://127.0.0.1:8000/api/send_verification_code/", // 替换为后端接口地址
      method: "POST",
      data: { phone_number: newPhoneNumber },
      success: (res: any) => {
        if (res.statusCode === 200) {
          this.setData({
            isCodeSent: true,
          });

          wx.showToast({
            title: "验证码已发送",
            icon: "success",
          });

          // 开始倒计时
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.error || "发送验证码失败",
            icon: "none",
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: "网络错误，请稍后重试",
          icon: "none",
        });
      },
    });
  },

  /**
   * 验证码倒计时逻辑
   */
  startCountdown() {
    let countdown = this.data.countdown;

    const timer = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          countdown: 60,
          isCodeSent: false, // 倒计时结束后可以重新发送验证码
        });
      } else {
        this.setData({
          countdown: countdown - 1,
        });
        countdown -= 1;
      }
    }, 1000);
  },

  /**
   * 提交手机号修改
   */
  onSubmit() {
    const {verificationCode, oldPhoneNumber, newPhoneNumber, } = this.data;

    // 检查表单是否填写完整
    if (!newPhoneNumber || !verificationCode) {
      wx.showToast({
        title: "请填写完整的信息",
        icon: "none",
      });
      return;
    }

    // 提交修改请求
    wx.request({
      url: "http://127.0.0.1:8000/api/verify-code-and-update-phone/", // 替换为后端接口地址
      method: "POST",
      data: {
        code: verificationCode, // 验证码
        old_phone_number: oldPhoneNumber, // 当前绑定的旧手机号
        phone_number: newPhoneNumber, // 用户输入的新手机号
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: "手机号修改成功",
            icon: "success",
          });

          // 更新本地存储的手机号
          wx.setStorageSync("phone_number", newPhoneNumber);

          // 跳转到个人中心或其他页面
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/login/login", // 替换为实际的页面路径
            });
          }, 2000);
        } else {
          wx.showToast({
            title: res.data.error || "修改手机号失败",
            icon: "none",
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: "网络错误，请稍后重试",
          icon: "none",
        });
      },
    });
  },
});