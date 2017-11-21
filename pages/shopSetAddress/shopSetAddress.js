import { api } from '../../utils/util.js';

const { imageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    address: '',
    latitude: '',
    longitude: '',
    addressDetail: '',
    positionImage: imageUserBaseUrl + 'c_home_button_location.png'
  },

  onLoad(options) {
    let self = this, addressId = options.addressId;
    api.request('/seller/shop/getShopAddress', { addressId: addressId }).then(({ data }) => {
      self.setData({
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        addressDetail: data.detailAddress
      });
    });
  },

  selectAddress() {
    let self = this;
    api.chooseLocation().then(({ address, latitude, longitude }) => {
      self.setData({
        address: address,
        latitude: latitude,
        longitude: longitude
      });
    });
  },
  
  changeAddressDetail({ detail }) {
    this.setData({
      addressDetail: detail.value
    });
  },
  
  addAddress() {
    let pageData = this.data, data = {}, userInfo = wx.getStorageSync('lsb_user');
    data.address = pageData.address;
    data.latitude = pageData.latitude.toString();
    data.longitude = pageData.longitude.toString();
    data.detailAddress = pageData.addressDetail;
    api.request('/seller/shop/shopAddress', data).then(({ addressId }) => {
      return api.request('/seller/shop/updateInfo', { userId: userInfo.openid, addressId: addressId });
    }).then(() => {
      wx.navigateBack({
        delta: 1
      });
    });
  },

})