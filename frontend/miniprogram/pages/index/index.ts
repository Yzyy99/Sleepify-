const themeindex = require('../../utils/theme_index.js');
Page({
  data: {
    pageBackgroundColor: "#4A4A8E", // 页面背景色
    textColor: "#FFFFFF"            // 页面文字颜色
    //颜色暂时硬编码与原型设计统一，后续和夜间模式统一调整
  },
  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themeindex.applyTheme(this);
  },
  // 点击“设置睡眠提醒”跳转到提醒设置页面
  onSleepReminder() {
    console.log("设置睡眠提醒被点击")
    wx.navigateTo({
      url: '/pages/sleep_reminder/sleep_reminder'
    });
  },

  // 点击“睡觉啦”按钮，TODO:睡眠功能
  startSleep() {
    console.log("睡眠被点击")
    wx.showToast({
      title: '开始睡眠模式',
      icon: 'success',
      duration: 2000
    });
  },

  // 跳转到白噪音页面
  onWhiteNoise() {
    console.log("白噪音被点击")
    wx.navigateTo({
      url: '/pages/whitenoise/whitenoise'
    });
  },

  // 跳转到音乐页面
  onMusic() {
    console.log("音乐被点击")
    wx.navigateTo({
      url: '/pages/music/music'
    });
  },

  // 跳转到呼吸训练页面
  onBreathing() {
    console.log("呼吸训练被点击")
    wx.navigateTo({
      url: '/pages/breathing/breathing'
    });
  },

  // 跳转到睡眠小记页面
  onSleepJournal() {
    console.log("睡眠小记被点击")
    wx.navigateTo({
      url: '/pages/sleep_journal/sleep_journal'
    });
  }
});
