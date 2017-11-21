import { api } from '../../utils/util.js';

Page({

  data: {
    phone: ''
  },

  changePhone({ detail }) {
    this.setData({
      phone: detail.value
    });
  },

  savePhone() {
    let self = this, phone = this.data.phone, passValidation = /^1[0-9]{10}$/.test(phone), userInfo = wx.getStorageSync('lsb_user');
    if (passValidation) {
      api.request('/seller/shop/updateInfo', { userId: userInfo.openid, phone: phone }).then(() => {
        wx.navigateBack({
          delta: 1
        });
      }).catch((e) => { console.log(e); });
    } else {
      api.modal('手机号格式不正确', false, '', '知道啦').then(() => {
      });
    }
  },

  onLoad(options) {
    this.setData({
      phone: options.phone
    });
  }
})