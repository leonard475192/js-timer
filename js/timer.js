class CountDownTimer {
  constructor(settingMs, targetDom, btnSwitch, soundDom) {
    this.settingMs = settingMs
    this.remainingMs = settingMs

    this.targetDom = targetDom
    this.btnSwitchDom = btnSwitch

    this.finishMsg = "Time Over!"

    this.intervalMs = 1000
    this.timer = null

    this.soundInit(soundDom)
    this.setTargetDom()
    this.setBtnSwitch(this.timer)
  }

  get reset() {
    return this.countDownReset
  }

  soundInit(soundDom) {
    this.soundDom = soundDom
    this.soundCtx = new AudioContext();
    this.soundTrack = this.soundCtx.createMediaElementSource(this.soundDom);
  }

  countDownStart() {
    // https://madogiwa0124.hatenablog.com/entry/2021/01/31/160447
    this.timer = setInterval(this.countDown.bind(this), this.intervalMs)
    this.setBtnSwitch(true)
  }

  countDown() {
    if (this.remainingMs > this.intervalMs) {
      this.remainingMs -= this.intervalMs
      this.setTargetDom()
    } else {
      this.countDownFinish()
    }
  }

  setTargetDom() {
    let currentDay = divMod(this.remainingMs, 24*60*60*1000)
    let currentHour= divMod(currentDay['remaining'], 60*60*1000)
    let currentMinute = divMod(currentHour['remaining'], 60*1000)
    let currentSecond = divMod(currentMinute['remaining'], 1000)

    this.targetDom.textContent
      = setUnit(currentDay['val'], "day", false)
      + setUnit(currentHour['val'], "hour")
      + setUnit(currentMinute['val'], "minute")
      + setUnit(currentSecond['val'], "second")
  }

  countDownFinish() {
    this.targetDom.textContent = this.finishMsg
    this.soundPlay()
    clearInterval(this.timer)
    // TODO restart & stop&reset
  }

  soundPlay() {
    if(this.soundCtx.state === "suspended") {
      this.soundCtx.resume()
    }
    this.soundTrack.connect(this.soundCtx.destination)
    var promise = this.soundDom.play()
    if (promise !== undefined) {
        promise.then(_ => {
            // Autoplay started!
        }).catch(error => {
            console.error(error)
        })
    }
  }

  countDownStop() {
    this.setBtnSwitch(false)
    clearInterval(this.timer)
  }

  setBtnSwitch(startFlag) {
    const __this__ = this
    if (startFlag) {
      this.setBtnSwitchStyle("stop")
      this.btnSwitchDom.onclick = function() {
        __this__.countDownStop()
      }
    } else {
      this.setBtnSwitchStyle("start")
      this.btnSwitchDom.onclick = function() {
        __this__.countDownStart()
      }
    }
  }

  setBtnSwitchStyle(val) {
    this.btnSwitchDom.textContent = val
    this.btnSwitchDom.className = "btn " + val
  }

  countDownReset() {
    // TODO モーダル化
    // TODO 止まっているとき、モーダルなくす
    const resetConfirm = confirm("本当に、タイマーをリセットしてもよろしいですか？")
    if (resetConfirm) {
      this.setBtnSwitch(false)
      clearInterval(this.timer)
      this.remainingMs = this.settingMs
      this.setTargetDom()
    }
  }
}

function divMod(numerator, denominator) {
  return {
    val: Math.floor(numerator / denominator),
    remaining: numerator % denominator
  }
}

function paddingZero(num, len = 2)　{
	return ( Array(len).join('0') + num ).slice( -len );
}

function setUnit(num, unit, paddingZeroFlag = true) {
  let numStr
  if (paddingZeroFlag) {
    numStr = paddingZero(num)
  } else {
    numStr = num.toString()
  }

  switch (num) {
    case 0:
      return ''
    case 1:
      return numStr + unit + ' '
    default:
      return numStr + unit + 's '
  }
}