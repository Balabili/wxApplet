import { api } from '../../utils/util.js';

Page({

  data: {
    commodityNumber: ''
  },

  changeCommodityNumber({ detail }) {
    this.setData({
      commodityNumber: detail.value
    });
  },

  saveCommodityNumber() {
    let commodityNumber = +this.data.commodityNumber, commodityStorageData = wx.getStorageSync('commodityKey') || {};
    if (commodityNumber) {
      commodityStorageData.code = commodityNumber;
      wx.setStorageSync('commodityKey', commodityStorageData);
      wx.navigateBack({
        delta: 1
      });
    } else {
      api.modal('只能输入数字', false, '', '知道啦');
    }
  },

  onLoad(options) {
    if (options.code) {
      this.setData({
        commodityNumber: options.code
      });
    }
  }
})