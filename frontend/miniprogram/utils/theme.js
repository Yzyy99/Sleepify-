function applyTheme(pageInstance) {
  const app = getApp(); // 获取全局变量
  const isDarkMode = app.globalData.isDarkMode; // 判断是否为夜间模式

  if (isDarkMode) {
    // 设置夜间模式的导航栏颜色和页面样式
    wx.setNavigationBarColor({
      frontColor: '#ffffff', // 导航栏文字白色
      backgroundColor: '#1E1E2F' // 导航栏背景深蓝灰
    });
    wx.setTabBarStyle({
      backgroundColor: '#1E1E2F' // 导航栏背景深蓝灰
    });
    pageInstance.setData({
      pageBackgroundColor: '#1E1E2F', // 页面背景深蓝灰
      textColor: '#F4F4F9', // 页面文字白色
      buttonBackgroundColor: '#28293E', // 按钮背景深蓝灰
      buttonTextColor: '#FFFFFF', // 按钮文字白色
      highlightColor: '#D35450', // 高亮色深橙红
      shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影深色
      playerBarBackgroundColor: '#28293E', // 播放器背景深蓝灰
      playerBarTextColor: '#F4F4F9' // 播放器文字白色
    });
  } else {
    // 设置浅色模式的导航栏颜色和页面样式
    wx.setNavigationBarColor({
      frontColor: '#000000', // 导航栏文字黑色
      backgroundColor: '#f5f5dc' // 导航栏背景浅米色
    });
    wx.setTabBarStyle({
      backgroundColor:'#f5f5dc'
    })
    pageInstance.setData({
      pageBackgroundColor: '#f5f5dc', // 页面背景浅米色
      textColor: '#333', // 页面文字深灰色
      buttonBackgroundColor: '#dce4c9', // 按钮背景绿色
      buttonTextColor: '#432e54', // 按钮文字深紫色
      highlightColor: '#e07b39', // 高亮色温暖橙
      shadowColor: 'rgba(0, 0, 0, 0.2)' ,// 阴影浅色
      playerBarBackgroundColor: '#FFFFFF', // 播放器背景白色
      playerBarTextColor: '#333' // 播放器文字深灰色
    });
  }
}

module.exports = {
  applyTheme
};
