// pages/pick/pick.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commodityKinds: [],
    commodityList: [],
    test: true,
    shop: { notice: '欢迎在本超市选购商品', shopStatus: 1 },
    orderList: [{ img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 1, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 0, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 1, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 0, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 1, price: 56.8 }, { img: '../../images/四月是你的谎言.jpg', name: '你大爷你二爷你三爷', time: '2017-9-27 16:32', status: 0, price: 56.8 }],
    hiddenModal: true,
    //21点以后不进行配送，请到店自取
    modalTitle: '已经打烊了~',
    pageX: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      commodityKinds: [{ name: '香烟', selected: true }, { name: '牛奶乳制品', selected: false }, { name: '啤酒', selected: false }, { name: '白酒', selected: false }, { name: '膨化食品', selected: false }, { name: '饼干', selected: false }, { name: '饮料', selected: false }, { name: '速食', selected: false }, { name: '粮油', selected: false }, { name: '调味', selected: false }, { name: '肉类', selected: false }],
      commodityList: [{ img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0, sellOut: true }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 1 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 1 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 0 }, { img: '../../images/四月是你的谎言.jpg', id: '11', name: '方便面', weightage: '10袋/包', price: 46.5, count: 1 }]
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  changeTab({ target }) {
    let kindName = target.dataset.name, kinds = this.data.commodityKinds, len = kinds.length;
    for (let i = 0; i < len; i++) {
      kinds[i].selected = kindName === kinds[i].name;
    }
    this.setData({
      commodityKinds: kinds
    });
  },
  viewShopDetails() {
    wx.navigateTo({
      url: '../businessDetails/businessDetails'
    });
    // wx.navigateTo({
    //   url: '../logs/logs'
    // });
  },
  viewOrders() {
    this.setData({
      test: false
    });
  },
  viewCommodity() {
    this.setData({
      test: true
    });
  },
  aaaa(e) {
    this.setData({
      pageX: e.touches[0].pageX
    });
  },
  xxxx(e) {
    if (e.touches[0].pageX - this.data.pageX > 100) {
      this.setData({
        test: true
      });
    } else if (e.touches[0].pageX - this.data.pageX < -100) {
      this.setData({
        test: false
      });
    }
  },
  settleAccounts() {
    wx.navigateTo({
      url: '../settleAccount/settleAccount'
    });
    // wx.makePhoneCall({
    //   phoneNumber: '17600124031',
    //   success() {
    //     console.log('success');
    //   }, fail(e) {
    //     console.log(arguments);
    //   }
    // });
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