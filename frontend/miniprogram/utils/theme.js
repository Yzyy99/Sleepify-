function applyTheme(pageInstance) {
  const app = getApp(); // 获取全局变量
  const isDarkMode = app.globalData.isDarkMode; // 判断是否为夜间模式

  if (isDarkMode) {
    // 设置夜间模式的导航栏颜色和页面样式
    console.log('夜间模式');
    wx.setNavigationBarColor({
      frontColor: '#ffffff', // 导航栏文字白色
      backgroundColor: '#1E1E2F' // 导航栏背景深蓝灰
    });
    wx.setTabBarStyle({
      backgroundColor: '#1E1E2F', // 导航栏背景深蓝灰
      color: '#AAAAAA', // 导航栏文字白色
      selectedColor: '#F4F4F9', // 导航栏文字白色
      borderStyle: 'white', // 导航栏底线白色
    });
    wx.setTabBarItem({
      index: 0,
      iconPath: 'assets/nightbar/home-3-line.png',
      selectedIconPath: 'assets/nightbar/home-3-fill.png',
    })
    wx.setTabBarItem({
      index: 1,
      iconPath: 'assets/nightbar/discuss-line.png',
      selectedIconPath: 'assets/nightbar/discuss-fill.png',
    })
    wx.setTabBarItem({
      index: 2,
      iconPath: 'assets/nightbar/file-add-line.png',
      selectedIconPath: 'assets/nightbar/file-add-fill.png',
    })
    wx.setTabBarItem({
      index: 3,
      iconPath: 'assets/nightbar/file-chart-line.png',
      selectedIconPath: 'assets/nightbar/file-chart-fill.png',
    })
    wx.setTabBarItem({
      index: 4,
      iconPath: 'assets/nightbar/account-box-line.png',
      selectedIconPath: 'assets/nightbar/account-box-fill.png',
    })
    pageInstance.setData({
      pageBackgroundColor: '#1E1E2F', // 页面背景深蓝灰
      textColor: '#F4F4F9', // 页面文字白色
      buttonBackgroundColor: '#28293E', // 按钮背景深蓝灰
      buttonTextColor: '#FFFFFF', // 按钮文字白色
      highlightColor: '#D35450', // 高亮色深橙红
      shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影深色
      playerBarBackgroundColor: '#28293E', // 播放器背景深蓝灰
      playerBarTextColor: '#F4F4F9', // 播放器文字白色
      exegesisColor:'#B0B0B0'
    });
  } else {
    // 设置浅色模式的导航栏颜色和页面样式
    wx.setNavigationBarColor({
      frontColor: '#000000', // 导航栏文字黑色
      backgroundColor: '#f5f5dc' // 导航栏背景浅米色
    });
    wx.setTabBarStyle({
      backgroundColor: '#f5f5dc',
      color: '#a9b7b7',
      selectedColor: '#222222',
      borderStyle: 'white',
    });
    wx.setTabBarItem({
      index: 0,
      iconPath: 'assets/home-3-line.png',
      selectedIconPath: 'assets/home-3-fill.png',
    })
    wx.setTabBarItem({
      index: 1,
      iconPath: 'assets/discuss-line.png',
      selectedIconPath: 'assets/discuss-fill.png',
    })
    wx.setTabBarItem({
      index: 2,
      iconPath: 'assets/file-add-line.png',
      selectedIconPath: 'assets/file-add-fill.png',
    })
    wx.setTabBarItem({
      index: 3,
      iconPath: 'assets/file-chart-line.png',
      selectedIconPath: 'assets/file-chart-fill.png',
    })
    wx.setTabBarItem({
      index: 4,
      iconPath: 'assets/account-box-line.png',
      selectedIconPath: 'assets/account-box-fill.png',
    })
    pageInstance.setData({
      pageBackgroundColor: '#f5f5dc', // 页面背景浅米色
      textColor: '#333', // 页面文字深灰色
      buttonBackgroundColor: '#dce4c9', // 按钮背景绿色
      buttonTextColor: '#432e54', // 按钮文字深紫色
      highlightColor: '#e07b39', // 高亮色温暖橙
      shadowColor: 'rgba(0, 0, 0, 0.2)' ,// 阴影浅色
      playerBarBackgroundColor: '#FFFFFF', // 播放器背景白色
      playerBarTextColor: '#333', // 播放器文字深灰色
      exegesisColor:'#7D7D7D'
    });
  }
}

module.exports = {
  applyTheme
};
