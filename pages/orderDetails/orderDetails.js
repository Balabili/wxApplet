import { api, getNonceStr } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo, appid, payId, payKey } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      wait: imageUserBaseUrl + 'c_wait_time.png',
      call: imageUserBaseUrl + 'c_calling.png'
    },
    orderId: '',
    orderInfo: {},
    paymentStatus: false,
    orderItemList: [],
    remainingTime: '15:00',
    finishTime: ''
  },

  onLoad(options) {
    let self = this, orderId = options.id;
    self.setData({
      orderId: orderId
    });
    api.request('/buyer/order/orderDetail', { orderId: orderId }).then(({ data }) => {
      let dateString = data.createDate.replace(/-/g, "/"), remainingSecond = Math.floor((+new Date() - (+new Date(dateString))) / 1000);
      self.setData({
        orderInfo: data,
        finishTime: data.finishTime
      });
      if (remainingSecond > 900) { return; }
      //差10s误差   防止后台自动检测删除订单逻辑出错
      self.calculateTime(900 - remainingSecond - 10, orderId);
    }).catch((e) => { console.log(e); });
  },

  calculateTime(remainingSecond, orderId) {
    let self = this, seconds = remainingSecond;
    let timer = setInterval(() => {
      if (seconds) {
        let minute = Math.floor(seconds / 60), second = seconds % 60;
        minute = minute < 10 ? '0' + minute : minute;
        second = second < 10 ? '0' + second : second;
        seconds--;
        self.setData({
          remainingTime: minute + ':' + second
        });
      } else {
        clearInterval(timer);
        api.request('/buyer/order/cancelOrder', { orderId: orderId }).then(() => {
          wx.navigateBack({
            delta: 1
          });
        }).catch((e) => { console.log(e); });
      }
    }, 1000);
  },

  cancelOrder({ currentTarget }) {
    let orderId = currentTarget.dataset.id;
    api.modal('确认取消订单吗？', true, '再等等', '取消订单').then((confirm) => {
      if (!confirm) {
        return false;
      }
      return api.request('/buyer/order/cancelOrder', { orderId: orderId });
    }).then((result) => {
      if (!result) {
        return false;
      }
      return api.modal('订单已取消成功！', false, '', '知道啦');
    }).then((result) => {
      if (result) {
        wx.navigateBack({
          delta: 1
        });
      }
    }).catch((e) => { console.log(e); });
  },

  payNow() {
    api.showLoading('');
    let self = this, data = self.data, orderId = data.orderId, orderInfo = data.orderInfo, nonceStr = getNonceStr(), userInfo = wx.getStorageSync('lsb_user');
    wx.removeStorageSync('shoppingCart');
    let orderData = {};
    orderData.openid = userInfo.openid;
    orderData.price = orderInfo.total.toString();
    orderData.orderNum = orderInfo.number;
    orderData.appid = appid;
    orderData.mch_id = payId;
    orderData.sec32 = nonceStr;
    orderData.mySec32 = payKey;
    api.request('/buyer/order/doOrder', orderData).then(({ data }) => {
      //获取prepay_id  paySign
      return api.requestPayment(data.timeStamp, data.nonceStr, data.package, data.paySign);
    }).then((result) => {
      wx.hideLoading();
      if (result) {
        // return api.request('/buyer/order/paySuccess', { orderId: orderId, userId: userInfo.openid });
        return api.request('/buyer/order/paySuccess', { appId: result.appId, secret: result.secret, template_id: result.template_id, prepay_id: result.prepay_id, orderId: orderId });
      }
    }).then((result) => {
      if (result) {
        wx.navigateBack({
          delta: 1
        });
      }
    }).catch((e) => {
      wx.hideLoading();
      console.log(e);
    });
  },

  cantactShop() {
    let phone = wx.getStorageSync('shopPhone');
    wx.makePhoneCall({
      phoneNumber: phone
    });
  }
})