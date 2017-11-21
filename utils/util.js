const { appid, template_id, secret } = getApp().globalData;

const formatDate = (currentDate) => {
  let year = currentDate.getFullYear(), month = currentDate.getMonth() + 1, date = currentDate.getDate();
  month = month >= 10 ? month : '0' + month;
  date = date >= 10 ? date : '0' + date;
  return year + '-' + month + '-' + date;
}

const getNonceStr = () => {
  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = chars.length;
  var pwd = '';
  for (var i = 0; i < 32; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

const getTimeStamp = () => {
  return parseInt(new Date().getTime() / 1000).toString();
}

const calculateAngle = function (start, end) {
  var _X = end.X - start.X,
    _Y = end.Y - start.Y
  //返回角度 /Math.atan()返回数字的反正切值
  return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
 }

const touchMove = (start, touchMove) => {
  let angle = calculateAngle(start, touchMove);
  if (Math.abs(angle) > 30) {
    return false;
  }
  if (touchMove.X > start.X) {
    return 'right';
  } else {
    return 'left';
  }
}

let api = {};

api.requestPayment = (timeStamp, nonceStr, packages, paySign) => {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packages,
      signType: 'MD5',
      paySign: paySign,
      success() {
        let data = {};
        data.prepay_id = packages.substring(10);
        data.appId = appid;
        data.secret = secret;
        data.template_id = template_id;
        resolve(data);
      },
      fail(e) { resolve(false); }
    });
  });
}


api.request = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${url}`,
      data: JSON.stringify(data),
      method: 'POST',
      success({ data, statusCode }) {
        if (statusCode >= 200 && statusCode < 300 && data && data.state === 'success') {
          resolve(data.data);
        } else {
          reject(data.msg);
        }
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

function uploadSingleFile(url, filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${url}`,
      filePath: filePath,
      name: 'default',
      success({ data }) {
        let result = JSON.parse(data);
        if (result.state === "success") {
          resolve(result.data);
        }
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

api.uploadFile = (url, filePathList) => {
  return new Promise((resolve, reject) => {
    let filePathContainer = [], index = 0;
    uploadSingleFile(url, filePathList[index]).then(({ img }) => {
      filePathContainer.push(img);
      index++;
      if (index === filePathList.length) {
        resolve(filePathContainer);
      } else {
        return uploadSingleFile(url, filePathList[index]);
      }
    }).then(({ img }) => {
      filePathContainer.push(img);
      index++;
      if (index === filePathList.length) {
        resolve(filePathContainer);
      } else {
        return uploadSingleFile(url, filePathList[index]);
      }
    }).then(({ img }) => {
      filePathContainer.push(img);
      index++;
      if (index === filePathList.length) {
        resolve(filePathContainer);
      } else {
        return uploadSingleFile(url, filePathList[index]);
      }
    }).catch((e) => { console.log(e); });
  });
}

api.chooseImage = (sourceType = ['album', 'camera'], count = 9) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      sourceType: sourceType,
      count: count,
      success: function (res) {
        resolve(res);
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

api.scanCode = () => {
  return new Promise((resolve, reject) => {
    wx.scanCode({
      success({ result }) { resolve(result); },
      fail(e) { reject(e); }
    });
  });
}

api.chooseLocation = () => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success(result) { resolve(result); },
      fail(e) { reject(e); }
    });
  });
}

api.modal = (title, showCancel = true, cancelText = '取消', confirmText = '确定') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: '',
      showCancel: showCancel,
      cancelText: cancelText,
      confirmText: confirmText,
      success({ confirm }) {
        resolve(confirm);
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

api.successModal = (title) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      icon: 'success',
      mask: true,
      success() {
        return resolve();
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

api.loadingModal = (title) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      icon: 'loading',
      mask: true,
      success() {
        return resolve();
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

api.showLoading = title => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: title,
      mask: true,
      success() {
        resolve();
      },
      fail(e) {
        reject(e);
      }
    });
  });

}

module.exports = {
  api: api,
  touchMove: touchMove,
  getTimeStamp: getTimeStamp,
  getNonceStr: getNonceStr,
  formatDate: formatDate
}
