function applyTheme(pageInstance) {
  const app = getApp();
  const isDarkMode = app.globalData.isDarkMode;

  if (isDarkMode) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000015'
    });
    pageInstance.setData({
      pageBackgroundColor: '#000015',
      textColor: '#ffffff'
    });
  } else {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    });
    pageInstance.setData({
      pageBackgroundColor: '#dcdee0',
      textColor: '#000000'
    });
  }
}

module.exports = {
  applyTheme
};