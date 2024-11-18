Page({
  data: {
    breathingText: '', // 当前呼吸提示
    countdownText: '', // 倒计时
    bubbleScale: 1, // 气泡缩放比例，1为初始大小
    bubbleTransitionDuration: 2, // 气泡变化时间（秒）
    isTraining: false // 是否正在训练
  },

  onLoad(options: any) {
    const time = parseInt(options.time); // 接收时间
    const method = options.method; // 接收呼吸方式

    console.log("时间：", time, "呼吸方式：", method);

    this.setData({ isTraining: true });
    this.startTimer(time * 60, method); // 开始训练
  },

  // 呼吸训练计时器
  startTimer(totalSeconds: number, method: string) {
    let remainingSeconds = totalSeconds;

    const interval = setInterval(() => {
      if (remainingSeconds <= 0) {
        clearInterval(interval);
        this.setData({
          isTraining: false,
          breathingText: '',
          countdownText: '训练完成',
          bubbleScale: 1 // 恢复气泡大小
        });
        wx.showToast({ title: '训练完成', icon: 'success'});
        setTimeout(() => {
          wx.navigateBack(); // 返回设置页面
        }, 1000);
        return;
      }

      // 更新倒计时
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      this.setData({
        countdownText: `${minutes}:${seconds}`
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
        const cycle = 19- remainingSeconds % 19; // 4-7-8 总周期
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
        bubbleTransitionDuration: transitionDuration // 动态更新气泡变化时间
      });

      remainingSeconds -= 1;
    }, 1000);
  }
});
