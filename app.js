App({

  onLaunch({ scene }) {
    let userInfo = {};
    new Promise((resolve, reject) => {
      wx.login({
        success({ code }) {
          wx.request({
            url: '',
            method: 'POST',
            data: JSON.stringify({ code: code, scene: scene.toString() }),
            success({ data }) {
              userInfo.openid = data.openid;
              resolve();
            }, fail() {
              console.log('error');
            }
          });
        }
      });
    }).then(() => {
      // 获取用户信息
      wx.getSetting({
        success: res => {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              let info = res.userInfo;
              userInfo.name = info.nickName;
              userInfo.headUrl = info.avatarUrl;
              wx.setStorageSync('lsb_user', userInfo);
              wx.setStorageSync('authorize', true);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
              wx.request({
                url: '',
                method: 'POST',
                data: JSON.stringify(userInfo),
                success() {
                  return;
                }
              });
            },
            fail() {
              wx.setStorageSync('authorize', false);
              wx.showModal({
                title: '提示',
                content: '您点击了拒绝授权，将无法正常使用部分的功能,是否重新获取授权？',
                success({ confirm }) {
                  if (confirm) {
                    wx.openSetting({
                      complete({ authSetting }) {
                        wx.hideLoading();
                        wx.setStorageSync('authorize', authSetting['scope.userInfo']);
                        if (authSetting['scope.userInfo']) {
                          wx.getUserInfo({
                            success: res => {
                              // 可以将 res 发送给后台解码出 unionId
                              let info = res.userInfo;
                              userInfo.name = info.nickName;
                              userInfo.headUrl = info.avatarUrl;
                              wx.setStorageSync('lsb_user', userInfo);
                              wx.setStorageSync('authorize', true);
                              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                              // 所以此处加入 callback 以防止这种情况
                              if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res);
                              }
                              wx.request({
                                url: '',
                                method: 'POST',
                                data: JSON.stringify(userInfo),
                                success() {
                                  return;
                                }
                              });
                            }
                          })
                        }
                       
                      }
                    });
                  }
                }
              });
            }
          })
        }
      });
    }).catch((e) => { console.log(e); });
  },
  onError(e) {
    console.log(e);
  },

  globalData: {
    shopInfo: '',
    appid: '',
    secret: '',
    payId: '',
    payKey: '',
    template_id: '',
    imageUserBaseUrl: '',
    shopImageUserBaseUrl: ''
  }
})