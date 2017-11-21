import { api } from '../../utils/util.js';

Page({

  data: {
    description: ''
  },

  onLoad(options) {
    let description = options.description;
    if (description) {
      this.setData({
        description: description
      });
    }
    wx.setStorageSync('currentPageText', description || '');
  },

  changeDescription({ detail }) {
    wx.setStorageSync('currentPageText', detail.value);
  },

  setDescription() {
    this.setData({
      description: wx.getStorageSync('currentPageText')
    });
  },

  saveDescription() {
    let description = wx.getStorageSync('currentPageText'), commodityStorageData = wx.getStorageSync('commodityKey') || {};
    if (description) {
      commodityStorageData.description = description;
      wx.setStorageSync('commodityKey', commodityStorageData);
      wx.navigateBack({
        delta: 1
      });
    } else {
      api.modal('请输入商品描述', false, '', '知道啦');
    }
  }
})