import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopImageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      emptyResult: imageUserBaseUrl + 'c_seach_none.png',
      empty: imageUserBaseUrl + 'button_qingkong.png',
      soldOut: shopImageUserBaseUrl + 'b_sold_out.png'
    },
    inputValue: '',
    historyRecord: [],
    showNoSearchResult: false,
    showSpecialPrice: false,
    searchList: [],
    textboxFocus: true
  },

  emptyHistory() {
    wx.setStorageSync('history', []);
    this.setData({
      historyRecord: []
    });
  },

  onLoad(options) {
    let history = wx.getStorageSync('history') || [];
    this.setData({
      historyRecord: history.reverse()
    });
  },

  setInputBoxValue({ detail }) {
    var value = detail.value;
    this.setData({
      inputValue: value
    });
  },

  searchHisotory({ currentTarget }) {
    this.setData({
      inputValue: currentTarget.dataset.name,
      textboxFocus: false
    });
    this.searchGoods();
  },

  searchGoods() {
    var self = this, searchValue = self.data.inputValue, userInfo = wx.getStorageSync('lsb_user');
    if (searchValue === '') {
      self.setData({
        searchList: [],
        showNoSearchResult: false
      });
      return;
    }
    api.request('/seller/commodity/searchCommodity', { userId: userInfo.openid, keyWord: searchValue }).then(({ data }) => {
      self.operateHistory(searchValue, data);
      self.operateShopStorage(data);
    }).catch((e) => { console.log(e); });
  },

  clearSearchResult() {
    this.setData({
      searchList: [],
      showNoSearchResult: false,
      inputValue: '',
      textboxFocus: true
    });
  },

  operateHistory(searchValue, data) {
    //使用Set做书粗去重  转为数组存到缓存中
    let self = this, history = wx.getStorageSync('history');
    history = history ? new Set(history) : new Set();
    if (history.has(searchValue)) {
      history.delete(searchValue);
    }
    if (history.size >= 8) {
      history = new Set([...history].splice(0, 7));
    }
    history.add(searchValue);
    wx.setStorageSync('history', [...history]);
    if (data.length) {
      self.setData({
        searchList: data,
        historyRecord: [...history].reverse()
      });
    } else {
      self.setData({
        searchList: [],
        showNoSearchResult: true,
        historyRecord: [...history].reverse(),
        showHistory: false
      });
    }
  },

  operateCommodity({ target, currentTarget }) {
    // 1 新品 2 特价 3 热销 4 售罄 5 编辑
    let status = +target.dataset.status, commodityId = currentTarget.dataset.id;
    if (status) {
      switch (status) {
        case 1:
          this.changeCommodityStatus(commodityId, 'isNew');
          break;
        case 2:
          this.changeCommodityStatus(commodityId, 'isBargain');
          break;
        case 3:
          this.changeCommodityStatus(commodityId, 'isHot');
          break;
        case 4:
          this.changeCommodityStatus(commodityId);
          break;
        case 5:
          wx.navigateTo({
            url: '../shopPublishCommodity/shopPublishCommodity?commodityId=' + commodityId,
          });
          break;
        case 6:
          this.deleteCommodity(commodityId);
          break;
        default: break;
      }
    }
  },

  deleteCommodity(commodityId) {
    let self = this, data = self.data, searchList = data.searchList, len = searchList.length;
    api.modal('商品删除不可恢复，确认删除？').then((confirm) => {
      if (confirm) {
        return api.request('/seller/commodityPost/deleteCommodity', { commodityId: commodityId });
      } else {
        return false;
      }
    }).then((result) => {
      if (!result) {
        return;
      }
      api.successModal('删除成功');
      for (let i = 0; i < len; i++) {
        if (searchList[i].id === commodityId) {
          searchList.splice(i, 1);
          break;
        }
      }
      if (searchList.length === 0) {
        self.setData({
          textboxFocus: true
        });
      }
      self.setData({
        searchList: searchList
      });
    }).catch((e) => { console.log(e); });
  },

  changeCommodityStatus(commodityId, field) {
    let self = this, data = self.data, searchList = data.searchList, len = searchList.length;
    for (let i = 0; i < len; i++) {
      if (searchList[i].id === commodityId) {
        let title = '', commodityType = 0;
        switch (field) {
          case 'isNew':
            title = searchList[i].isNew === '1' ? '确定取消新品上架吗？' : '确定设置为新品吗？';
            commodityType = searchList[i].isNew === '1' ? '5' : '4';
            break;
          case 'isBargain':
            title = searchList[i].isBargain === '1' ? '确定恢复商品原价吗？' : '确定设置为特价吗？';
            commodityType = searchList[i].isBargain === '1' ? '7' : '6';
            break;
          case 'isHot':
            title = searchList[i].isHot === '1' ? '确定取消热销上架吗？' : '确定设置为热销吗？';
            commodityType = searchList[i].isHot === '1' ? '1' : '0';
            break;
          default:
            title = searchList[i].sellOut === '1' ? '确定有货吗？' : '确定设置为售罄吗？';
            commodityType = searchList[i].sellOut === '1' ? '3' : '2';
            break;
        }
        if (commodityType === '6') {
          //设为特价
          self.setData({
            showSpecialPrice: true,
            commodityId: commodityId
          });
        } else {
          api.modal(title).then((confirm) => {
            if (confirm) {
              return api.request('/seller/commodity/updateCommodity', { commodityId: commodityId, type: commodityType });
            } else {
              return false;
            }
          }).then(({ result }) => {
            if (result === "0") {
              if (field) {
                searchList[i][field] = searchList[i][field] === '0' ? '1' : '0';
              } else {
                searchList[i].sellOut = searchList[i].sellOut === '0' ? '1' : '0';
              }
              self.setData({
                searchList: searchList
              });
            }
          }).catch((e) => { console.log(e); });
        }
        break;
      }
    }
  },

  changePrice({ detail }) {
    let barginPrice = detail.value.replace(/[^\d\.]/g, '');
    this.setData({
      barginPrice: barginPrice
    });
  },

  cancelBargin() {
    this.setData({
      showSpecialPrice: false
    });
  },

  setBargin() {
    let self = this, data = self.data, oldPrice = 0, price = data.barginPrice, commodityId = data.commodityId, searchList = data.searchList, len = searchList.length;
    if (!+price) {
      api.modal('输入不合法，请重新输入', false, '', '知道啦');
      self.setData({
        barginPrice: ''
      });
      return;
    }
    for (let i = 0; i < len; i++) {
      if (searchList[i].id === commodityId) {
        oldPrice = searchList[i].price;
        break;
      }
    }
    if (price === '') {
      return;
    } else if (price - oldPrice >= 0) {
      api.modal('特价不能高于原价，请重新设置', false, '', '知道啦').catch((e) => { console.log(e); });
    } else {
      api.request('/seller/commodity/updateCommodity', { commodityId: commodityId, type: '6', bargainPrice: price }).then(() => {
        for (let i = 0; i < len; i++) {
          if (searchList[i].id === commodityId) {
            searchList[i].isBargain = '1';
            searchList[i].barginPrice = price;
            break;
          }
        }
        self.setData({
          showSpecialPrice: false,
          searchList: searchList,
          barginPrice: ''
        });
      });
    }
  }
})