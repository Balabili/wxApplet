import { api } from '../../utils/util.js';

Page({

  data: {
    notice: '',
    length: 0
  },

  onLoad(options) {
    if (options.notice) {
      wx.setStorageSync('currentPageText', options.notice);
      this.setData({
        notice: options.notice,
        length: options.notice.length
      });
    } else {
      wx.setStorageSync('currentPageText', '');
    }
  },

  changeNotice({ detail }) {
    let value = detail.value.substring(0, 50);
    wx.setStorageSync('currentPageText', value);
    this.setData({
      length: value.length
    });
  },

  setNotice() {
    this.setData({
      notice: wx.getStorageSync('currentPageText')
    });
  },

  saveNotice() {
    if (this.data.isFocus) {
      return;
    }
    let notice = wx.getStorageSync('currentPageText'), userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, notice: notice })
      .then(() => {
        wx.navigateBack({
          delta: 1
        });
      }).catch((e) => {
        console.log(e);
      });
  },

})