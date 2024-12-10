const themesleeping = require('../../utils/theme_index.js');

Page({
  data: {
    pageBackgroundColor: '',
    textColor: '',
    buttonBackgroundColor: '',
    buttonTextColor: '',
    highlightColor: '',
    shadowColor: '',
    currentTime: '',
    durationTime: '00:00',
    startTime: 0,
    timer: null as any
  },

  onLoad() {
    this.setData({
      startTime: Date.now()
    });
    this.startTimer();
    this.updateCurrentTime();
  },

  onShow() {
    themesleeping.applyTheme(this);
  },

  onHide() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  updateCurrentTime() {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      this.setData({
        currentTime: `${hours}:${minutes}`
      });
    };
    
    updateTime();
    setInterval(updateTime, 1000);
  },

  startTimer() {
    this.data.timer = setInterval(() => {
      const currentTime = Date.now();
      const diff = currentTime - this.data.startTime;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      this.setData({
        durationTime: `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`
      });
    }, 1000);
  },

  stopRecord() {
    wx.navigateTo({
      url: `/pages/sleep_reminder/sleep_reminder?startTime=${this.data.startTime}`
    });
  }
});