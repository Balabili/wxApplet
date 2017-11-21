Page({

  data: {
    remark: '',
    length: 0
  },

  onLoad(options) {
    let remark = wx.getStorageSync('remark');
    wx.setStorageSync('currentPageText', remark);
    this.setData({
      remark: remark,
      length: remark.length
    });
  },

  addRemark({ detail }) {
    let remark = detail.value.substring(0, 50), length = remark.length;
    //IOS字段中间删除或者添加光标定位到最后的bug
    wx.setStorageSync('currentPageText', remark);
    this.setData({
      length: length,
    });
    console.log(this.data.cursor);
  },

  setRemark() {
    this.setData({
      remark: wx.getStorageSync('currentPageText')
    });
  },

  saveAddress() {
    // let data = this.data.remark;
    let data = wx.getStorageSync('currentPageText')
    //为了到上一页回显使用
    wx.setStorageSync('remark', data);
    wx.navigateBack({
      delta: 1
    });
  }
})