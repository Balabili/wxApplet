// pages/selectAddress/selectAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeAddressList: [{ name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: true }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }],
    deactiveAddressList: [{ name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  
  addNewAddress() {
    wx.navigateTo({
      url: '../addAddress/addAddress',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})