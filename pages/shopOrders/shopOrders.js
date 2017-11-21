import { api } from '../../utils/util.js';

const { shopImageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    completeImg: shopImageUserBaseUrl + 'b_already_complete.png',
    tabIndex: 0,
    orderList: [],
    waitingCount: 0,
    completeCount: 0
  },

  onShow() {
    let self = this, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/order/getOrderByState', { userId: userInfo.openid, state: '2' }).then(({ count2, data, count3 }) => {
      self.setData({
        orderList: data,
        waitingCount: count2,
        completeCount: count3
      });
    }).catch((e) => { console.log(e); });
  },

  changeTab({ currentTarget }) {
    let self = this, userInfo = wx.getStorageSync('lsb_user'), index = +currentTarget.dataset.index, state = index ? '3' : '2';
    api.request('/seller/order/getOrderByState', { userId: userInfo.openid, state: state }).then(({ count2, data, count3 }) => {
      self.setData({
        orderList: data,
        tabIndex: index,
        waitingCount: count2,
        completeCount: count3
      });
    }).catch((e) => { console.log(e); });
  },
  
  viewOrderDetails({ currentTarget }) {
    let orderId = currentTarget.dataset.id;
    wx.navigateTo({
      url: `../shopOrderDetails/shopOrderDetails?id=${orderId}`
    })
  }

})