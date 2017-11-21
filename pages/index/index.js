import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopImageUserBaseUrl, shopInfo } = getApp().globalData;

Page({
  data: {
    imageContainer: {
      msgbox1: imageUserBaseUrl + 'c_peson_1.png',
      msgbox2: imageUserBaseUrl + 'c_location_2.png',
      msgbox3: imageUserBaseUrl + 'c_delivery_3.png',
      msgbox4: imageUserBaseUrl + 'c_open_4.png',
      close: imageUserBaseUrl + 'close.png',
      homeArrow: imageUserBaseUrl + 'c_home_arrow_big.png',
      home1: imageUserBaseUrl + 'c_home_1.png',
      home2: imageUserBaseUrl + 'c_home_2.png',
      home3: imageUserBaseUrl + 'c_home_3.png',
      home4: imageUserBaseUrl + 'c_home_4.png',
      home5: imageUserBaseUrl + 'c_home_5.png',
      homeArrowSmall: imageUserBaseUrl + 'c_home_button_more-.png',
      hotSell: imageUserBaseUrl + 'c_home_hot.png',
      newCommodity: imageUserBaseUrl + 'c_tab_newgood.png',
      homeCall: imageUserBaseUrl + 'c_home_calling.png',
      homeSpecialPrice: imageUserBaseUrl + 'c_discount.png',
      homeHotSell: imageUserBaseUrl + 'c_hot_good.png',
      homeNewCommodity: imageUserBaseUrl + 'c_new_good.png',
      banner1: imageUserBaseUrl + 'banner1.png',
      downImg: shopImageUserBaseUrl + 'sleep.png',
      happyImg: shopImageUserBaseUrl + 'happy.png'
    },
    imgUrls: [
      shopImageUserBaseUrl + 'banne1.png',
      // imageUserBaseUrl + 'banne2.png',
      // imageUserBaseUrl + 'banner3.png'
    ],
    //closeFlag  1关  serviceFlag  1  不配送
    shopInfo: {},
    kind: [],
    bargainList: [],
    newList: [],
    hotList: [],
    showShopInfo: false,
    //是否显示进入商家后台的入口
    isShopkeepers: true,
    formCount: 25,
    disabledBtn: false
  },


  viewBusinessDetails() {
    this.setData({
      showShopInfo: true
    });
  },

  login() {
    let self = this, disabledBtn = self.data.disabledBtn, userInfo = wx.getStorageSync('lsb_user');
    if (disabledBtn) {
      return;
    }
    self.setData({
      disabledBtn: true
    });
    api.request('/seller/shop/shopEnter', { shopId: shopInfo, userId: userInfo.openid }).then(({ data }) => {
      if (data) {
        self.setData({
          showShopInfo: false
        });
        wx.navigateTo({
          url: '../shopIndex/shopIndex',
        });
      } else {
        api.modal('对不起，您没有权限', false, '', '知道啦').then(() => {
          self.setData({
            isShopkeepers: false
          });
        });
      }
    }).catch((e) => { console.log(e); });
  },

  searchCommodity() {
    wx.navigateTo({
      url: '../search/search'
    });
  },

  viewCommodityDetail({ currentTarget }) {
    let commodityId = currentTarget.dataset.id;
    wx.navigateTo({
      url: '../commodityDetail/commodityDetail?id=' + commodityId
    });
  },

  pickCommodity({ currentTarget }) {
    let typeId = currentTarget.dataset.id;
    if (typeId) {
      wx.setStorageSync('commodityKindId', typeId);
    }
    wx.switchTab({
      url: '/pages/commodityKind/commodityKind'
    });
  },

  viewCommodityList() {
    wx.navigateTo({
      url: '../commodityList/commodityList'
    });
  },

  hideShopInfo() {
    this.setData({
      showShopInfo: false
    });
  },

  onShow() {
    let self = this, userInfo = wx.getStorageSync('lsb_user'), data = { shopId: shopInfo };
    //第一次进入小程序首页的用户由于异步加载 获取不到userinfo
    if (userInfo) {
      data.userId = userInfo.openid;
    }
    api.showLoading('loading');
    api.request('/buyer/home/gethome', data).then(({ shopInfo, formCount, bargainList, hotList, newList, type, isShopkeepers }) => {
      let authorize = wx.getStorageSync('authorize'), passValidation = false;
      if (authorize === false) {
        //未授权
        passValidation = false;
      } else {
        //授权了但是请求数据没过来
        passValidation = userInfo ? isShopkeepers : true;
      }
      wx.setStorageSync('shopPhone', shopInfo.phone);
      self.setData({
        shopInfo: shopInfo,
        kind: type,
        bargainList: bargainList,
        newList: newList,
        hotList: hotList,
        isShopkeepers: passValidation,
        formCount: formCount,
        disabledBtn: false
      });
      wx.hideLoading(); 
      wx.setStorageSync('shopClosed', false);
      wx.setStorageSync('dispatchPrice', shopInfo.servicePrice);
      if (shopInfo.closeFlag === '1') {
        wx.setStorageSync('shopClosed', true);
        return api.modal('店家打烊啦~~', false, '', '知道啦');
      }
      if (shopInfo.serviceFlag === '1') {
        return api.modal(`${self.data.shopInfo.serviceTimeEnd}之后不配送，请到店自取`, false, '', '知道啦');
      }
    }).catch((e) => {
      console.log(e);
      wx.hideLoading(); 
    });
  },

  onShareAppMessage() {
    return {
      title: '阔狐零售商城展示',
      path: '/pages/index/index'
    }
  }
})