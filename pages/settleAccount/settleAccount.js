import { api, getTimeStamp, getNonceStr } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo, appid, payId, payKey, template_id, secret } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      addAddress: imageUserBaseUrl + 'c_add_address.png',
      detail: imageUserBaseUrl + 'c_home_arrow_small.png',
      position: imageUserBaseUrl + 'c_home_button_location.png',
      wait: imageUserBaseUrl + 'c_wait_time_green.png'
    },
    address: {},
    remark: '',
    price: 0,
    orderStorage: {},
    orderId: ''
  },

  onLoad(options) {
    let orderStorage = wx.getStorageSync('orderStorage');
    this.setData({
      orderStorage: orderStorage
    });
  },

  addAddress() {
    wx.navigateTo({
      url: '../selectAddress/selectAddress?from=order'
    });
  },

  addRemark() {
    wx.navigateTo({
      url: '../addRemark/addRemark'
    });
  },

  submitOrder() {
    let self = this, data = self.data, disableBtn = data.disableBtn, address = data.address, remark = data.remark, prepayId = '', nonceStr = getNonceStr(), userInfo = wx.getStorageSync('lsb_user');
    if (!address.id) {
      self.setData({
        disableBtn: false
      });
      api.modal('请填写收货地址', false, '', '知道啦');
      return;
    }
    api.loadingModal('loading');
    api.request('/buyer/order/createOrder', { userId: userInfo.openid, shopId: shopInfo, addressId: address.id, notice: remark }).then(({ data }) => {
      wx.removeStorageSync('shoppingCart');
      self.setData({
        orderId: data.id
      });
      let orderData = {};
      orderData.openid = userInfo.openid;
      orderData.price = data.total.toString();
      orderData.orderNum = data.orderNumber;
      orderData.appid = appid;
      orderData.mch_id = payId;
      orderData.sec32 = nonceStr;
      orderData.mySec32 = payKey;
      return api.request('/buyer/order/doOrder', orderData);
    }).then(({ data }) => {
      prepayId = data.package.substring(10);
      wx.hideLoading();
      return api.requestPayment(data.timeStamp, data.nonceStr, data.package, data.paySign);
    }).then((result) => {
      if (result) {
        //appId: result.appId, secret: result.secret, template_id: result.template_id, prepay_id: result.prepayId
        let orderId = self.data.orderId;
        return api.request('/buyer/order/paySuccess', { appId: result.appId, secret: result.secret, template_id: result.template_id, prepay_id: result.prepay_id, orderId: orderId });
      }
    }).then(() => {
      let orderId = self.data.orderId;
      wx.navigateTo({
        url: '../orderDetails/orderDetails?id=' + orderId
      });
    }).catch((e) => {
      console.log(e);
      wx.hideLoading();
      wx.navigateTo({
        url: '../orderDetails/orderDetails?id=' + orderId
      });
    });
  },

  onShow() {
    let remark = wx.getStorageSync('remark'), addressStorage = wx.getStorageSync('addressStorage');
    this.setData({
      remark: remark,
      address: addressStorage || {}
    });
  }
})