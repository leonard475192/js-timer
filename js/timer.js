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
    this.setBtnSwitch()
  }

  get reset() {
    return this.countDownResetConfirm
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

  countDownStop() {
    this.setBtnSwitch(false)
    clearInterval(this.timer)
  }


  countDown() {
    this.remainingMs -= this.intervalMs
    if (this.remainingMs >= this.intervalMs) {
      this.setTargetDom()
    } else {
      this.countDownFinish()
    }
  }

  setTargetDom() {
    // calc datetime
    let currentDay = divMod(this.remainingMs, 24*60*60*1000)
    let currentHour= divMod(currentDay['remaining'], 60*60*1000)
    let currentMinute = divMod(currentHour['remaining'], 60*1000)
    let currentSecond = divMod(currentMinute['remaining'], 1000)

    // paddingZero

    this.targetDom.textContent
      = setUnit(currentDay['val'], "day", false)
      + setUnit(currentHour['val'], "hour")
      + setUnit(currentMinute['val'], "minute")
      + setUnit(currentSecond['val'], "second")

    // FIXME 適切な場所がわからなかった
    // 上と計算がダブルが可読性のため、このようにした
    document.title
      = toStr(currentDay['val'], " ", false)
      + toStr(currentHour['val'], ":")
      + toStr(currentMinute['val'], ":")
      + toStr(currentSecond['val'], "")
  }

  countDownFinish() {
    this.targetDom.textContent = this.finishMsg
    document.title = this.finishMsg
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

  setBtnSwitch(inProcessFlag = false) {
    const __this__ = this
    if (inProcessFlag) {
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

  countDownResetConfirm() {
    if (this.remainingMs === this.settingMs) {
      alert("すでにリセット済みです。")
    } else if (this.remainingMs < this.intervalMs) {
      this.countDownReset()
    } else {
      // TODO モーダル化 timerが止まってしまうため
      // デザインが思いつかない
      const resetConfirm = confirm("本当に、タイマーをリセットしてもよろしいですか？")
      if (resetConfirm) {
        this.countDownReset()
      }
    }
  }

  countDownReset() {
    this.setBtnSwitch(false)
    clearInterval(this.timer)
    this.remainingMs = this.settingMs
    this.setTargetDom()
  }
}

function divMod(numerator, denominator) {
  return {
    val: Math.floor(numerator / denominator),
    remaining: numerator % denominator
  }
}

function paddingZero(num, len = 2) {
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

function toStr(num, unit, paddingZeroFlag = true) {
  if (paddingZeroFlag) {
    return paddingZero(num) + unit
  } else {
    return (num === 0 ? '' : num.toString() + unit)
  }
}