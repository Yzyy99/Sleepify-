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
    timer: null as any,

    beginScreenCount: false,
    screenonCount: 0,
    recordmode: false,
    recordoption: 0,
    currentNoiseTime: 0,
    totalNoiseTime: -1,
    recorder_message: "噪声记录未启用",
    currentDbValue: 0,
    avgDbValue: 0,
    maxDbValue: 0,
    dbValues: [] as number[],
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
    if (this.data.beginScreenCount) {
      this.setData({
        screenonCount: this.data.screenonCount + 1
      })
    } else {
      this.setData({
        beginScreenCount: true
      })
    }
    if (this.data.recordmode) {
      wx.getRecorderManager().stop()
      this.enableRecorder()
    }
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
  },

  enableRecorder() {
    var recorder = wx.getRecorderManager()
    recorder.start({
      duration: 60000,
      sampleRate: 8000,
      encodeBitRate: 16000,
      format: 'PCM',
      numberOfChannels: 1,
      frameSize: 8,
    })
    recorder.onStart(() => {
      console.log('recorder start')
      this.setData({
        recorder_message: "噪声记录中"
      })
    })
    recorder.onFrameRecorded((res) => {
      var framebuffer = res.frameBuffer
      // 分析音频流，得到分贝
      const arrayBuffer = new Int32Array(framebuffer)
      let sum = 0
      for (let i = 0; i < arrayBuffer.length; i += 32) {
        sum += arrayBuffer[i] * arrayBuffer[i] / arrayBuffer.length * 32
      }
      // console.log('len: ', arrayBuffer.length)
      // console.log('sum: ', sum)
      const rms = Math.sqrt(sum)

      // // get abs
      // arrayBuffer.forEach((value, index) => {
      //   arrayBuffer[index] = Math.abs(value)
      // })
      // const max = Math.max(...arrayBuffer)

      const decibels = Math.round(10 * Math.log10(rms))
      if (decibels > 0 && decibels < 200){
        console.log('Current decibels: ', decibels)
        this.setData({
          currentDbValue: decibels,
          dbValues: [...this.data.dbValues, decibels],
          maxDbValue: Math.max(this.data.maxDbValue, decibels),
        })
        this.setData({
          avgDbValue: Math.round((this.data.avgDbValue * (this.data.dbValues.length - 1) + decibels) / this.data.dbValues.length)
        })
      }
    })
    recorder.onError((res) => {
      console.log(res.errMsg)
      this.setData({
        recorder_message: "噪声记录中止"
      })
    })
    recorder.onStop((res) => {
      recorder.stop()
      this.setData({
        currentNoiseTime: this.data.currentNoiseTime + 1
      })
      if (this.data.totalNoiseTime != -1 && this.data.currentNoiseTime >= this.data.totalNoiseTime) {
        this.setData({
          recordmode: false,
          recorder_message: "噪声记录结束"
        })
        wx.setKeepScreenOn({
          keepScreenOn: false
        })

      } else {
        recorder.start({
          duration: 60000,
          sampleRate: 8000,
          encodeBitRate: 16000,
          format: 'PCM',
          numberOfChannels: 1,
          frameSize: 8,
        })
      }

    })

  },

  startRecordNoise() {
    wx.showModal({
      title: '提示',
      content: '噪声检测将启用麦克风功能，且需保持小程序在前台并亮屏，可能会消耗更多电量。是否继续？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showActionSheet({
            itemList: ['直至睡眠结束', '30min', '1h', '2h', '3h', '6h'],
            success: (res) => {
              console.log(res.tapIndex)
              this.setData({
                recordmode: true,
                recordoption: res.tapIndex,
                currentNoiseTime: 0,
                totalNoiseTime: -1,
                recorder_message: "噪声记录中",
                currentDbValue: 0,
                avgDbValue: 0,
                maxDbValue: 0,
                dbValues: []
              })
              const timeList = [-1, 30, 60, 120, 180, 360]
              this.setData({
                totalNoiseTime: timeList[res.tapIndex]
              })
              wx.setKeepScreenOn({
                keepScreenOn: true
              })
              this.enableRecorder()
            },
            fail: (res) => {
              console.log(res.errMsg)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          return;
        }
      }
    })
  },

  stopRecordNoise() {
    wx.getRecorderManager().stop()
    this.setData({
      recordmode: false,
      recorder_message: "噪声记录结束"
    })
  }
});
