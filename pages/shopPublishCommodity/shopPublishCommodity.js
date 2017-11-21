import { api } from '../../utils/util.js';

const { imageUserBaseUrl, shopImageUserBaseUrl } = getApp().globalData;

Page({

  data: {
    cameraImage: shopImageUserBaseUrl + 'b-release_add_pictuer.png',
    deleteImage: shopImageUserBaseUrl + 'b_release_delete.png',
    viewDetailsimage: imageUserBaseUrl + 'c_home_arrow_small.png',
    imageList: [],
    currentIndex: 0,
    commodityId: '',
    commodityTitle: '',
    kind: {},
    length: 0,
    price: '',
    specification: '',
    code: '',
    description: '',
    changeImage: false,
    hidePhotoActionSheet: true,
    //编辑时重新添加图片会调用onShow方法，用此变量做控制
    notUseOnShowFunction: false,
    selectCommodityLogoRequired: true,
    disableBtn: false
  },

  onLoad(options) {
    let commodityId = options.commodityId;
    wx.removeStorageSync('commodityKey');
    if (commodityId) {
      this.setData({
        commodityId: commodityId
      });
    }
  },

  addImage() {
    let imageList = this.data.imageList;
    if (imageList.length === 3) {
      api.modal('只能设置三张图片', false, '', '知道啦');
    } else {
      this.setData({
        hidePhotoActionSheet: false
      });
    }
  },

  deleteImage() {
    let data = this.data, index = data.currentIndex, imageList = data.imageList;
    imageList.splice(index, 1);
    this.setData({
      currentIndex: 0,
      imageList: imageList,
      selectCommodityLogoRequired: imageList.length === 0
    });
  },

  changeTitle({ detail }) {
    let value = detail.value.substring(0, 15);
    wx.setStorageSync('currentPageText', value);
    this.setData({
      length: value.length
    });
  },

  setTitle() {
    this.setData({
      commodityTitle: wx.getStorageSync('currentPageText')
    });
  },

  uploadCommodityImg() {
    this.setData({
      hidePhotoActionSheet: false
    });
  },

  changeImage({ detail }) {
    this.setData({
      currentIndex: detail.current
    });
  },

  chooseImg({ currentTarget }) {
    let self = this, name = currentTarget.dataset.name, imageList = self.data.imageList, isEditChangeImage = self.data.isEditChangeImage;
    //相册  拍照
    if (name) {
      api.chooseImage([name], 3 - imageList.length).then(({ tempFilePaths }) => {
        for (let i = 0; i < tempFilePaths.length; i++) {
          imageList.push(tempFilePaths[i]);
        }
        self.setData({
          imageList: imageList,
          changeImage: true,
          hidePhotoActionSheet: true,
          selectCommodityLogoRequired: false
        });
      }).catch((e) => { console.log(e); });
    } else {
      //二维码
      api.scanCode().then((result) => {
        return api.request('/seller/commodityPost/getCommodityByCode', { code: result.toString() });
      }).then(({ data }) => {
        let showapi_res_body = data.showapi_res_body;
        self.setData({
          commodityTitle: showapi_res_body.goodsName,
          length: showapi_res_body.goodsName.length >= 15 ? 15 : showapi_res_body.goodsName.length,
          price: showapi_res_body.price,
          code: showapi_res_body.code,
          changeImage: true,
          hidePhotoActionSheet: true
        });
      }).catch((e) => {
        api.modal('未查到相关商品', false, '', '确定');
        console.log(e);
      });
    }
  },

  listenerActionSheet() {
    this.setData({
      hidePhotoActionSheet: true
    });
  },

  addPrice({ detail }) {
    let price = detail.value.replace(/[^\d\.]/g, '');
    price = price === '' ? '' : '￥' + price
    this.setData({
      price: price
    });
  },

  addSpecification({ detail }) {
    this.setData({
      specification: detail.value
    });
  },

  addCommodityKind() {
    let commodityId = this.data.commodityId;
    if (commodityId) {
      //层数超过6层微信不支持  无效
      api.modal('此处无法更换商品种类', false, '', '知道啦');
    } else {
      wx.navigateTo({
        url: '../shopAddCommodityKind/shopAddCommodityKind',
      });
    }
  },

  addCommodityNumber() {
    let code = this.data.code, url = code ? '../shopAddCommodityNumber/shopAddCommodityNumber?code=' + code : '../shopAddCommodityNumber/shopAddCommodityNumber';
    wx.navigateTo({
      url: url
    });
  },

  addCommodityDescription() {
    let description = this.data.description, url = description ? '../shopAddCommodityDescription/shopAddCommodityDescription?description=' + description : '../shopAddCommodityDescription/shopAddCommodityDescription';
    wx.navigateTo({
      url: url
    });
  },

  putawayCommodity() {
    let self = this, data = self.data, disableBtn = data.disableBtn, commodity = {}, userInfo = wx.getStorageSync('lsb_user');
    commodity.userId = userInfo.openid;
    commodity.imgList = data.imageList;
    if (commodity.imgList.length === 0) {
      api.modal('请添加图片', false);
      return;
    }
    commodity.name = wx.getStorageSync('currentPageText');
    if (!commodity.name) {
      api.modal('请输入商品标题', false);
      return;
    }
    commodity.typeId = data.kind.id;
    if (!commodity.typeId) {
      api.modal('请添加商品分类', false);
      return;
    }
    commodity.price = (+data.price.substring(1)).toString();
    if (!/^\d+\.?\d{0,}$/.test(commodity.price)) {
      api.modal('请输入正确的商品价格', false);
      return;
    }
    commodity.standard = data.specification;
    if (!commodity.standard) {
      api.modal('请输入商品规格', false);
      return;
    }
    if (disableBtn) {
      self.setData({
        disableBtn: false
      });
      return;
    }
    self.setData({
      disableBtn: true
    });
    commodity.number = data.code.toString();
    commodity.detail = data.description;
    if (data.commodityId) {
      commodity.commodityId = data.commodityId;
    }
    if (data.changeImage) {
      api.showLoading('保存中');
      api.uploadFile('/app/uploadImg', data.imageList).then((result) => {
        commodity.imgList = result;
        return api.request('/seller/commodityPost/saveCommodity', commodity);
      }).then(() => {
        return api.successModal(data.commodityId ? '保存成功' : '上架成功');
      }).then(() => {
        setTimeout(() => {
          wx.hideLoading();
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }).catch((e) => { wx.hideLoading(); console.log(e); });
    } else {
      api.request('/seller/commodityPost/saveCommodity', commodity).then(() => {
        return api.successModal(data.commodityId ? '保存成功' : '上架成功');
      }).then(() => {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }).catch((e) => {
        console.log(e);
      });
    }
  },

  onShow() {
    let self = this, commodityId = self.data.commodityId, notUseOnShowFunction = self.data.notUseOnShowFunction, storageCommodityKey = wx.getStorageSync('commodityKey');
    //没有缓存数据
    if (commodityId && !storageCommodityKey) {
      if (notUseOnShowFunction) {
        //编辑时重新添加图片会调用onShow方法，用此变量做控制
        return;
      }
      api.request('/seller/commodity/editCommodity', { commodityId: commodityId }).then(({ data }) => {
        wx.setStorageSync('editCommodityTypeId', data.lsbCommodityType.id);
        //回显详情
        wx.setStorageSync('currentPageText', data.name);
        self.setData({
          imageList: data.commodityUrlBig.split('|'),
          commodityTitle: data.name,
          length: data.name.length,
          kind: data.lsbCommodityType,
          price: '￥' + data.price,
          specification: data.standard,
          code: data.number,
          selectCommodityLogoRequired: false,
          description: data.detail,
          notUseOnShowFunction: true
        });
      });
    } else if (storageCommodityKey) {
      //从缓存中取数据
      if (storageCommodityKey.code) {
        this.setData({
          code: storageCommodityKey.code
        });
      }
      if (storageCommodityKey.kind) {
        this.setData({
          kind: storageCommodityKey.kind
        });
      }
      if (storageCommodityKey.description) {
        this.setData({
          description: storageCommodityKey.description
        });
      }
    } else {
      wx.setStorageSync('currentPageText', '');
    }
  }
})