import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      add: imageUserBaseUrl + 'c_button_add.png',
      subtract: imageUserBaseUrl + 'c_button_minus.png',
      empty: imageUserBaseUrl + 'button_qingkong.png',
      noCommodity: imageUserBaseUrl + 'c_cart_none.png',
      hasCommodity: imageUserBaseUrl + 'c_cart_positive.png'
    },
    commodityId: '',
    commodityData: {},
    shoppingCart: [],
    totalPrice: 0,
    selectedCount: 0,
    dispatchPrice: 0,
    shopClosed: false,
    showCartDetails: false,
    disableBtn: false
  },

  onLoad(options) {
    let self = this, id = options.id, shoppingCart = wx.getStorageSync('shoppingCart') || [], dispatchPrice = wx.getStorageSync('dispatchPrice') || 0, shopClosed = wx.getStorageSync('shopClosed'), totalCount = 0, totalPrice = 0, parentPage = !!options.from;
    api.request('/buyer/commodity/getCommodityDetail', { commodityId: id }).then(({ data }) => {
      //parentPage 为了从商品分类页到详情页，回到上一页时留在原来tab时使用  在商品分类页跳转到此页时options.from有值
      if (parentPage) {
        wx.setStorageSync('commodityKindId', data.lsbCommodityType.id);
      }
      let commodityData = data;
      commodityData.id = id;
      //设置购物车
      for (let i = 0; i < shoppingCart.length; i++) {
        if (shoppingCart[i].id === id) {
          commodityData.count = shoppingCart[i].count;
        }
        totalCount += shoppingCart[i].count;
        totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
      }
      self.setData({
        commodityId: id,
        shoppingCart: shoppingCart,
        dispatchPrice: dispatchPrice,
        shopClosed: shopClosed,
        selectedCount: totalCount,
        totalPrice: totalPrice,
        commodityData: commodityData
      });
    }).catch((e) => { console.log(e); });
  },

  viewCartDetails() {
    let shoppingCart = this.data.shoppingCart;
    if (!shoppingCart.length) {
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

  commodityOperate({ target, currentTarget }) {
    const operation = target.dataset.id, commodityId = currentTarget.dataset.id;
    let self = this, data = self.data, selectedCount = 0, totalPrice = 0, commodityData = data.commodityData, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, notExistInCommodityList = true;
    if (operation) {
      if (operation === 'add') {
        //点击的是当前商品  修改商品数量以及购物车中商品数量
        if (commodityId === commodityData.id) {
          commodityData.count = (commodityData.count ? commodityData.count : 0) + 1;
          //从详情页添加购物车时  添加commodityUrlSmall为了从其他页面回显图片
          commodityData.commodityUrlSmall = commodityData.imgList[0];
          if (commodityData.count === 1) {
            shoppingCart.push(commodityData);
          } else {
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = commodityData.count;
                break;
              }
            }
          }
        } else {
          //点击的是购物车中的商品且不是当前商品
          for (let i = 0; i < shoppingCart.length; i++) {
            if (commodityId === shoppingCart[i].id) {
              shoppingCart[i].count = shoppingCart[i].count + 1;
              break;
            }
          }
        }
      } else if (operation === 'subtract') {
        //点击的是当前商品，如果商品数为0，移除购物车中的当前商品，否则只修改数目
        if (commodityId === commodityData.id) {
          commodityData.count = commodityData.count - 1;
          if (commodityData.count === 0) {
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart.splice(j, 1);
                break;
              }
            }
          } else {
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = commodityData.count;
                break;
              }
            }
          }
        } else {
          //点击的是购物车中的商品并且不是当前商品
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
        //购物车中商品为0时收回购物车详情
        if (shoppingCart.length === 0) {
          self.setData({
            showCartDetails: false
          });
        }
      }
    }
    //计算购物车物品总件数，总额
    for (let i = 0; i < shoppingCart.length; i++) {
      selectedCount += shoppingCart[i].count;
      totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
    }
    self.setData({
      selectedCount: selectedCount,
      totalPrice: totalPrice,
      commodityData: commodityData,
      shoppingCart: shoppingCart
    });
    //每次修改都会更改缓存中的购物车商品
    wx.setStorageSync('shoppingCart', shoppingCart);
  },

  emptyShoppingCart() {
    //清空购物车时  修改显示在页面中的商品数值  清空购物车缓存  收回购物车详情
    let data = this.data, commodityData = data.commodityData, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length;
    commodityData.count = 0;
    wx.removeStorageSync('shoppingCart');
    this.setData({
      commodityData: commodityData,
      shoppingCart: [],
      totalPrice: 0,
      selectedCount: 0,
      showCartDetails: false
    });
  },

  settleAccount() {
    //disableBtn防止多次点击
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
      //不够配送价直接return
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
      //放在缓存中为下单页显示商品信息使用   跳转到下单页面
      wx.setStorageSync('orderStorage', data);
      wx.navigateTo({
        url: '../settleAccount/settleAccount'
      });
    }).catch((e) => { console.log(e); });
  },

  onShareAppMessage() {
    return {
      title: '阔狐零售商城展示',
      path: '/pages/commodityDetail/commodityDetail?id=' + this.data.commodityId
    }
  }
})