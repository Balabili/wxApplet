import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({

  data: {
    kindName: ''
  },

  onLoad() {
    wx.setStorageSync('currentPageText', '');
  },

  changeText({ detail }) {
    wx.setStorageSync('currentPageText', detail.value.substring(0, 10));
  },

  setText() {
    this.setData({
      kindName: wx.getStorageSync('currentPageText')
    });
  },

  saveKindName() {
    let name = wx.getStorageSync('currentPageText');
    api.request('/seller/commodityPost/insertType', { name: name, shopId: shopInfo }).then(() => {
      wx.navigateBack({
        delta: 1
      });
    }).catch((e) => { console.log(e); });
  }

})