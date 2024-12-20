const app2 = getApp()
Page({
  data: {
    breathingText: '', // 当前呼吸提示
    countdownText: '', // 倒计时
    bubbleScale: 1, // 气泡缩放比例
    bubbleTransitionDuration: 2, // 气泡变化时间
    isTraining: false, // 是否正在训练
    isDarkMode: app2.globalData.isDarkMode, // 是否夜间模式
    methodName: '', // 当前呼吸训练方法名称
  },

  // 声明 interval 变量
  interval: null as any, // 将 interval 明确声明为 any 类型


  onLoad(options:any) {
    const time = parseInt(options.time); // 接收时间
    const method = options.method; // 接收呼吸方式

    console.log('时间：', time, '呼吸方式：', method);

    this.setData({ 
      isTraining: true,
      methodName: this.getMethodName(method), // 设置呼吸训练方法名称
    });

    // 动态设置页面主题
    this.themeBreathingDisplay();

    // 开始训练
    this.startTimer(time * 60, method);
  },

  // 页面卸载时停止倒计时
  onUnload() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },


  // 获取呼吸训练方法的中文名称
  getMethodName(method:any) {
    switch(method) {
      case 'even':
        return '均匀呼吸法';
      case '478':
        return '4-7-8 呼吸法';
      default:
        return '呼吸训练';
    }
  },


  // 应用主题
  themeBreathingDisplay() {
    const isDarkMode = this.data.isDarkMode;
    if (isDarkMode) {
      this.setData({
        pageBackgroundColor: '#1E1E2F', // 深蓝灰背景
        textColor: '#F4F4F9', // 柔和白色文字
        bubbleColor: '#28293E', // 深色气泡颜色
      });
      wx.setNavigationBarColor({
        frontColor: '#ffffff', // 导航栏文字白色
        backgroundColor: '#1E1E2F', // 导航栏背景深蓝灰
      });
      wx.setTabBarStyle({
        backgroundColor: '#1E1E2F', // 导航栏背景深蓝灰
      });
    } else {
      this.setData({
        pageBackgroundColor: '#f5f5dc', // 浅米色背景
        textColor: '#333', // 深灰色文字
        bubbleColor: '#DCE4C9', // 浅色气泡颜色
      });
      wx.setNavigationBarColor({
        frontColor: '#000000', // 导航栏文字黑色
        backgroundColor: '#f5f5dc', // 导航栏背景浅米色
      });
      wx.setTabBarStyle({
        backgroundColor: '#f5f5dc',
      });
    }
  },

  // 呼吸训练计时器
  startTimer(totalSeconds:any, method:any) {
    let remainingSeconds = totalSeconds;

    // 保存 setInterval 的引用
    this.interval = setInterval(() => {
      if (remainingSeconds <= 0) {
        clearInterval(this.interval);
        this.setData({
          isTraining: false,
          breathingText: '',
          countdownText: '训练完成',
          bubbleScale: 1, // 恢复气泡大小
        });
        wx.showToast({ title: '训练完成', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack(); // 返回设置页面
        }, 1000);
        return;
      }

      // 更新倒计时
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      this.setData({
        countdownText: `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`,

      });

      // 更新呼吸提示和气泡大小
      let text = '';
      let scale = 1; // 气泡默认大小
      let transitionDuration = 2; // 默认变化时间为 2 秒
      if (method === 'even') {
        text = remainingSeconds % 4 < 2 ? '吸气' : '呼气';
        scale = remainingSeconds % 4 < 2 ? 1.5 : 0.8; // 吸气放大，呼气缩小
        transitionDuration = 2; // 均匀呼吸，固定 2 秒
      } else if (method === '478') {
        const cycle = 19 - (remainingSeconds % 19); // 4-7-8 总周期

        if (cycle < 4) {
          text = '吸气';
          scale = 1.5;
          transitionDuration = 4; // 吸气持续 4 秒
        } else if (cycle < 11) {
          text = '屏气';
          scale = 1.5; // 屏气
          transitionDuration = 7; // 屏气持续 7 秒
        } else {
          text = '呼气';
          scale = 0.8;
          transitionDuration = 8; // 呼气持续 8 秒
        }
      }

      this.setData({
        breathingText: text,
        bubbleScale: scale,
        bubbleTransitionDuration: transitionDuration, // 动态更新气泡变化时间
      });

      remainingSeconds -= 1;
    }, 1000);
  },
});
