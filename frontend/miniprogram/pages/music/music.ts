const thememusic = require('../../utils/theme_index.js');
Page({
  data: {
    recentPlayList: [
      { src: '/assets/music1.png', musicUrl: '/assets/music_1.mp3', title: "Closer" },
      { src: '/assets/music2.png', musicUrl: '/assets/music_2.mp3', title: "I Got Smoke" },
      { src: '/assets/music3.png', musicUrl: '/assets/music_3.mp3', title: "Something" }
    ],
    recommendedPlayList: [
      { src: '/assets/music4.png', musicUrl: '/assets/music_4.mp3', title: "静谧古典" },
      { src: '/assets/music5.png', musicUrl: '/assets/music_5.mp3', title: "动漫奇旅" },
      { src: '/assets/music6.png', musicUrl: '/assets/music_6.mp3', title: "轻音梦想" },
      { src: '/assets/music7.png', musicUrl: '/assets/music_7.mp3', title: "人声低语" }
    ],
    isPlaying: false,  // 是否正在播放
    isPaused: false,   // 是否已暂停
    currentStatus: '未在播放',  // 播放状态
    currentAudio: null,  // 当前的音频上下文对象
    currentMusicUrl: ''  // 当前播放的音乐 URL
  },

  onShow() {
    // 页面显示时根据全局夜间模式状态切换主题
    thememusic.applyTheme(this);
  },
  // 点击图片事件处理：播放对应的音乐
  onImageTap(e) {
    const index = e.currentTarget.dataset.index; // 获取点击图片的索引
    const type = e.currentTarget.dataset.type;   // 获取点击图片的类型（最近播放或推荐歌单）
    const selectedMusicUrl = type === 'recent' 
      ? this.data.recentPlayList[index].musicUrl 
      : this.data.recommendedPlayList[index].musicUrl;

    // 如果当前有音频对象并且正在播放，则停止当前音频
    if (this.data.currentAudio) {
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

  // 播放/暂停控制
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
      this.data.currentAudio.stop();
    }
  }
});