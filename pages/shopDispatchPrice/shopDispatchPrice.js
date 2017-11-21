import { api } from '../../utils/util.js';

Page({

  data: {
    price: ''
  },

  changePrice({ detail }) {
    this.setData({
      price: detail.value
    });
  },

  saveShopPrice() {
    let price = +this.data.price, userInfo = wx.getStorageSync('lsb_user');
    if (price) {
      api.request('/seller/shop/updateInfo', { userId: userInfo.openid, servicePrice: price.toString() }).then(() => {
        wx.navigateBack({
          delta: 1
        });
      }).catch((e) => { console.log(e); });
    } else {
      api.modal('请填写数字', false, '', '知道啦');
    }
  },

  onLoad(options) {
    let servicePrice = options.servicePrice;
    if (servicePrice) {
      this.setData({
        price: servicePrice
      });
    }
  }
  
})