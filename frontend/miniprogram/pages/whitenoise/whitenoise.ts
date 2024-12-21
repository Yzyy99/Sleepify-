const themewhitenoise = require('../../utils/theme.js');
Page({
  data: {
    imageList: [
      { src: '/assets/wn_1.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_2.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_3.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_4.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_5.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_6.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_7.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_8.png', musicUrl: '/assets/wn1.mp3' },
      { src: '/assets/wn_9.png', musicUrl: '/assets/wn1.mp3' },
    ],
    isPlaying: false, // 是否正在播放
    isPaused: false,  // 是否已暂停
    currentStatus: '未在播放', // 初始状态
    currentAudio: null, // 当前的音频上下文对象
    currentMusicUrl: '' // 当前播放的音乐 URL
  },
  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    themewhitenoise.applyTheme(this);
  },
  // 点击图片事件处理：开始播放
  onImageTap(e:any) {
    const index = e.currentTarget.dataset.index; // 获取点击图片的索引
    const selectedMusicUrl = this.data.imageList[index].musicUrl; // 获取对应的音乐 URL

    // 如果已经在播放其他音乐，先停止
    if (this.data.currentAudio && this.data.isPlaying) {
      this.data.currentAudio.stop();
    }

    // 创建新的音频上下文对象
    const audio = wx.createInnerAudioContext();
    audio.src = selectedMusicUrl;

    // 播放音乐
    audio.play();

    // 更新状态
    this.setData({
      isPlaying: true,
      isPaused: false,
      currentStatus: '播放中',
      currentAudio: audio,
      currentMusicUrl: selectedMusicUrl
    });

    wx.showToast({
      title: '开始播放音乐',
      icon: 'none',
      duration: 2000
    });
  },

  // 播放/暂停控制：控制播放状态的切换
  togglePlay() {
    const audio = this.data.currentAudio;

    if (!audio) {
      wx.showToast({
        title: '没有正在播放的音乐',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (this.data.isPlaying && !this.data.isPaused) {
      // 当前正在播放，切换到暂停状态
      audio.pause();
      this.setData({
        isPaused: true,
        currentStatus: '已暂停'
      });
      wx.showToast({
        title: '音乐已暂停',
        icon: 'none',
        duration: 2000
      });
    } else if (this.data.isPlaying && this.data.isPaused) {
      // 当前已暂停，切换到播放状态
      audio.play();
      this.setData({
        isPaused: false,
        currentStatus: '播放中'
      });
      wx.showToast({
        title: '继续播放音乐',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 页面卸载时停止音乐
  onUnload() {
    if (this.data.currentAudio) {
      this.data.currentAudio.stop(); // 页面卸载时停止音乐
    }
  }
});