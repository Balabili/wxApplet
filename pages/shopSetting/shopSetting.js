import { api } from '../../utils/util.js';

const { imageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    viewDetailsImg: imageUserBaseUrl + 'c_home_arrow_small.png',
    shopInfo: { logo: '../../images/c_home_1_green.png', name: '', businessTimeStart: '', businessTimeEnd: '', lsbShopAddress: {}, phone: '', linkman: '', serviceTimeStart: '', serviceTimeEnd: '', serviceRange: '', serviceTime: '', servicePrice: '', notice: '' },
    dispatchInfo: {},
    hidePhotoActionSheet: true,
    selectDispatchTime: '10',
    baseTimeArr: [],
    openDuration: [],
    dispatchTime: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'],
    dispatchDuration: [],
    dispatchIndex: 0,
    openDurationIndex: [14, 46],
    dispatchDurationIndex: [14, 46]
  },

  onLoad() {
    //初始化生成时间需要的数组
    this.initTimeline();
  },

  onShow() {
    let self = this, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/getShopSet', { userId: userInfo.openid }).then(({ data }) => {
      //初始化页面数据
      let pageData = self.data, openDurationIndex = [], dispatchDurationIndex = [], dispatchIndex = 0;
      data.logoUrl = data.logoUrl;
      data.servicePrice = `￥${data.servicePrice}`;
      data.serviceRange = `${data.serviceRange}米内`;
      openDurationIndex[0] = self.getBaseTimeArrIndex(data.businessTimeStart);
      openDurationIndex[1] = self.getBaseTimeArrIndex(data.businessTimeEnd);
      dispatchDurationIndex[0] = self.getBaseTimeArrIndex(data.serviceTimeStart);
      dispatchDurationIndex[1] = self.getBaseTimeArrIndex(data.serviceTimeEnd);
      dispatchIndex = self.getDispatchTimeIndex(data.serviceTime);
      self.setData({
        shopInfo: data,
        dispatchIndex: dispatchIndex,
        openDurationIndex: openDurationIndex,
        dispatchDurationIndex: dispatchDurationIndex
      });
    }).catch((e) => { console.log(e); });
  },

  initTimeline() {
    let self = this;
    self.setBaseTimeArr();
    let openDuration = this.initTimeDuration(true), dispatchDuration = this.initTimeDuration(false);
    this.setData({
      openDuration: openDuration,
      dispatchDuration: dispatchDuration
    });
  },
  setBaseTimeArr() {
    let baseTimeArr = this.data.baseTimeArr;
    for (let i = 0; i < 48; i++) {
      let time = '', hour = Math.floor(i / 2);
      if (i % 2 === 0) {
        time = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      } else {
        time = hour < 10 ? `0${hour}:30` : `${hour}:30`;
      }
      baseTimeArr.push(time);
    }
    this.setData({
      baseTimeArr: baseTimeArr
    });
  },
  initTimeDuration(isOpenDuration) {
    let data = this.data, baseTimeArr = this.data.baseTimeArr, duration = isOpenDuration ? data.openDuration : data.dispatchDuration, openDurationIndex = isOpenDuration ? data.openDurationIndex : data.dispatchDurationIndex;
    duration[0] = baseTimeArr;
    duration[1] = baseTimeArr;
    return duration;
  },

  getBaseTimeArrIndex(time) {
    let data = this.data, baseTimeArr = data.baseTimeArr, len = baseTimeArr.length;
    for (let i = 0; i < len; i++) {
      if (time === baseTimeArr[i]) {
        return i;
      }
    }
  },

  getDispatchTimeIndex(time) {
    let data = this.data, dispatchTime = data.dispatchTime, len = dispatchTime.length;
    for (let i = 0; i < len; i++) {
      if (dispatchTime[i].indexOf(time)) {
        return i;
      }
    }
  },

  changeLogo() {
    this.setData({
      hidePhotoActionSheet: false
    });
  },

  chooseImg({ currentTarget }) {
    let self = this, data = self.data, name = currentTarget.dataset.name, userInfo = wx.getStorageSync('lsb_user');
    if (name) {
      api.chooseImage([name], 1).then(({ tempFilePaths }) => {
        return api.uploadFile('/app/uploadImg', tempFilePaths);
      }).then((result) => {
        data.shopInfo.logoUrl = result[0];
        self.setData({
          shopInfo: data.shopInfo,
          hidePhotoActionSheet: true
        });
        return api.request('/seller/shop/updateInfo', { userId: userInfo.openid, logoUrl: result[0] });
      }).catch((e) => { console.log(e); });
    }
  },

  listenerActionSheet() {
    this.setData({
      hidePhotoActionSheet: true
    });
  },

  addShopName() {
    let shopInfo = this.data.shopInfo, url = shopInfo.name ? `../shopSetShopName/shopSetShopName?name=${shopInfo.name}` : '../shopSetShopName/shopSetShopName';
    wx.navigateTo({
      url: url,
    });
  },

  saveOpenDuration({ detail }) {
    let self = this, openDuration = self.data.openDuration, value = detail.value, businessTimeStart = openDuration[0][value[0]], businessTimeEnd = openDuration[1][value[1]], userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, businessTimeStart: businessTimeStart, businessTimeEnd: businessTimeEnd }).then(() => {
      self.setData({
        openDurationIndex: value
      });
    }).catch((e) => { console.log(e); });
  },

  addShopAddress() {
    let shopInfo = this.data.shopInfo, url = shopInfo.lsbShopAddress ? `../shopSetAddress/shopSetAddress?addressId=${shopInfo.lsbShopAddress.id}` : '../shopSetAddress/shopSetAddress';
    wx.navigateTo({
      url: url
    });
  },

  addUserPhone() {
    let shopInfo = this.data.shopInfo, url = shopInfo.phone ? `../shopAddUserPhone/shopAddUserPhone?phone=${shopInfo.phone}` : '../shopAddUserPhone/shopAddUserPhone';
    wx.navigateTo({
      url: url
    });
  },

  addUserName() {
    let shopInfo = this.data.shopInfo, url = shopInfo.linkman ? `../shopAddUserName/shopAddUserName?linkman=${shopInfo.linkman}` : '../shopAddUserName/shopAddUserName';
    wx.navigateTo({
      url: url
    });
  },

  saveDispatchDuration({ detail }) {
    let self = this, dispatchDuration = self.data.dispatchDuration, value = detail.value, serviceTimeStart = dispatchDuration[0][value[0]], serviceTimeEnd = dispatchDuration[1][value[1]], userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, serviceTimeStart: serviceTimeStart, serviceTimeEnd: serviceTimeEnd }).then(() => {
      self.setData({
        dispatchDurationIndex: value
      });
    }).catch((e) => { console.log(e); });
  },

  addDispatchRange() {
    let shopInfo = this.data.shopInfo, url = shopInfo.serviceRange ? `../shopDispatchRange/shopDispatchRange?serviceRange=${shopInfo.serviceRange}` : '../shopDispatchRange/shopDispatchRange';
    wx.navigateTo({
      url: url
    });
  },

  selectDispatchTime({ detail }) {
    let self = this, dispatchTime = this.data.dispatchTime, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/shop/updateInfo', { userId: userInfo.openid, serviceTime: dispatchTime[detail.value] }).then(() => {
      self.setData({
        selectDispatchTime: dispatchTime[detail.value]
      });
    }).catch((e) => { console.log(e); });
  },

  addDispatchPrice() {
    let shopInfo = this.data.shopInfo, url = shopInfo.servicePrice ? `../shopDispatchPrice/shopDispatchPrice?servicePrice=${shopInfo.servicePrice.substring(1)}` : '../shopDispatchPrice/shopDispatchPrice';
    wx.navigateTo({
      url: url
    });
  },

  addNotice() {
    let shopInfo = this.data.shopInfo, url = shopInfo.notice ? `../shopAddNotice/shopAddNotice?notice=${shopInfo.notice}` : '../shopAddNotice/shopAddNotice';
    wx.navigateTo({
      url: url
    });
  }
})