import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopImageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    imageUserBaseUrl: {
      wait: imageUserBaseUrl + 'c_wait_time.png',
      call: imageUserBaseUrl + 'c_calling.png',
      complete: shopImageUserBaseUrl + 'b_already_complete.png'
    },
    orderId: '',
    orderDetails: {},
    paymentStatus: true,
    total: 0
  },

  onLoad(options) {
    let self = this, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/order/orderDetail', { userId: userInfo.openid, orderId: options.id }).then(({ data }) => {
      let list = data.detailList, len = list.length, total = 0;
      for (let i = 0; i < len; i++) {
        total = +list[i].price + total;
      }
      self.setData({
        orderDetails: data,
        paymentStatus: data.status === '2',
        total: total,
        orderId: options.id
      });
    }).catch((e) => { console.log(e); });
  },

  completeOrder() {
    let self = this, data = self.data, userInfo = wx.getStorageSync('lsb_user');
    api.modal('商品已送达买家？', true, '还没', '已送到').then((result) => {
      if (result) {
        return api.request('/seller/order/finishOrder', { userId: userInfo.openid, orderId: data.orderId });
      }
    }).then(({ result }) => {
      if (result === '0') {
        self.setData({
          paymentStatus: false
        });
      }
    }).catch((e) => { console.log(e); });
  },

  cantactCustom() {
    let self = this, orderDetails = self.data.orderDetails;
    wx.makePhoneCall({
      phoneNumber: orderDetails.phone
    });
  }
})