
const themereport = require('../../utils/theme.js');
Page({
  data: {
    sleepTime: "22:00",
    wakeTime: "06:00",
    sleepDuration: 8,
    screenon: 4,
    noiseAvg: 30,
    noiseMax: 60,
    sleepStatus: "",
    sleepNote: "",
    sleepGrade: 95,
    report: "", // 存储从后端获取的报告
    //report : "哦哦，看来昨晚你心里住着一个小夜猫子呢！有时候，偶尔熬个夜玩手机似乎是种乐趣，但要小心别养成习惯哦，因为这样会打乱身体的生物钟。\n\n从你昨晚的记录来看，你总共睡了6.5小时。成年人通常需要7到9小时的睡眠哦，所以你可以尝试每天让自己多睡一点。能不能试试睡前放下手机？给自己个晚上关机的时间，比如在睡觉前半小时到一小时，这样有助于让你的大脑慢慢放松下来，更快进入睡眠状态。\n\n如果晚上真想玩手机，不如调整到温暖的夜间模式，或者用一些蓝光过滤器，这样可以减少对睡眠的干扰。也可以考虑用听轻柔的音乐或冥想应用程序来帮助你入眠哦！\n\n其实，只要给自己多一些休息的时间，你会发现第二天的精力充沛和愉悦感会大大提升。如果你愿意，今晚上我们来一起为个好觉努力吧！"

    mentalState: "良",
    regularity: "优",
    healthRisk: "高",
    healthImage: "../../assets/dog_sleeping.png",
    suggest: "睡前一小时放下手机，听轻柔音乐或冥想，有助于快速入睡！",


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
    this.calculateSleepGrade();
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

          this.calculateSleepGrade();

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

  // 计算睡眠评分
  calculateSleepGrade() {

    // calculate sleep grade
    // TODO: more accurate calculation
    let sleepGrade = 100;
    var sleep_duration = this.data.sleepDuration;
    var screen_on = this.data.screenon;
    var noise_avg = this.data.noiseAvg;
    var noise_max = this.data.noiseMax;
    if (sleep_duration < 7) {
      sleepGrade -= 5;
    }
    if (sleep_duration <= 5) {
      sleepGrade -= 5;
    }
    if (sleep_duration <= 3) {
      sleepGrade -= 5;
    }
    if (screen_on >= 3) {
      sleepGrade -= 5;
    }
    if (screen_on >= 5) {
      sleepGrade -= 5;
    }
    if (screen_on >= 7) {
      sleepGrade -= 5;
    }
    if (noise_avg > 30) {
      sleepGrade -= 5;
    }
    if (noise_avg > 50) {
      sleepGrade -= 5;
    }
    if (noise_max > 60) {
      sleepGrade -= 5;
    }
    var sleepH = parseInt(this.data.sleepTime.split(":")[0]);
    var wakeH = parseInt(this.data.wakeTime.split(":")[0]);
    if (sleepH < 12) {
      sleepGrade -= 5;
      if (sleepH >= 1) {
        sleepGrade -= 5;
      }
      if (sleepH >= 3) {
        sleepGrade -= 10;
      }
    }
    if (wakeH >= 9) {
      sleepGrade -= 5;
      if (wakeH >= 11) {
        sleepGrade -= 5;
      }
    }

    this.setData({
      sleepGrade: sleepGrade,
    });

    var mental = "优";
    var regularity = "优";
    var healthRisk = "高";

    // 配置健康建议
    if (sleep_duration <= 5 || sleep_duration >= 10 || noise_avg > 60) {
      mental = "差";
    } else if (sleep_duration <= 7 || sleep_duration >= 9 || noise_avg > 50) {
      mental = "良";
    } else {
      mental = "优";
    }

    if (screen_on >= 5 || noise_avg > 60 || (sleepH < 12 && sleepH >= 3) || (wakeH >= 10 && wakeH <= 12)) {
      regularity = "差";
    } else if (screen_on >= 3 || noise_avg > 50 || (sleepH < 12) || (wakeH >= 9 && wakeH <= 10)) {
      regularity = "良";
    } else {
      regularity = "优";
    }

    if (sleep_duration <= 5 || sleep_duration >= 10 || noise_avg > 80 || (sleepH < 12 && sleepH >= 3) || (wakeH >= 11 && wakeH <= 12)) {
      healthRisk = "高";
    } else if (sleep_duration <= 7 || sleep_duration >= 9 || noise_avg > 60 || (sleepH < 12) || (wakeH >= 9 && wakeH <= 10)) {
      healthRisk = "中";
    } else {
      healthRisk = "低";
    }

    var suggest = ""
    var suggestList_low = [
      "每天晚上尽量在同一时间上床睡觉，以帮助调节生物钟。",
      "睡前一小时避免使用电子设备，以减少蓝光对睡眠的干扰。",
      "尝试冥想或深呼吸练习，以缓解压力和焦虑。",
      "确保卧室环境舒适，保持适宜的温度和黑暗。",
      "避免在下午和晚上摄入咖啡因和酒精，以防止影响睡眠。",
    ]
    var suggestList_mid = [
      "尝试增加每天的运动量，但避免临近睡前进行剧烈运动。",
      "养成睡前阅读纸质书籍的习惯，以帮助身体放松。",
      "使用舒缓的香薰或听轻音乐来营造放松的睡眠氛围。",
      "保持饮食规律，避免临睡前进食过多或过于油腻的食物。",
      "确保枕头和床垫适合自己的睡姿和舒适需求。",
    ]

    var suggestList_high = [
      "继续保持规律的睡眠时间表，以维持良好的生物钟。",
      "每天坚持适度的体育锻炼，增强身体的疲劳感。",
      "保持卧室仅作为睡眠和休息的场所，减少其他活动。",
      "定期评估和调整卧室环境，以确保最佳的睡眠条件。",
      "在周末尽量避免过长时间的睡懒觉，以维持正常的作息规律。",
    ];

    if (mental == "差" || regularity == "差" || healthRisk == "高") {
      suggest = suggestList_low[Math.floor(Math.random() * suggestList_low.length)];
    } else if (mental == "良" || regularity == "良" || healthRisk == "中") {
      suggest = suggestList_mid[Math.floor(Math.random() * suggestList_mid.length)];
    } else {
      suggest = suggestList_high[Math.floor(Math.random() * suggestList_high.length)];
    }

    var picturemap: { [key: number]: string } = {
      0: "../../assets/dog_boom.png",
      30: "../../assets/dog_ill.png",
      40: "../../assets/dog_hurt.png",
      50: "../../assets/dog_sleeping.png",
      60: "../../assets/dog_nap.png",
      70: "../../assets/dog_sweat.png",
      80: "../../assets/dog_sleepy.png",
      90: "../../assets/dog_happy.png",
    }

    for (var key in picturemap) {
      if (sleepGrade >= Number(key)) {
        this.setData({
          healthImage: picturemap[Number(key)]
        });
      }
    }

    this.setData({
      mentalState: mental,
      regularity: regularity,
      healthRisk: healthRisk,
      suggest: suggest
    });
  },

});
