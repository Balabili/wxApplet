import { api } from '../../utils/util.js';

Page({

  data: {
    username: ''
  },

  changeUsername({ detail }) {
    this.setData({
      username: detail.value
    });
  },

  saveUsername() {
    let username = this.data.username, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, linkman: username }).then(() => {
      wx.navigateBack({
        delta: 1
      })
    }).catch((e) => { console.log(e); });
  },

  onLoad(options) {
    this.setData({
      username: options.linkman
    });
  }
})