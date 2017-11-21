import { api } from '../../utils/util.js';

Page({

  data: {
    shopName: ''
  },

  changeText({ detail }) {
    this.setData({
      shopName: detail.value
    });
  },

  saveShopName() {
    let name = this.data.shopName, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, name: name })
      .then(() => {
        wx.navigateBack({
          delta: 1
        });
      }).catch((e) => {
        console.log(e);
      });
  },
  
  onLoad(options) {
    let value = options.name;
    this.setData({
      shopName: value
    });
  }
})