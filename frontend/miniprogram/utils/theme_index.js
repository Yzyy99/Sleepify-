function applyTheme(pageInstance) {
  const app = getApp();
  const isDarkMode = app.globalData.isDarkMode;

  if (isDarkMode) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000'
    });
    pageInstance.setData({
      pageBackgroundColor: '#000000',
      textColor: '#ffffff'
    });
  } else {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    });
    pageInstance.setData({
      pageBackgroundColor: '#90aabbf8',
      textColor: '#000000'
    });
  }
}

module.exports = {
  applyTheme
};