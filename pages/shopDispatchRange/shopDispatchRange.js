import { api } from '../../utils/util.js';

Page({

  data: {
    range: ''
  },

  onLoad(options) {
    this.setData({
      range: parseInt(options.serviceRange)
    });
  },

  changeRange({ detail }) {
    this.setData({
      range: detail.value
    });
  },

  saveDispatchRange() {
    let range = +this.data.range, userInfo = wx.getStorageSync('lsb_user');
    if (range) {
      api.request('/seller/shop/updateInfo', { userId: userInfo.openid, serviceRange: range.toString() }).then(() => {
        wx.navigateBack({
          delta: 1
        });
      }).catch((e) => { console.log(e); });
    } else {
      api.modal('请填写数字', false, '', '知道啦');
    }
  }
})