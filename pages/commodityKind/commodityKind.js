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
    commodityKinds: [],
    commodityList: [],
    shoppingCart: [],
    totalPrice: 0,
    selectedCount: 0,
    dispatchPrice: 0,
    showCartDetails: false,
    //防止load取完数据之后show的时候又取一次
    isLoad: true,
    disableBtn: false,
    shopClosed: false
  },

  onLoad(options) {
    let shoppingCart = wx.getStorageSync('shoppingCart') || [], dispatchPrice = wx.getStorageSync('dispatchPrice') || 0, isAgainOrder = wx.getStorageSync('isAgainOrder'), commodityKindId = wx.getStorageSync('commodityKindId'), shopClosed = wx.getStorageSync('shopClosed'), data = { shopId: shopInfo };
    this.setData({
      isLoad: false,
      shopClosed: shopClosed
    });
    if (isAgainOrder) {
      wx.removeStorageSync('isAgainOrder');
      this.setData({
        showCartDetails: true,
      });
    }
    if (commodityKindId) {
      data.kindId = commodityKindId;
      wx.removeStorageSync('commodityKindId');
    }
    this.getData(shoppingCart, dispatchPrice, data, commodityKindId);
  },

  onShow() {
    if (!this.data.isLoad) {
      return;
    }
    this.setData({
      commodityList: []
    });
    let shoppingCart = wx.getStorageSync('shoppingCart') || [], dispatchPrice = wx.getStorageSync('dispatchPrice') || 0, isAgainOrder = wx.getStorageSync('isAgainOrder'), commodityKindId = wx.getStorageSync('commodityKindId'), shopClosed = wx.getStorageSync('shopClosed'), data = { shopId: shopInfo };
    this.setData({
      shopClosed: shopClosed,
    });
    //再来一单时默认显示购物车详情
    if (isAgainOrder) {
      wx.removeStorageSync('isAgainOrder');
      this.setData({
        showCartDetails: true,
      });
    }
    //从商品详情页回到此页是保留在跳转之前的商品种类  并重新获取数据  已回显商品详情页加入购物车的商品数量
    if (commodityKindId) {
      data.kindId = commodityKindId;
      wx.removeStorageSync('commodityKindId');
    }
    this.getData(shoppingCart, dispatchPrice, data, commodityKindId);
  },

  onHide() {
    //离开此页时隐藏购物车详情  防止购物车一直显示或购物车详情显隐导致的页面闪烁
    this.setData({
      showCartDetails: false,
    });
  },

  getData(shoppingCart, dispatchPrice, data, commodityKindId) {
    let self = this;
    api.request('/buyer/type/getAll', data).then(({ type, commodity }) => {
      let shopLen = shoppingCart.length, comLen = commodity.length, typeLen = type.length, totalCount = 0, totalPrice = 0;
      //从缓存中获取种类id，如果没有默认选择第一个
      if (commodityKindId) {
        for (let i = 0; i < type.length; i++) {
          type[i].selected = type[i].id === commodityKindId;
        }
      } else {
        for (let i = 0; i < type.length; i++) {
          type[i].selected = i === 0;
        }
      }
      //回显购物车中的商品
      for (let i = 0; i < shopLen; i++) {
        for (let j = 0; j < comLen; j++) {
          if (shoppingCart[i].id === commodity[j].id) {
            commodity[j] = shoppingCart[i];
            break;
          }
        }
        //计算每种分类下选择的商品数
        for (let j = 0; j < typeLen; j++) {
          if (shoppingCart[i].lsbCommodityType.id === type[j].id) {
            type[j].count = type[j].count ? type[j].count + shoppingCart[i].count : shoppingCart[i].count;
            break;
          }
        }
      }
      //计算购物车
      for (let i = 0; i < shoppingCart.length; i++) {
        totalCount += shoppingCart[i].count;
        totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
      }
      console.log(totalPrice);
      console.log(dispatchPrice);
      self.setData({
        commodityKinds: type || [],
        commodityList: commodity,
        shoppingCart: shoppingCart,
        selectedCount: totalCount,
        totalPrice: totalPrice,
        dispatchPrice: dispatchPrice,
        isLoad: true
      });
    }).catch((e) => { console.log(e); });
  },

  changeTab({ currentTarget }) {
    //强制重新生成新元素   防止已有元素背景色为选中商品的背景色
    this.setData({
      commodityList: []
    });
    let self = this, kindId = currentTarget.dataset.id, data = self.data, kinds = data.commodityKinds, len = kinds.length;
    api.request('/buyer/type/getAll', { shopId: shopInfo, kindId: kindId }).then(({ commodity }) => {
      let shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, comLen = commodity.length, totalCount = 0;
      //回显购物车中的商品
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
        shoppingCart: shoppingCart
      });
    });
    //切换tab active样式
    for (let i = 0; i < len; i++) {
      kinds[i].selected = kindId === kinds[i].id;
    }
    self.setData({
      commodityKinds: kinds
    });
  },

  searchCommodity() {
    wx.navigateTo({
      url: '../search/search',
    });
  },

  commodityOperate({ target, currentTarget }) {
    const operation = target.dataset.id, commodityId = currentTarget.dataset.id;
    let self = this, data = self.data, selectedCount = 0, totalPrice = 0, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, commodityList = data.commodityList, len = commodityList.length, commodityKinds = data.commodityKinds, kindLen = commodityKinds.length, notExistInCommodityList = true;
    //判断点击的是否是按钮，如果不是  跳转到详情页
    if (operation) {
      if (operation === 'add') {
        for (let i = 0; i < len; i++) {
          if (commodityList[i].id === commodityId) {
            //修改页面中的商品
            commodityList[i].count = (commodityList[i].count ? commodityList[i].count : 0) + 1;
            //计算商品分类数目
            for (let j = 0; j < kindLen; j++) {
              if (commodityKinds[j].id === commodityList[i].lsbCommodityType.id) {
                commodityKinds[j].count = commodityKinds[j].count ? commodityKinds[j].count + 1 : 1;
                break;
              }
            }
            //修改购物车中的商品列表
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
        //点击购物车中的添加商品按钮时  购物车商品不在当前显示的商品中  额外控制
        if (notExistInCommodityList) {
          for (let i = 0; i < shoppingCart.length; i++) {
            if (commodityId === shoppingCart[i].id) {
              shoppingCart[i].count = shoppingCart[i].count + 1;
              //计算商品分类数目
              for (let j = 0; j < kindLen; j++) {
                if (commodityKinds[j].id === shoppingCart[i].lsbCommodityType.id) {
                  commodityKinds[j].count = commodityKinds[j].count ? commodityKinds[j].count + 1 : 1;
                  break;
                }
              }
              break;
            }
          }
        }
      } else if (operation === 'subtract') {
        for (let i = 0; i < len; i++) {
          if (commodityList[i].id === commodityId) {
            //修改页面中的商品
            commodityList[i].count = commodityList[i].count - 1;
            //计算商品分类数目
            for (let j = 0; j < kindLen; j++) {
              if (commodityKinds[j].id === commodityList[i].lsbCommodityType.id) {
                commodityKinds[j].count = commodityKinds[j].count - 1;
                break;
              }
            }
            for (let j = 0; j < shopLen; j++) {
              //修改购物车中的商品
              if (shoppingCart[j].id === commodityId) {
                shoppingCart[j].count = commodityList[i].count;
                if (shoppingCart[j].count === 0) {
                  shoppingCart.splice(j, 1);
                  break;
                }
              }
            }
            notExistInCommodityList = false;
            break;
          }
        }
        //点击购物车中的减少商品按钮时   购物车商品不在当前显示的商品中  额外控制
        if (notExistInCommodityList) {
          for (let i = 0; i < shoppingCart.length; i++) {
            if (commodityId === shoppingCart[i].id) {
              shoppingCart[i].count = shoppingCart[i].count - 1;
              //计算商品分类数目
              for (let j = 0; j < kindLen; j++) {
                if (commodityKinds[j].id === shoppingCart[i].lsbCommodityType.id) {
                  commodityKinds[j].count = commodityKinds[j].count - 1;
                  break;
                }
              }
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
    } else {
      wx.navigateTo({
        url: '../commodityDetail/commodityDetail?id=' + commodityId + '&from=kind'
      });
    }
    //计算购物车物品总件数，总额
    for (let i = 0; i < shoppingCart.length; i++) {
      selectedCount += shoppingCart[i].count;
      totalPrice = +(shoppingCart[i].bargainPrice ? shoppingCart[i].bargainPrice : shoppingCart[i].price) * shoppingCart[i].count + totalPrice;
    }
    self.setData({
      selectedCount: selectedCount,
      totalPrice: totalPrice,
      commodityList: commodityList,
      shoppingCart: shoppingCart,
      commodityKinds: commodityKinds
    });
    //每次修改都会更改缓存中的购物车商品
    wx.setStorageSync('shoppingCart', shoppingCart);
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

  emptyShoppingCart() {
    //清空购物车时  修改显示在页面中的商品数值  清空购物车缓存  收回购物车详情  清空tab中的count
    let data = this.data, commodityList = data.commodityList, comLen = commodityList.length, shoppingCart = data.shoppingCart, shopLen = shoppingCart.length, commodityKinds = data.commodityKinds, kindLen = commodityKinds.length;
    for (let i = 0; i < comLen; i++) {
      commodityList[i].count = 0;
    }
    for (let i = 0; i < kindLen; i++) {
      commodityKinds[i].count = 0;
    }
    wx.removeStorageSync('shoppingCart');
    this.setData({
      commodityList: commodityList,
      commodityKinds: commodityKinds,
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
      //不满足配送条件时  直接return
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
      path: '/pages/commodityKind/commodityKind'
    }
  }
})