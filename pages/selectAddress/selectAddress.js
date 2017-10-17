import { touchMove } from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeAddressList: [{ name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: true, isTouchMove: false }, { name: '李先生1', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false, isTouchMove: false }, { name: '李先生2', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false, isTouchMove: false }],
    deactiveAddressList: [{ name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }, { name: '李先生', phone: 18888888888, address: '你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷你大爷', isSelected: false }],
    startX: 0,
    startY: 0
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
  changeAddress({ currentTarget }) {
    let addressId = currentTarget.dataset.id, activeAddressList = this.data.activeAddressList, len = activeAddressList.length;
    for (let i = 0; i < len; i++) {
      activeAddressList[i].isSelected = activeAddressList[i].name === addressId;
    }
    this.setData({
      activeAddressList: activeAddressList
    });
  },
  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    });
  },
  touchmove({ currentTarget, changedTouches }) {
    let self = this,
      start = { X: self.data.startX, Y: self.data.startY },
      end = { X: changedTouches[0].clientX, Y: changedTouches[0].clientY },
      position = touchMove(start, end),
      addressId = currentTarget.dataset.id,
      activeAddressList = self.data.activeAddressList,
      len = activeAddressList.length;
    for (let i = 0; i < len; i++) {
      if (position === 'left') {
        activeAddressList[i].isTouchMove = activeAddressList[i].name === addressId;
      }else {
        activeAddressList[i].isTouchMove = false;
      }
    }
    this.setData({
      activeAddressList: activeAddressList
    });
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