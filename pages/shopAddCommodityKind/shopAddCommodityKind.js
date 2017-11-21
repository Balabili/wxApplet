import { touchMove, api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({
  data: {
    imageContainer: {
      add: imageUserBaseUrl + 'c_add_address_white.png'
    },
    kindList: [],
    startX: 0,
    startY: 0,
  },

  selectKind({ currentTarget, target }) {
    let id = currentTarget.dataset.id, status = target.dataset.name, self = this, kindList = self.data.kindList, len = kindList.length, commodityStorageData = wx.getStorageSync('commodityKey') || {};
    if (status === 'delete') {
      api.request('/seller/commodityPost/deleteType', { shopId: shopInfo, typeId: id }).then(({ result }) => {
        for (let i = 0; i < len; i++) {
          if (kindList[i].id === id) {
            kindList.splice(i, 1);
            break;
          }
        }
        self.setData({
          kindList: kindList
        });
      }).catch((e) => {
        for (let i = 0; i < len; i++) {
          kindList[i].isTouchMove = false;
        }
        self.setData({
          kindList: kindList
        });
        return api.modal('请先删除分类下的商品', false, '', '知道啦');
      });
    } else {
      for (let i = 0; i < len; i++) {
        if (kindList[i].id === id) {
          commodityStorageData.kind = kindList[i];
          break;
        }
      }
      wx.setStorageSync('commodityKey', commodityStorageData);
      wx.navigateBack({
        delta: 1
      });
    }
  },

  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    });
  },
  touchmove({ currentTarget, changedTouches }) {
    let self = this,
      start = { X: self.data.startX, Y: self.data.startY },
      end = { X: changedTouches[0].clientX, Y: changedTouches[0].clientY },
      position = touchMove(start, end),
      kindId = currentTarget.dataset.id,
      kindList = self.data.kindList,
      len = kindList.length;
    for (let i = 0; i < len; i++) {
      if (position === 'left') {
        kindList[i].isTouchMove = kindList[i].id === kindId;
      } else {
        kindList[i].isTouchMove = false;
      }
    }
    this.setData({
      kindList: kindList
    });
  },

  addNewCommodityKind() {
    wx.navigateTo({
      url: '../shopAddNewCommodityKind/shopAddNewCommodityKind'
    });
  },

  onShow() {
    let self = this;
    api.request('/seller/commodityPost/getType', { shopId: shopInfo }).then(({ data }) => {
      self.setData({
        kindList: data
      });
    }).catch((e) => { console.log(e); });
  }
})