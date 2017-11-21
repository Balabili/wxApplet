import { api } from '../../utils/util.js';

Page({

  data: {
    tabIndex: 0,
    commodityKinds: [],
    commodityList: [],
    showSpecialPrice: false,
    barginPrice: '',
    commodityId: '',
    autoFocus: false
  },

  onLoad() {
    wx.removeStorageSync('editCommodityTypeId');
  },

  onShow() {
    let self = this, data = self.data, tabIndex = data.tabIndex, commodityTypeId = wx.getStorageSync('editCommodityTypeId'), userInfo = wx.getStorageSync('lsb_user');
    if (commodityTypeId) {
      api.request('/seller/commodity/getCommodity', { userId: userInfo.openid, type: tabIndex.toString(), kindId: commodityTypeId }).then(({ commodity }) => {
        self.setData({
          commodityList: commodity
        });
      }).catch((e) => { console.log(e); });
    } else {
      self.getDefaultData(tabIndex.toString());
    }
  },

  //获取数据的common方法
  getDefaultData(tabIndex) {
    let self = this, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/commodity/getCommodity', { userId: userInfo.openid, type: tabIndex }).then(({ commodity, type }) => {
      if (type) {
        for (let i = 0; i < type.length; i++) {
          type[i].selected = i === 0;
        }
      }
      self.setData({
        tabIndex: +tabIndex,
        commodityKinds: type || [],
        commodityList: commodity || []
      });
    }).catch((e) => { console.log(e); });
  },

  changeTaskTab({ currentTarget }) {
    let self = this, tabIndex = currentTarget.dataset.index;
    this.getDefaultData(tabIndex);
  },

  changeTab({ target }) {
    //改分类id
    let self = this, kindId = target.dataset.id, data = self.data, kinds = data.commodityKinds, len = kinds.length, userInfo = wx.getStorageSync('lsb_user');
    api.request('/seller/commodity/getCommodity', { userId: userInfo.openid, type: data.tabIndex.toString(), kindId: kindId }).then(({ commodity }) => {
      self.setData({
        commodityList: commodity
      });
    }).catch((e) => { console.log(e); });
    for (let i = 0; i < len; i++) {
      kinds[i].selected = kindId === kinds[i].id;
    }
    self.setData({
      commodityKinds: kinds
    });
  },

  operateCommodity({ target, currentTarget }) {
    // 1 新品 2 特价 3 热销 4 售罄 5 编辑 6 删除
    let status = +target.dataset.status, commodityId = currentTarget.dataset.id;
    if (status) {
      switch (status) {
        case 1:
          this.changeCommodityStatus(commodityId, 'isNew');
          break;
        case 2:
          this.changeCommodityStatus(commodityId, 'isBargain');
          break;
        case 3:
          this.changeCommodityStatus(commodityId, 'isHot');
          break;
        case 4:
          this.changeCommodityStatus(commodityId);
          break;
        case 5:
          wx.navigateTo({
            url: '../shopPublishCommodity/shopPublishCommodity?commodityId=' + commodityId,
          });
          break;
        case 6:
          this.deleteCommodity(commodityId);
          break;
        default: break;
      }
    }
  },

  deleteCommodity(commodityId) {
    let self = this, data = self.data, commodityList = data.commodityList, len = commodityList.length;
    api.modal('删除后不可恢复，确认删除？').then((confirm) => {
      if (confirm) {
        return api.request('/seller/commodityPost/deleteCommodity', { commodityId: commodityId });
      } else {
        return false;
      }
    }).then((result) => {
      if (!result) {
        return;
      }
      api.successModal('删除成功');
      //当前分类下的商品取消删除的商品
      for (let i = 0; i < len; i++) {
        if (commodityList[i].id === commodityId) {
          commodityList.splice(i, 1);
          break;
        }
      }
      //若当前商品分类中的商品数目为0  则重新获取数据
      if (commodityList.length === 0) {
        let tabIndex = data.tabIndex;
        self.getDefaultData(tabIndex.toString());
      } else {
        self.setData({
          commodityList: commodityList
        });
      }
    }).catch((e) => { console.log(e); });
  },

  changeCommodityStatus(commodityId, field) {
    let self = this, data = self.data, tabIndex = data.tabIndex, commodityList = data.commodityList, len = commodityList.length, commodityKinds = data.commodityKinds, kindLength = commodityKinds.length;
    for (let i = 0; i < len; i++) {
      if (commodityList[i].id === commodityId) {
        let title = '', commodityType = 0;
        switch (field) {
          case 'isNew':
            title = commodityList[i].isNew === '1' ? '确定取消新品上架吗？' : '确定设置为新品吗？';
            commodityType = commodityList[i].isNew === '1' ? '5' : '4';
            break;
          case 'isBargain':
            title = commodityList[i].isBargain === '1' ? '确定恢复商品原价吗？' : '确定设置为特价吗？';
            commodityType = commodityList[i].isBargain === '1' ? '7' : '6';
            break;
          case 'isHot':
            title = commodityList[i].isHot === '1' ? '确定取消热销上架吗？' : '确定设置为热销吗？';
            commodityType = commodityList[i].isHot === '1' ? '1' : '0';
            break;
          default:
            title = commodityList[i].sellOut === '1' ? '确定有货吗？' : '确定设置为售罄吗？';
            commodityType = commodityList[i].sellOut === '1' ? '3' : '2';
            break;
        }
        if (commodityType === '6') {
          //设为特价
          self.setData({
            showSpecialPrice: true,
            commodityId: commodityId
          });
        } else {
          api.modal(title).then((confirm) => {
            if (confirm) {
              return api.request('/seller/commodity/updateCommodity', { commodityId: commodityId, type: commodityType });
            } else {
              return false;
            }
          }).then((result) => {
            if (result) {
              let isRemoveCommodity = false;
              //0热销 1取消热销 2售罄 3有货 4新品 5取消新品 6特价 7取消特价
              if (commodityType === '0' || commodityType === '1' || commodityType === '4' || commodityType === '5' || commodityType === '6' || commodityType === '7') {
                //在第一个tab操作商品时不移除商品只改变状态  在其他tab时移除商品
                commodityList[i][field] = commodityList[i][field] === '0' ? '1' : '0';
                if (tabIndex) {
                  commodityList.splice(i, 1);
                  isRemoveCommodity = true;
                }
              } else {
                commodityList.splice(i, 1);
                isRemoveCommodity = true;
              }
              //移除列表中的商品  如果当前种类没有商品  则重新获取数据
              if (isRemoveCommodity && commodityList.length === 0) {
                let userInfo = wx.getStorageSync('lsb_user')
                return api.request('/seller/commodity/getCommodity', { userId: userInfo.openid, 'type': tabIndex.toString() });
              }
              self.setData({
                commodityList: commodityList,
                commodityKinds: commodityKinds
              });
            }
          }).then(({ commodity, type }) => {
            if (type) {
              for (let i = 0; i < type.length; i++) {
                type[i].selected = i === 0;
              }
              self.setData({
                tabIndex: +tabIndex,
                commodityKinds: type || [],
                commodityList: commodity || []
              });
            }
          }).catch((e) => { console.log(e); });
        }
        break;
      }
    }
  },

  changePrice({ detail }) {
    let barginPrice = detail.value.replace(/[^\d\.]/g, '');
    this.setData({
      barginPrice: barginPrice
    });
  },

  cancelBargin() {
    this.setData({
      showSpecialPrice: false
    });
  },

  setBargin() {
    let self = this, data = self.data, oldPrice = 0, price = data.barginPrice, commodityId = data.commodityId, commodityList = data.commodityList, len = commodityList.length;
    if (!+price) {
      api.modal('输入不合法，请重新输入', false, '', '知道啦');
      self.setData({
        barginPrice: ''
      });
      return;
    }
    for (let i = 0; i < len; i++) {
      if (commodityList[i].id === commodityId) {
        oldPrice = commodityList[i].price;
        break;
      }
    }
    if (price === '') {
      return;
    } else if (price - oldPrice >= 0) {
      api.modal('特价不能高于原价，请重新设置', false, '', '知道啦').catch((e) => { console.log(e); });
    } else {
      api.request('/seller/commodity/updateCommodity', { commodityId: commodityId, type: '6', bargainPrice: price }).then(() => {
        for (let i = 0; i < len; i++) {
          if (commodityList[i].id === commodityId) {
            commodityList[i].isBargain = '1';
            commodityList[i].bargainPrice = price;
            break;
          }
        }
        self.setData({
          showSpecialPrice: false,
          commodityList: commodityList,
          barginPrice: ''
        });
      });
    }
  },

  searchCommodity() {
    wx.navigateTo({
      url: '../shopSearch/shopSearch'
    });
  }
})