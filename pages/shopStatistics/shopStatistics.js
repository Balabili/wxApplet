import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopImageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      netWeek: imageUserBaseUrl + 'c_natural_week.png',
      detail: imageUserBaseUrl + 'c_home_arrow_small.png',
      noCommodity: shopImageUserBaseUrl + 'b_data_none.png',
      down: shopImageUserBaseUrl + 'b_data_down.png',
      up: shopImageUserBaseUrl + 'b_data_up.png',
    },
    compareImage: '',
    summary: {},
    showList: true,
    currentList: [],
    highVisitedList: [],
    hotSellList: [],
    growth: '0.00'
  },

  onLoad(options) {
    let self = this, imageContainer = self.data.imageContainer, date = new Date(), year = date.getFullYear(), month = date.getMonth() + 1, summary = self.data.summary, userInfo = wx.getStorageSync('lsb_user');
    month = month < 10 ? '0' + month : month;
    summary.month = `${year}-${month}`;
    this.setData({
      summary: summary
    });
    api.request('/seller/count/getShopCount', { userId: userInfo.openid }).then(({ count, growth, list, list2 }) => {
      self.setData({
        summary: count,
        growth: Math.abs(growth),
        compareImage: growth >= 0 ? imageContainer.up : imageContainer.down,
        hotSellList: list || [],
        highVisitedList: list2 || [],
        currentList: list || []
      });
    });
  },

  bindDateChange({ detail }) {
    let summary = this.data.summary;
    summary.month = detail.value;
    this.setData({
      summary: summary
    });
  },

  changeTab({ currentTarget }) {
    let index = +currentTarget.dataset.index, data = this.data;
    this.setData({
      tabIndex: index,
      currentList: index ? data.highVisitedList : data.hotSellList
    });
  }
})