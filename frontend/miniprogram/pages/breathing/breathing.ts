Page({
  data: {
    timeOptions: [1, 2, 3, 4, 5], // 时间选项
    selectedTimeIndex: 0, // 默认选中第一个选项
    selectedTime: 1, // 默认时间为1分钟
    selectedMethod: 'even', // 默认呼吸方式为均匀呼吸法
    isTraining: false, // 是否正在训练
    breathingText: '' // 当前呼吸提示
  },

  // 用户选择时间
  setTime(e: { detail: { value: any; }; }) {
    const index = e.detail.value;
    this.setData({
      selectedTimeIndex: index,
      selectedTime: this.data.timeOptions[index] // 设置时间
    });
  },

  // 用户选择呼吸方式
  selectMethod(e: { currentTarget: { dataset: { method: any; }; }; }) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      selectedMethod: method
    });
  },

  // 点击开始训练
  startBreathing() {
    console.log("呼吸训练开始按钮被点击");

    const { selectedTime, selectedMethod } = this.data;

    // 跳转到新页面并传递参数
    wx.navigateTo({
      url: `/pages/breathingDisplay/breathingDisplay?time=${selectedTime}&method=${selectedMethod}`
    });
  }
});
