import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      add: imageUserBaseUrl + 'c_button_add.png',
      subtract: imageUserBaseUrl + 'c_button_minus.png',
      emptyResult: imageUserBaseUrl + 'c_seach_none.png',
      empty: imageUserBaseUrl + 'button_qingkong.png',
      noCommodity: imageUserBaseUrl + 'c_cart_none.png',
      hasCommodity: imageUserBaseUrl + 'c_cart_positive.png'
    },
    inputValue: '',
    historyRecord: [],
    showNoSearchResult: false,
    searchList: [],
    shoppingCart: [],
    totalPrice: 0,
    selectedCount: 0,
    showCartDetails: false,
    dispatchPrice: 0,
    disableBtn: false,
    shopClosed: false,
    textboxFocus: true
  },

  emptyHistory() {
    //清空历史记录缓存
    wx.setStorageSync('history', []);
    this.setData({
      historyRecord: []
    });
  },

  onLoad(options) {
    //设置历史搜索记录缓存
    let history = wx.getStorageSync('history') || [], shoppingCart = wx.getStorageSync('shoppingCart') || [], shopClosed = wx.getStorageSync('shopClosed'), dispatchPrice = wx.getStorageSync('dispatchPrice') || 0;
    this.setData({
      shoppingCart: shoppingCart,
      dispatchPrice: dispatchPrice,
      historyRecord: history.reverse(),
      shopClosed: shopClosed
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

  clearSearchResult() {
    //清空历史记录  textbox框信息   自动获取焦点
    this.setData({
      searchList: [],
      showNoSearchResult: false,
      inputValue: '',
      textboxFocus: true
    });
  },
  
  searchGoods() {
    var self = this, searchValue = self.data.inputValue;
    if (searchValue === '') {
      self.setData({
        searchList: [],
        showNoSearchResult: false
      });
      return;
    }
    api.request('/buyer/home/searchCommodity', { shopId: shopInfo, keyWord: searchValue }).then(({ data }) => {
      self.operateHistory(searchValue, data);
      self.operateShopStorage(data);
    }).catch((e) => { console.log(e); });
  },

  operateHistory(searchValue, data) {
    //使用Set数据结构做数组去重   存入缓存时再转化为数组  最多八个历史记录
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

  operateShopStorage(data) {
    let self = this, shoppingCart = self.data.shoppingCart, shopLen = shoppingCart.length, comLen = data.length, totalCount = 0, totalPrice = 0;
    for (let i = 0; i < shopLen; i++) {
      for (let j = 0; j < comLen; j++) {
        if (shoppingCart[i].id === data[j].id) {
          data[j] = shoppingCart[i];
          break;
        }
      }
    }
    for (let i = 0; i < shoppingCart.length; i++) {
      totalCount += shoppingCart[i].count;
      totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
    }
    self.setData({
      searchList: data,
      shoppingCart: shoppingCart,
      selectedCount: totalCount,
      totalPrice: totalPrice
    });
  },

  commodityOperate({ target, currentTarget }) {
    //注释同commodityList
    const operation = target.dataset.id, commodityId = currentTarget.dataset.id;
    let self = this, data = self.data, selectedCount = 0, totalPrice = 0, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, searchList = data.searchList, len = searchList.length, notExistInCommodityList = true;
    if (operation) {
      if (operation === 'add') {
        for (let i = 0; i < len; i++) {
          if (searchList[i].id === commodityId) {
            searchList[i].count = (searchList[i].count ? searchList[i].count : 0) + 1;
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = searchList[i].count;
                break;
              }
            }
            if (searchList[i].count === 1) {
              shoppingCart.push(searchList[i]);
            }
            notExistInCommodityList = false;
            break;
          }
        }
        if (notExistInCommodityList) {
          for (let i = 0; i < shoppingCart.length; i++) {
            if (commodityId === shoppingCart[i].id) {
              shoppingCart[i].count = shoppingCart[i].count + 1;
              break;
            }
          }
        }
      } else if (operation === 'subtract') {
        for (let i = 0; i < len; i++) {
          if (searchList[i].id === commodityId) {
            searchList[i].count = searchList[i].count - 1;
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = searchList[i].count;
                if (shoppingCart[j].count === 0) {
                  shoppingCart.splice(j, 1);
                }
                break;
              }
            }
            notExistInCommodityList = false;
            break;
          }
        }
        if (notExistInCommodityList) {
          for (let i = 0; i < shoppingCart.length; i++) {
            if (commodityId === shoppingCart[i].id) {
              shoppingCart[i].count = shoppingCart[i].count - 1;
              if (shoppingCart[i].count === 0) {
                shoppingCart.splice(i, 1);
              }
              break;
            }
          }
        }
        if (shoppingCart.length === 0) {
          self.setData({
            showCartDetails: false
          });
        }
      }
    } else {
      wx.navigateTo({
        url: '../commodityDetail/commodityDetail?id=' + commodityId
      });
    }
    for (let i = 0; i < shoppingCart.length; i++) {
      selectedCount += shoppingCart[i].count;
      totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
    }
    self.setData({
      selectedCount: selectedCount,
      totalPrice: totalPrice,
      searchList: searchList,
      shoppingCart: shoppingCart
    });
    wx.setStorageSync('shoppingCart', shoppingCart);
  },

  viewCartDetails() {
    let shoppingData = this.data.shoppingCart;
    if (!shoppingData.length) {
      return;
    }
    this.setData({
      showCartDetails: true
    });
  },

  hideCartDetails() {
    this.setData({
      showCartDetails: false
    });
  },

  emptyShoppingCart() {
    //页面物品信息数目初始化   清空购物车缓存  收回购物车详情
    let data = this.data, searchList = data.searchList, comLen = searchList.length, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length;
    for (let i = 0; i < comLen; i++) {
      searchList[i].count = 0;
    }
    wx.removeStorageSync('shoppingCart');
    this.setData({
      searchList: searchList,
      shoppingCart: [],
      totalPrice: 0,
      selectedCount: 0,
      showCartDetails: false
    });
  },

  settleAccount() {
    let self = this, data = self.data, userInfo = wx.getStorageSync('lsb_user'), disableBtn = data.disableBtn, totalPrice = data.totalPrice, dispatchPrice = data.dispatchPrice, shoppingCart = data.shoppingCart, len = shoppingCart.length, orderData = { shopId: shopInfo, total: data.totalPrice.toString() }, orders = [];
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '您点击了拒绝授权，无法下单。请删除小程序重新进入。',
      });
      return;
    } else {
      orderData.userId = userInfo.openid;
    }
    if (disableBtn || totalPrice === 0 || (totalPrice - dispatchPrice < 0)) {
      self.setData({
        disableBtn: false
      });
      return;
    }
    self.setData({
      disableBtn: true
    });
    for (let i = 0; i < len; i++) {
      let orderItem = {};
      orderItem.id = shoppingCart[i].id;
      orderItem.count = shoppingCart[i].count.toString();
      orderItem.price = (+(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count).toString();
      orders.push(orderItem);
    }
    orderData.mapList = orders;
    api.request('/buyer/order/showOrder', orderData).then(({ data }) => {
      wx.setStorageSync('orderStorage', data);
      wx.navigateTo({
        url: '../settleAccount/settleAccount'
      });
    }).catch((e) => { console.log(e); });
  }
});