
const themereport = require('../../utils/theme.js');
Page({
  data: {
    sleepTime: "22:00",
    wakeTime: "06:00",
    sleepDuration: "8",
    screenon: 4,
    noiseAvg: 30,
    noiseMax: 60,
    sleepStatus: "",
    sleepNote: "",
    sleepGrade: 95,
    report: "", // 存储从后端获取的报告
    //report : "哦哦，看来昨晚你心里住着一个小夜猫子呢！有时候，偶尔熬个夜玩手机似乎是种乐趣，但要小心别养成习惯哦，因为这样会打乱身体的生物钟。\n\n从你昨晚的记录来看，你总共睡了6.5小时。成年人通常需要7到9小时的睡眠哦，所以你可以尝试每天让自己多睡一点。能不能试试睡前放下手机？给自己个晚上关机的时间，比如在睡觉前半小时到一小时，这样有助于让你的大脑慢慢放松下来，更快进入睡眠状态。\n\n如果晚上真想玩手机，不如调整到温暖的夜间模式，或者用一些蓝光过滤器，这样可以减少对睡眠的干扰。也可以考虑用听轻柔的音乐或冥想应用程序来帮助你入眠哦！\n\n其实，只要给自己多一些休息的时间，你会发现第二天的精力充沛和愉悦感会大大提升。如果你愿意，今晚上我们来一起为个好觉努力吧！"

    generatingReport: false
  },
  showSoundInfo: function () {
    wx.showModal({
      title: "提示",
      content: "小程序使用手机监测声音功能暂未监测到睡眠声音。声音检测功能需要启用麦克风，检测期间需要保持小程序在前台和亮屏状态。",
      showCancel: false, // 隐藏取消按钮
      confirmText: "知道了", // 确认按钮文字
      confirmColor: "#007aff", // 确认按钮颜色
    });
  },


  onShow() {
    themereport.applyTheme(this);
    this.fetchSleepData();
  },

  fetchSleepData() {
    const url = "http://127.0.0.1:8000/api/sleep-data/";
    wx.request({
      url: url,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          this.setData({
            sleepTime: res.data.sleep_time,
            wakeTime: res.data.wake_time,
            sleepDuration: res.data.sleep_duration,
            screenon: res.data.screen_on,
            noiseAvg: res.data.noise_avg,
            noiseMax: res.data.noise_max,
            sleepStatus: res.data.sleep_status,
            sleepNote: res.data.sleep_note,
          });
          console.log(res.data);

          // calculate sleep grade
          // TODO: more accurate calculation
          let sleepGrade = 100;
          if (res.data.sleep_duration < 7) {
            sleepGrade -= 5;
          }
          if (res.data.sleep_duration <= 5) {
            sleepGrade -= 5;
          }
          if (res.data.sleep_duration <= 3) {
            sleepGrade -= 5;
          }
          if (res.data.screen_on >= 3) {
            sleepGrade -= 5;
          }
          if (res.data.screen_on >= 5) {
            sleepGrade -= 5;
          }
          if (res.data.screen_on >= 7) {
            sleepGrade -= 5;
          }
          if (res.data.noise_avg > 30) {
            sleepGrade -= 5;
          }
          if (res.data.noise_avg > 50) {
            sleepGrade -= 5;
          }
          if (res.data.noise_max > 60) {
            sleepGrade -= 5;
          }
          this.setData({
            sleepGrade: sleepGrade,
          });

        } else {
          wx.showToast({
            title: "获取睡眠数据失败",
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

  // 获取睡眠报告
  fetchSleepReport() {
    if (this.data.generatingReport) return;
    this.setData({
      generatingReport: true
    })
    const { sleepTime } = this.data;
    const url = "http://127.0.0.1:8000/api/sleep-analysis/";

    wx.request({
      url: url,
      method: "POST",
      data: {
        // sleep_time: sleepTime, // 向后端传递睡眠时间
        // screen_on: 3,
        // noise_max: 70,
        // noise_avg: 30,
      },
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + wx.getStorageSync("access_token"),
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          this.setData({
            report: res.data.report, // 更新报告内容
            generatingReport: false
          });
        } else {
          wx.showToast({
            title: "获取报告失败",
            icon: "none",
          });
          this.setData({
            generatingReport: false
          })
        }
      },
      fail: (err) => {
        console.error("网络错误", err);
        wx.showToast({
          title: "网络错误，请稍后再试",
          icon: "none",
        });
        this.setData({
          generatingReport: false
        })
      },
    });
  },

});
