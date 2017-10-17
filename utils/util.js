const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
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

module.exports = {
  formatTime: formatTime,
  touchMove: touchMove
}
