
const themeRecord = require('../../utils/theme_index.js');

Page({
  data: {
    pageBackgroundColor: '',
    textColor: '',
    buttonBackgroundColor: '',
    buttonTextColor: '',
    highlightColor: '',
    shadowColor: '',
    sleepStartTime: '',
    sleepStartDate: '',
    wakeUpTime: '',
    wakeUpDate: '',
    onscreen: 0,
    avgNoise: 0,
    maxNoise: 0,
    sleepStatusInput: '',
    noteInput: '',
    timeArray: [
      Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), // 小时
      Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), // 分钟
    ],
    sleepTimeIndex: [0, 0],
    wakeTimeIndex: [0, 0],
    records: [] as any[]
  },

  convertToMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes;
  },


  onLoad(options: any) {
    // 获取从sleeping页面传递过来的开始时间
    const startTime = new Date(parseInt(options.startTime));
    const onscreen = parseInt(options.onscreen) ? parseInt(options.onscreen) : 0;
    const avgNoise = parseInt(options.avgNoise) ? parseInt(options.avgNoise) : 0;
    const maxNoise = parseInt(options.maxNoise) ? parseInt(options.maxNoise) : 0;
    const now = new Date();

    this.setData({
      sleepTimeIndex: [startTime.getHours(), startTime.getMinutes()],
      wakeTimeIndex: [now.getHours(), now.getMinutes()],
      sleepStartTime: this.formatTime(startTime),
      sleepStartDate: this.formatDate(startTime),
      onscreen: onscreen,
      avgNoise: avgNoise,
      maxNoise: maxNoise,
      wakeUpTime: this.formatTime(now),
      wakeUpDate: this.formatDate(now)
    });
  },

  // 入睡时间改变
  onSleepTimeChange(e: any) {
    const values = e.detail.value;
    const sleepHours = parseInt(this.data.timeArray[0][values[0]]);
    const sleepMinutes = parseInt(this.data.timeArray[1][values[1]]);
    const wakeHours = parseInt(this.data.timeArray[0][this.data.wakeTimeIndex[0]]);
    const wakeMinutes = parseInt(this.data.timeArray[1][this.data.wakeTimeIndex[1]]);

    const sleepTime = this.convertToMinutes(sleepHours, sleepMinutes);
    const wakeTime = this.convertToMinutes(wakeHours, wakeMinutes);

    if (sleepTime >= wakeTime) {
      // 如果入睡时间晚于或等于清醒时间，将清醒时间设置为入睡时间后1小时
      const newWakeHours = (sleepHours + 1) % 24;
      const newWakeTimeIndex = [newWakeHours, sleepMinutes];

      this.setData({
        sleepTimeIndex: values,
        wakeTimeIndex: newWakeTimeIndex,
        sleepStartTime: `${this.data.timeArray[0][values[0]]}:${this.data.timeArray[1][values[1]]}`,
        wakeUpTime: `${this.data.timeArray[0][newWakeHours]}:${this.data.timeArray[1][sleepMinutes]}`
      });

      wx.showToast({
        title: '清醒时间已自动调整',
        icon: 'none',
        duration: 2000
      });
    } else {
      this.setData({
        sleepTimeIndex: values,
        sleepStartTime: `${this.data.timeArray[0][values[0]]}:${this.data.timeArray[1][values[1]]}`
      });
    }
  },

  // 入睡时间列改变
  onSleepTimeColumnChange(e: any) {
    const data = {
      timeArray: this.data.timeArray,
      sleepTimeIndex: this.data.sleepTimeIndex
    };
    data.sleepTimeIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },

  // 清醒时间改变
  onWakeTimeChange(e: any) {
    const values = e.detail.value;
    const sleepHours = parseInt(this.data.timeArray[0][this.data.sleepTimeIndex[0]]);
    const sleepMinutes = parseInt(this.data.timeArray[1][this.data.sleepTimeIndex[1]]);
    const wakeHours = parseInt(this.data.timeArray[0][values[0]]);
    const wakeMinutes = parseInt(this.data.timeArray[1][values[1]]);

    const sleepTime = this.convertToMinutes(sleepHours, sleepMinutes);
    const wakeTime = this.convertToMinutes(wakeHours, wakeMinutes);

    if (wakeTime <= sleepTime) {
      wx.showToast({
        title: '清醒时间不能早于入睡时间',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      wakeTimeIndex: values,
      wakeUpTime: `${this.data.timeArray[0][values[0]]}:${this.data.timeArray[1][values[1]]}`
    });
  },

  // 清醒时间列改变
  onWakeTimeColumnChange(e: any) {
    const data = {
      timeArray: this.data.timeArray,
      wakeTimeIndex: this.data.wakeTimeIndex
    };
    data.wakeTimeIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },

  formatTime(date: Date): string {
    const hours = this.formatNumber(date.getHours());
    const minutes = this.formatNumber(date.getMinutes());
    return `${hours}:${minutes}`;
  },

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${this.formatNumber(date.getMonth() + 1)}-${this.formatNumber(date.getDate())}`;
  },

  formatNumber(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  },

  onShow() {
    themeRecord.applyTheme(this);
  },


  onInputSleepStatus(e: any) {
    this.setData({
      sleepStatusInput: e.detail.value,
    });
  },

  onInputNote(e: any) {
    this.setData({
      noteInput: e.detail.value,
    });
  },

  submitRecord() {
    const { sleepStatusInput, noteInput } = this.data;

    // 如果都没有填写内容
    if (!sleepStatusInput && !noteInput) {
      wx.showToast({
        title: "未输入睡眠小记",
        icon: "none",
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/report/report',
              fail: (error) => {
                console.error('页面跳转失败', error);
              }
            });
          }, 1500);
        }
      });
      return;
    }

    // 如果有填写内容，则保存到后端
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const url = "https://sleepify.top:8000/api/sleep-records/";

    wx.request({
      url: url,
      method: "POST",
      data: {
        date: date,
        sleep_time: this.data.sleepStartTime,
        wake_time: this.data.wakeUpTime,
        screen_on: this.data.onscreen,
        noise_max: this.data.maxNoise,
        noise_avg: this.data.avgNoise,
        sleep_status: sleepStatusInput || "",
        note: noteInput || "",
      },
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: "提交成功",
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/report/report',
                  fail: (error) => {
                    console.error('页面跳转失败', error);
                  }
                });
              }, 1500);
            }
          });

          this.setData({
            records: [
              ...this.data.records,
              { date: date, sleepStatus: sleepStatusInput || "", note: noteInput || "" },
            ],
            sleepStatusInput: "",
            noteInput: "",
          });
        } else {
          wx.showToast({
            title: "提交失败，请稍后再试",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("网络错误", err);
        wx.showToast({
          title: "网络错误，请稍后再试",
          icon: "none",
        });
      },
    });
  },


  abandonRecord() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
