import { api } from '../../utils/util.js';

const { imageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    imageContainer: {
      position: imageUserBaseUrl + 'c_home_button_location.png',
      detail: imageUserBaseUrl + 'c_home_arrow_small.png'
    },
    userName: '',
    gender: '1',
    phone: '',
    address: null,
    houseNumber: ''
  },

  onLoad(options) {
    let self = this, addressId = options.id;
    if (addressId) {
      api.request('/buyer/account/getAddress', { addressId: addressId }).then(({ data }) => {
        let address = {};
        address.address = data.address;
        address.latitude = data.latitude;
        address.longitude = data.longitude;
        self.setData({
          userName: data.name,
          gender: data.sex,
          phone: data.phone,
          address: address,
          houseNumber: data.detailAddress
        });
      }).catch((e) => { console.log(e); });
    }
  },

  inputName({ detail }) {
    this.setData({
      userName: detail.value
    });
  },

  genderChange({ detail }) {
    this.setData({
      gender: detail.value
    });
  },

  inputPhone({ detail }) {
    this.setData({
      phone: detail.value
    });
  },

  chooseLocation() {
    let self = this;
    wx.chooseLocation({
      success(result) {
        self.setData({
          address: result
        });
      }
    });
  },

  inputHouseNumber({ detail }) {
    this.setData({
      houseNumber: detail.value
    });
  },
  
  saveAddress() {
    let data = this.data, saveData = {};
    if (data.userName === '') {
      api.modal('请输入您的姓名', false, '', '知道啦');
      return;
    }
    if (data.phone === '' || !/^1[34578]\d{9}$/.test(data.phone)) {
      api.modal('请输入正确手机号', false, '', '知道啦');
      this.setData({
        phone: ''
      });
      return;
    }
    if (!data.address) {
      api.modal('请选择小区/大厦/学校', false, '', '知道啦');
      return;
    }
    if (data.houseNumber === '') {
      api.modal('请选择楼号 门牌号', false, '', '知道啦');
      return;
    }
    let userInfo = wx.getStorageSync('lsb_user');
    saveData.userId = userInfo.openid;
    saveData.name = data.userName;
    saveData.sex = data.gender;
    saveData.phone = data.phone;
    saveData.address = data.address.address;
    saveData.detailAddress = data.houseNumber;
    saveData.longitude = data.address.longitude.toString();
    saveData.latitude = data.address.latitude.toString();
    api.request('/buyer/account/saveAddress', saveData).then(() => {
      wx.navigateBack({
        delta: 1
      });
    }).catch((e) => { console.log(e); });
  }
})