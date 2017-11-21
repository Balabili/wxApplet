import { api } from '../../utils/util.js';

const { imageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    imageUserBaseUrl: {
      wait: imageUserBaseUrl + 'c_wait_pay.png',
      already: imageUserBaseUrl + 'c_aleady_pay.png',
      allPay: imageUserBaseUrl + 'c_all_pay.png',
      detail: imageUserBaseUrl + 'c_home_arrow_small.png',
    },
    name: '',
    headUrl: '',
    count: 0,
    address: ''
  },

  onLoad(options) {
    let self = this, userInfo = wx.getStorageSync('lsb_user');
    api.request('/buyer/account/getMyInfo', { userId: userInfo.openid }).then((result) => {
      self.setData({
        name: result.name,
        headUrl: result.headUrl,
        count: result.count
      });
    }).catch((e) => { console.log(e); });
  },
  
  viewOrders({ currentTarget }) {
    let index = currentTarget.dataset.index;
    wx.setStorageSync('orderPageIndex', index);
    wx.switchTab({
      url: '/pages/order/order',
    });
  },

  selectAddress() {
    let userInfo = wx.getStorageSync('lsb_user');
    if (userInfo) {
      wx.navigateTo({
        url: '../selectAddress/selectAddress?from=info',
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '您点击了拒绝授权，无法添加地址。请删除小程序重新进入。',
      });
    }
  },

  onShow() {
    let address = wx.getStorageSync('addressStorage');
    this.setData({
      address: address.address
    });
  }
})