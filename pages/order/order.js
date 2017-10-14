// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: { notice: '欢迎在本超市选购商品', shopStatus: 1 },
    orderList: [{ img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 1, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 0, price: 56.8 }]
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
  viewCpommodity() {
    wx.redirectTo({
      url: '../index/index'
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