// pages/addRemark/addRemark.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    remark: '',
    length: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let remark = wx.getStorageSync('remark');
    this.setData({
      remark: remark,
      length: remark.length
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  addRemark({ detail }) {
    let remark = detail.value, length = remark.length
    this.setData({
      remark: remark,
      length: length
    });
  },
  saveAddress() {
    let data = this.data.remark;
    wx.setStorageSync('remark', data);
    let aaa = wx.getStorageSync('remark');
    console.log(aaa);
    wx.navigateTo({
      url: '../settleAccount/settleAccount',
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