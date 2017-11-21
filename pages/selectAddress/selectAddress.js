import { touchMove, api } from '../../utils/util.js';

const { imageUserBaseUrl, shopInfo } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      edit: imageUserBaseUrl + 'c_bottob_edit.png',
      add: imageUserBaseUrl + 'c_add_address_white.png'
    },
    activeAddressList: [],
    deactiveAddressList: [],
    //用于左滑删除功能  记录触电定位
    startX: 0,
    startY: 0,
    fromPage: ''
  },

  onLoad(options) {
    this.setData({
      fromPage: options.from
    });
  },

  changeAddress({ currentTarget, target }) {
    let self = this, addressId = currentTarget.dataset.id, targetName = target.dataset.name, data = self.data, activeAddressList = data.activeAddressList, len = activeAddressList.length;
    if (targetName === 'edit') {
      wx.navigateTo({
        url: '../addAddress/addAddress?id=' + addressId,
      });
    } else if (targetName === 'delete') {
      api.request('/buyer/account/deleteAddress', { addressId: addressId }).then(() => {
        let activeAddressList = data.activeAddressList, activeAddressListLen = activeAddressList.length, deactiveAddressList = data.deactiveAddressList, deactiveAddressListLen = deactiveAddressList.length;
        for (let i = 0; i < activeAddressListLen; i++) {
          if (activeAddressList[i].id === addressId) {
            activeAddressList.splice(i, 1);
            break;
          }
        }
        if (activeAddressListLen !== activeAddressList.length) {
          self.setData({
            activeAddressList: activeAddressList
          });
          return;
        }
        for (let i = 0; i < deactiveAddressListLen; i++) {
          if (deactiveAddressList[i].id === addressId) {
            deactiveAddressList.splice(i, 1);
            break;
          }
        }
        self.setData({
          activeAddressList: activeAddressList,
          deactiveAddressList: deactiveAddressList
        });
      }).catch((e) => { console.log(e); });
    } else {
      for (let i = 0; i < len; i++) {
        if (activeAddressList[i].id === addressId) {
          wx.setStorageSync('addressStorage', activeAddressList[i]);
          wx.navigateBack({
            delta: 1
          });
        }
      }
    }
  },
  
  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    });
  },
  //左滑删除
  touchmove({ currentTarget, changedTouches }) {
    let self = this,
      start = { X: self.data.startX, Y: self.data.startY },
      end = { X: changedTouches[0].clientX, Y: changedTouches[0].clientY },
      position = touchMove(start, end),
      addressId = currentTarget.dataset.id,
      activeAddressList = self.data.activeAddressList,
      deactiveAddressList = self.data.deactiveAddressList,
      len = activeAddressList.length, deactiveLen = deactiveAddressList.length;
      //分别判断有效地址和无效地址进行删除
    for (let i = 0; i < len; i++) {
      if (position === 'left') {
        activeAddressList[i].isTouchMove = activeAddressList[i].id === addressId;
      } else {
        activeAddressList[i].isTouchMove = false;
      }
    }
    for (let i = 0; i < deactiveLen; i++) {
      if (position === 'left') {
        deactiveAddressList[i].isTouchMove = deactiveAddressList[i].id === addressId;
      } else {
        deactiveAddressList[i].isTouchMove = false;
      }
    }
    this.setData({
      activeAddressList: activeAddressList,
      deactiveAddressList: deactiveAddressList
    });
  },

  addNewAddress() {
    wx.navigateTo({
      url: '../addAddress/addAddress',
    });
  },

  onShow() {
    let self = this, fromPage = self.data.fromPage, userInfo = wx.getStorageSync('lsb_user');
    if (fromPage === 'info') {
      //从我的页面进入时获取所有地址
      api.request('/buyer/account/getMyAddress', { userId: userInfo.openid }).then(({ data }) => {
        self.setData({
          activeAddressList: data
        });
      }).catch((e) => { console.log(e); });
    } else {
      //选择地址时区分有效地址和无效地址
      api.request('/buyer/order/getUseAddress', { userId: userInfo.openid, shopId: shopInfo }).then(({ use, unUse }) => {
        self.setData({
          activeAddressList: use,
          deactiveAddressList: unUse
        });
      }).catch((e) => { console.log(e); });
    }
  }
})