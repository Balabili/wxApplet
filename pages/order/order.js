import { api, getNonceStr } from '../../utils/util.js';

const { shopInfo, appid, payId, payKey } = getApp().globalData;

Page({

  data: {
    tabIndex: 0,
    orderList: [],
    isLoaded: false,
    disableBtn: false
  },

  onLoad(options) {
    //index用于从我的进入到订单页定位到相应tab
    let self = this, index = wx.getStorageSync('orderPageIndex'), userInfo = wx.getStorageSync('lsb_user');
    self.setData({
      isLoaded: true
    });
    if (index !== '') {
      wx.removeStorageSync('orderPageIndex');
    } else {
      index = '0';
    }
    if (userInfo) {
      api.request('/buyer/order/getOrder', { userId: userInfo.openid, state: index }).then(({ data }) => {
        self.setData({
          orderList: data,
          tabIndex: +index
        });
      }).catch((e) => { console.log(e); });
    } else {
      wx.showModal({
        title: '提示',
        content: '您点击了拒绝授权，无法获取到订单信息。请删除小程序重新进入。',
      });
    }
  },

  changeTab({ currentTarget }) {
    let self = this, index = +currentTarget.dataset.index, userInfo = wx.getStorageSync('lsb_user');
    if (!userInfo) {
      self.setData({
        tabIndex: +index
      });
      return;
    }
    api.request('/buyer/order/getOrder', { userId: userInfo.openid, state: index.toString() }).then(({ data }) => {
      self.setData({
        orderList: data,
        tabIndex: +index
      });
    }).catch((e) => { console.log(e); });
  },

  viewOrderDetails({ currentTarget, target }) {
    let orderId = currentTarget.dataset.id, status = target.dataset.status, self = this, disableBtn = self.data.disableBtn, orderList = self.data.orderList, len = orderList.length, passTime = false;
    if (disableBtn) {
      self.setData({
        disableBtn: false
      });
      return;
    }
    self.setData({
      disableBtn: true
    });
    for (let i = 0; i < len; i++) {
      if (orderList[i].id === orderId) {
        passTime = self.isPassOrderTime(orderList[i]);
        //判断当前订单是否超时  如果超时从当前列表移除
        if (passTime && orderList[i].status === '1') {
          api.modal('该订单已失效', false, '', '知道啦').then(() => {
            orderList.splice(i, 1);
            self.setData({
              orderList: orderList
            });
          }).catch((e) => { console.log(e); });
        } else {
          //验证通过
          if (status === '1') {
            //去付款
            self.submitOrder(orderList[i]);
          } else if (status === '2' || status === '3') {
            //再来一单
            wx.setStorageSync('isAgainOrder', true);
            api.request('/buyer/order/againOrder', { orderId: orderId }).then(({ data }) => {
              wx.setStorageSync('shoppingCart', data.detailList);
              wx.switchTab({
                url: '/pages/commodityKind/commodityKind',
              });
            }).catch((e) => { console.log(e); });
          } else {
            wx.navigateTo({
              url: '../orderDetails/orderDetails?id=' + orderId,
            });
          }
        }
        break;
      }
    }
  },

  submitOrder(orderInfo) {
    api.showLoading('');
    let self = this, orderList = self.data.orderList, len = orderList.length, nonceStr = getNonceStr(), userInfo = wx.getStorageSync('lsb_user');
    //提交订单清空购物车
    wx.removeStorageSync('shoppingCart');
    let orderData = {};
    orderData.openid = userInfo.openid;
    orderData.price = orderInfo.total.toString();
    orderData.orderNum = orderInfo.orderNumber;
    orderData.appid = appid;
    orderData.mch_id = payId;
    orderData.sec32 = nonceStr;
    orderData.mySec32 = payKey;
    //获取paySign  package
    api.request('/buyer/order/doOrder', orderData).then(({ data }) => {
      return api.requestPayment(data.timeStamp, data.nonceStr, data.package, data.paySign);
    }).then((result) => {
      wx.hideLoading();
      //更改订单状态
      if (result) {
        // return api.request('/buyer/order/paySuccess', { orderId: orderInfo.id, userId: userInfo.openid });
        return api.request('/buyer/order/paySuccess', { appId: result.appId, secret: result.secret, template_id: result.template_id, prepay_id: result.prepay_id, orderId: orderInfo.id });
      }
    }).then((result) => {
      if (result) {
        //付款成功修改列表订单状态
        for (let i = 0; i < len; i++) {
          if (orderList[i].id === orderInfo.id) {
            orderList[i].status = '2';
            break;
          }
        }
        self.setData({
          orderList: orderList
        });
      }
    }).catch((e) => {
      wx.hideLoading();
      console.log(e);
    });
  },

  isPassOrderTime(selectedOrder) {
    let createTime = selectedOrder.createDate.replace(/-/g, '/'), remainingSecond = Math.floor((+new Date() - (+new Date(createTime))) / 1000);
    return remainingSecond >= 890;
  },

  onShow() {
    let self = this, isLoaded = self.data.isLoaded, index = wx.getStorageSync('orderPageIndex'), userInfo = wx.getStorageSync('lsb_user');
    if (isLoaded) {
      self.setData({
        isLoaded: false
      });
      return;
    }
    if (index !== '') {
      wx.removeStorageSync('orderPageIndex');
      if (userInfo) {
        api.request('/buyer/order/getOrder', { userId: userInfo.openid, state: index }).then(({ data }) => {
          self.setData({
            orderList: data,
            tabIndex: +index
          });
        }).catch((e) => { console.log(e); });
      } else {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权，无法获取到订单信息。请10分钟后再次点击授权，或者删除小程序重新进入。',
        });
      }
    } else {
      api.request('/buyer/order/getOrder', { userId: userInfo.openid, state: '0' }).then(({ data }) => {
        self.setData({
          orderList: data,
          tabIndex: +index
        });
      }).catch((e) => { console.log(e); });
    }
  },

  onShareAppMessage() {
    return {
      title: '阔狐零售商城展示',
      path: '/pages/order/order'
    }
  }
})