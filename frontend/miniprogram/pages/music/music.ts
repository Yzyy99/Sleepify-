const thememusic = require('../../utils/theme.js');
Page({
  data: {
    recentPlayList: [
      { src: '/assets/music1.png', musicName: '2.mp3', title: "Closer" },
      { src: '/assets/music2.png', musicName: '1.mp3', title: "I Got Smoke" },
      { src: '/assets/music3.png', musicName: '3.mp3', title: "Something" }
    ],
    recommendedPlayList: [
      { src: '/assets/music4.png', musicName: 'classical2.mp3', title: "静谧古典" },
      { src: '/assets/music5.png', musicName: 'anime1.mp3', title: "动漫奇旅" },
      { src: '/assets/music6.png', musicName: 'light1.mp3', title: "轻音梦想" },
      { src: '/assets/music7.png', musicName: 'vocal1.mp3', title: "人声低语" }
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
    // 检查当前是否有音乐在播放
    const backgroundAudioManager = wx.getBackgroundAudioManager();

    if (backgroundAudioManager.src) {
      // 如果有音乐在播放，更新状态
      this.setData({
        isPlaying: !backgroundAudioManager.paused, // 播放状态
        isPaused: backgroundAudioManager.paused,  // 暂停状态
        currentStatus: backgroundAudioManager.paused ? '已暂停' : '播放中',
        currentMusicUrl: backgroundAudioManager.src // 当前播放的音乐 URL
      });

      // 绑定事件监听器（如暂停、播放、结束）
      this.bindBackgroundAudioEvents(backgroundAudioManager);
    }
  },
  // 点击图片事件处理：播放对应的音乐
  onImageTap(e:any) {
    const index = e.currentTarget.dataset.index; // 获取点击图片的索引
    const type = e.currentTarget.dataset.type;   // 获取点击图片的类型（最近播放或推荐歌单）
    const selectedMusicName = type === 'recent' 
      ? this.data.recentPlayList[index].musicName 
      : this.data.recommendedPlayList[index].musicName;
  
    // 如果当前有音频对象并且正在播放，则停止当前音频
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }

    // 更新状态为“加载中”
    this.setData({
      currentStatus: '加载中',
      isPlaying: false,
      isPaused: false
    });
  
    // 调用后端接口获取音乐文件流
    wx.request({
      url: `https://sleepify.top:8000/api/music/`, // 后端接口地址
      method: 'GET',
      data: { name: selectedMusicName }, // 传递音乐文件名
      responseType: 'arraybuffer', // 请求响应类型为文件流
      header: {
        Authorization: "Bearer " + wx.getStorageSync("access_token"), // 将 Token 添加到请求头中
      },
      success: (res:any) => {
        if (res.statusCode === 200) {
          // 将音乐文件流转换为本地临时文件
          const fileManager = wx.getFileSystemManager(); // 微信文件系统管理器
          const filePath = `${wx.env.USER_DATA_PATH}/${selectedMusicName}`; // 临时文件路径
          fileManager.writeFile({
            filePath,
            data: res.data,
            encoding: 'binary',
            success: () => {
              // 创建新的音频上下文对象
              const audio = wx.createInnerAudioContext();
              audio.src = filePath;
  
              // 播放音乐
              audio.play();
  
              // 更新状态
              this.setData({
                isPlaying: true,
                isPaused: false,
                currentStatus: '播放中',
                currentAudio: audio,
                currentMusicUrl: filePath
              });
  
              wx.showToast({
                title: '开始播放音乐',
                icon: 'none',
                duration: 2000
              });
            },
            fail: (err) => {
              console.error('写入临时文件失败', err);
              wx.showToast({
                title: '音乐播放失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          console.error('获取音乐文件失败', res);
          wx.showToast({
            title: '音乐获取失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: 2000
        });
      }
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