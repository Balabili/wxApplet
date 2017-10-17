// pages/addAddress/addAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName: '',
    gender: '',
    phone: '',
    address: '',
    houseNumber: '',
    hiddenModal: true,
    modalTitle: ''
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
  inputName({ detail }) {
    this.setData({
      userName: detail.value
    });
  },
  genderChange({ detail }) {
    this.setData({
      gender: detail.value
    });
  },
  inputPhone({ detail }) {
    this.setData({
      phone: detail.value
    });
  },
  chooseLocation() {
    let self = this;
    wx.chooseLocation({
      success(res) {
        self.setData({
          address: res.address ? res.address : ''
        });
      }
    });
  },
  inputHouseNumber({ detail }) {
    this.setData({
      houseNumber: detail.value
    });
  },
  saveAddress() {
    let data = this.data;
    if (data.userName === '') {
      this.setData({
        hiddenModal: false,
        modalTitle: '请输入您的姓名'
      });
      return;
    }
    if (data.phone === '' || !/^1[34578]\d{9}$/.test(data.phone)) {
      this.setData({
        hiddenModal: false,
        modalTitle: '请输入正确手机号',
        phone: ''
      });
      return;
    }
    if (data.address === '') {
      this.setData({
        hiddenModal: false,
        modalTitle: '请选择小区/大厦/学校'
      });
      return;
    }
    debugger;
  },
  hideModal() {
    this.setData({
      hiddenModal: true
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