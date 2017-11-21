import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      add: imageUserBaseUrl + 'c_button_add.png',
      subtract: imageUserBaseUrl + 'c_button_minus.png',
      noCommodity: imageUserBaseUrl + 'c_cart_none.png',
      hasCommodity: imageUserBaseUrl + 'c_cart_positive.png',
      empty: imageUserBaseUrl + 'button_qingkong.png'
    },
    menuList: [{ name: '今日特价', type: '1', selected: true }, { name: '热销商品', type: '2', selected: false }, { name: '上架新品', type: '3', selected: false }],
    commodityList: [],
    shoppingCart: [],
    totalPrice: 0,
    selectedCount: 0,
    showCartDetails: false,
    dispatchPrice: 0,
    disableBtn: false,
    shopClosed: false
  },

  onLoad() {
    let self = this, shoppingCart = wx.getStorageSync('shoppingCart') || [], shopClosed = wx.getStorageSync('shopClosed'), dispatchPrice = wx.getStorageSync('dispatchPrice') || 0;
    self.setData({
      shoppingCart: shoppingCart,
      dispatchPrice: dispatchPrice,
      shopClosed: shopClosed
    });
    api.request('/buyer/home/getCommodity', { shopId: shopInfo, type: '1' }).then(({ commodity }) => {
      //页面初始化时计算购物车  显示已选商品数目
      let shopLen = shoppingCart.length, comLen = commodity.length, totalCount = 0, totalPrice = 0;
      for (let i = 0; i < shopLen; i++) {
        for (let j = 0; j < comLen; j++) {
          if (shoppingCart[i].id === commodity[j].id) {
            commodity[j] = shoppingCart[i];
            break;
          }
        }
      }
      for (let i = 0; i < shoppingCart.length; i++) {
        totalCount += shoppingCart[i].count;
        totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
      }
      self.setData({
        commodityList: commodity,
        shoppingCart: shoppingCart,
        selectedCount: totalCount,
        totalPrice: totalPrice
      });
    }).catch((e) => { console.log(e); });
  },

  changeTab({ target }) {
    //强制重新生成元素   修改背景变色bug
    this.setData({
      commodityList: []
    });
    const selectedTabType = target.dataset.type;
    let self = this, data = self.data, menuList = data.menuList, len = menuList.length, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length;
    api.request('/buyer/home/getCommodity', { shopId: shopInfo, type: selectedTabType }).then(({ commodity }) => {
      let comLen = commodity.length;
      for (let i = 0; i < len; i++) {
        menuList[i].selected = selectedTabType === menuList[i].type;
      }
      //页面显示的商品与购物车中商品的选中数目一致
      for (let i = 0; i < shopLen; i++) {
        for (let j = 0; j < comLen; j++) {
          if (shoppingCart[i].id === commodity[j].id) {
            commodity[j] = shoppingCart[i];
            break;
          }
        }
      }
      self.setData({
        commodityList: commodity,
        menuList: menuList
      });
    });
  },

  commodityOperate({ target, currentTarget }) {
    const operation = target.dataset.id, commodityId = currentTarget.dataset.id;
    let self = this, data = self.data, selectedCount = 0, totalPrice = 0, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, commodityList = data.commodityList, len = commodityList.length, notExistInCommodityList = true;
    //如果点击的不是按钮  跳转到详情页
    if (operation) {
      if (operation === 'add') {
        for (let i = 0; i < len; i++) {
          if (commodityList[i].id === commodityId) {
            //修改页面中的商品数目
            commodityList[i].count = (commodityList[i].count ? commodityList[i].count : 0) + 1;
            //修改购物车中的商品数目
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = commodityList[i].count;
                break;
              }
            }
            if (commodityList[i].count === 1) {
              shoppingCart.push(commodityList[i]);
            }
            notExistInCommodityList = false;
            break;
          }
        }
        //点击的是购物车中的商品时 如果页面中没有商品  做额外控制
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
          if (commodityList[i].id === commodityId) {
            //修改页面中的商品数目
            commodityList[i].count = commodityList[i].count - 1;
            //修改购物车中的商品
            for (let j = 0; j < shopLen; j++) {
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = commodityList[i].count;
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
        //点击的是购物车中的商品时 如果页面中没有商品  做额外控制
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
      commodityList: commodityList,
      shoppingCart: shoppingCart
    });
    //每次修改都会修改缓存
    wx.setStorageSync('shoppingCart', shoppingCart);
  },

  viewCartDetails() {
    let shoppingCart = this.data.shoppingCart;
    if (shoppingCart.length === 0) { return; }
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
    //商品数目清零 清空购物车缓存 收回购物车详情
    let data = this.data, commodityList = data.commodityList, comLen = commodityList.length, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length;
    for (let i = 0; i < comLen; i++) {
      commodityList[i].count = 0;
    }
    wx.removeStorageSync('shoppingCart');
    this.setData({
      commodityList: commodityList,
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
  },

  onShareAppMessage() {
    return {
      title: '阔狐零售商城展示',
      path: '/pages/commodityList/commodityList'
    }
  }
})