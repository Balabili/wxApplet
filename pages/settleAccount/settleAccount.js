// pages/settleAcount/settleAccount.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    remark: '',
    price: 999.9,
    orderItemList: [{ image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }, { image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }, { image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }, { image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }, { image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }, { image: '../../images/四月是你的谎言.jpg', name: '你大爷', count: 1, weightage: '12盒/箱', price: 66.6 }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let remark = wx.getStorageSync('remark');
    console.log(remark);
    this.setData({
      remark: remark
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  addAddress() {
    wx.navigateTo({
      url: '../selectAddress/selectAddress'
    });
  },
  addRemark() {
    wx.navigateTo({
      url: '../addRemark/addRemark'
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