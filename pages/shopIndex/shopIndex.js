import { api, formatDate } from '../../utils/util.js';

const { shopImageUserBaseUrl, shopInfo } = getApp().globalData;

Page({
  data: {
    imageContainer: {
      fox: shopImageUserBaseUrl + 'fox_button.png',
      bubble: shopImageUserBaseUrl + 'maopao.png'
    },
    shopInfo: {},
    sale: '0.00',
    orderCount: 0,
    shopFunctions: [{ id: 1, image: shopImageUserBaseUrl + 'b_1_store_setting.png', name: '商店设置' }, { id: 2, image: shopImageUserBaseUrl + 'b_2_release.png', name: '发布商品' }, { id: 3, image: shopImageUserBaseUrl + 'b_3_commodity.png', name: '商品管理' }, { id: 4, image: shopImageUserBaseUrl + 'b_4_orders.png', name: '我的订单' }, { id: 5, image: shopImageUserBaseUrl + 'b_5_data.png', name: '数据统计' }, { id: 999, image: shopImageUserBaseUrl + 'b_6_except.png', name: '敬请期待' }],
    validFormIdCount: 0,
    storageFormIdList: []
  },

  //事件处理函数
  viewDetails({ currentTarget }) {
    let id = currentTarget.dataset.id, url = '';
    switch (id) {
      case 1:
        url = '../shopSetting/shopSetting';
        break;
      case 2:
        url = '../shopPublishCommodity/shopPublishCommodity';
        break;
      case 3:
        url = '../shopManageCommodity/shopManageCommodity';
        break;
      case 4:
        url = '../shopOrders/shopOrders';
        break;
      case 5:
        url = '../shopStatistics/shopStatistics';
        break;
      default: break;
    };
    if (!url) {
      return;
    }
    wx.navigateTo({
      url: url
    });
  },

  onShow() {
    let self = this, userInfo = wx.getStorageSync('lsb_user'), storageFormIdList = wx.getStorageSync('formIdList') || [];
    self.setData({
      storageFormIdList: storageFormIdList
    });
    api.request('/seller/shop/getShopSet', { userId: userInfo.openid }).then(({ data, total, count, formCount, newOrderCount }) => {
      let shopFunctions = self.data.shopFunctions;
      shopFunctions[3].newOrderCount = newOrderCount;
      self.setData({
        shopInfo: data,
        orderCount: count,
        sale: total.toString(),
        validFormIdCount: formCount,
        shopFunctions: shopFunctions
      });
    }).catch((e) => { console.log(e); });
  },

  addFormIdCount({ detail }) {
    let self = this, data = self.data, validFormIdCount = data.validFormIdCount, storageFormIdList = data.storageFormIdList, fromId = detail.formId, currentDate = wx.getStorageSync('currentDate');
    //是否缓存有上次点击button的时间。如果有，比较缓存时间，时间相同，加一，不同，改时间，count变为1；如果没有，添加一个新的，count变为1
    if (currentDate) {
      let today = formatDate(new Date());
      if (today === currentDate.date) {
        if (currentDate.count >= 100) {
          api.modal('每天最多点击一百次哦~');
          return;
        } else {
          let count = currentDate.count;
          currentDate.count = count ? count + 1 : 1;
          wx.setStorageSync('currentDate', currentDate);
        }
      } else {
        wx.setStorageSync('currentDate', { date: today, count: 1 });
      }
    } else {
      wx.setStorageSync('currentDate', { date: formatDate(new Date()), count: 1 });
    }
    // data.currentDate ? data.currentDate : wx.getStorageSync(key),
    storageFormIdList.push(fromId);
    if (storageFormIdList.length >= 25) {
      api.request('/seller/shop/insertFormid', { formIds: storageFormIdList, shopId: shopInfo }).catch((e) => {
        console.log(e);
      });
      self.setData({
        validFormIdCount: validFormIdCount + storageFormIdList.length,
        storageFormIdList: []
      });
      wx.removeStorageSync('formIdList');
    } else {
      wx.setStorageSync('formIdList', storageFormIdList);
      self.setData({
        storageFormIdList: storageFormIdList
      });
    }
  }
})
