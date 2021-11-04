class CountDownTimer {
  constructor(settingMs, targetDom, btnSwitch, settingMsForm, soundDom) {
    this.settingMs = settingMs
    this.remainingMs = settingMs

    this.targetDom = targetDom
    this.btnSwitchDom = btnSwitch

    this.finishMsg = "Time Over!"

    this.intervalMs = 1000
    this.timer = null

    this.formInit(settingMsForm)
    this.soundInit(soundDom)
    this.setTargetDom()
    this.setBtnSwitch("start")
  }

  get reset() {
    return this.countDownResetConfirm
  }

  get newStart() {
    return this.newStart
  }

  formInit(settingMsForm) {
    this.settingMsForm = settingMsForm
    let remainingDateTime = this.calcMsToDateTime()
    this.settingMsForm.value
      = toStr(remainingDateTime['d']*24 + remainingDateTime['h'], ":")
      + toStr(remainingDateTime['m'], ":")
      + toStr(remainingDateTime['s'], "")
  }

  soundInit(soundDom) {
    this.soundDom = soundDom
    this.soundCtx = new AudioContext();
    this.soundTrack = this.soundCtx.createMediaElementSource(this.soundDom);
  }

  countDownStart() {
    // https://madogiwa0124.hatenablog.com/entry/2021/01/31/160447
    this.timer = setInterval(this.countDown.bind(this), this.intervalMs)
    this.setBtnSwitch("stop")
  }

  countDownStop() {
    this.setBtnSwitch("start")
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
    let remainingDateTime = this.calcMsToDateTime()

    this.targetDom.textContent
      = setUnit(remainingDateTime['d'], "day", false)
      + setUnit(remainingDateTime['h'], "hour")
      + setUnit(remainingDateTime['m'], "minute")
      + setUnit(remainingDateTime['s'], "second")

    // FIXME 適切な場所がわからなかった
    // 上と計算がダブルが可読性のため、このようにした
    document.title
      = toStr(remainingDateTime['d'], " ", false)
      + toStr(remainingDateTime['h'], ":")
      + toStr(remainingDateTime['m'], ":")
      + toStr(remainingDateTime['s'], "")
  }

  calcMsToDateTime() {
    let currentDay = divMod(this.remainingMs, 24*60*60*1000)
    let currentHour= divMod(currentDay['remaining'], 60*60*1000)
    let currentMinute = divMod(currentHour['remaining'], 60*1000)
    let currentSecond = divMod(currentMinute['remaining'], 1000)

    return {
      d: currentDay['val'],
      h: currentHour['val'],
      m: currentMinute['val'],
      s: currentSecond['val'],
    }
  }

  countDownFinish() {
    this.targetDom.textContent = this.finishMsg
    document.title = this.finishMsg
    this.setBtnSwitch("restart")
    this.soundPlay()
    clearInterval(this.timer)
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

  setBtnSwitch(status) {
    const __this__ = this
    if (status == "stop") {
      this.setBtnSwitchStyle(status)
      this.btnSwitchDom.onclick = function() {
        __this__.countDownStop()
      }
    } else if (status == "start") {
      this.setBtnSwitchStyle(status)
      this.btnSwitchDom.onclick = function() {
        __this__.countDownStart()
      }
    } else if (status == "restart") {
      this.setBtnSwitchStyle(status)
      this.btnSwitchDom.onclick = function() {
        __this__.countDownReset()
        __this__.countDownStart()
      }
    } else {
      console.error("setBtnSwitch: invalid argument")
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
      // TODO stop時に、モーダル出さない
      const resetConfirm = confirm("本当に、タイマーをリセットしてもよろしいですか？")
      if (resetConfirm) {
        this.countDownReset()
      }
    }
  }

  countDownReset() {
    this.setBtnSwitch("start")
    clearInterval(this.timer)
    this.remainingMs = this.settingMs
    this.setTargetDom()
  }

  newStart() {
    if (this.settingMsForm.value == "") {
      alert("ハイフンでなく、0で入力してください。")
    } else if (this.settingMsForm.value == "00:00" || this.settingMsForm.value == "00:00:00") {
      alert("0秒よりも大きな値をせっていしてください。")
    } else {
      this.setSettingMs()
      // FIXME どこに配置するか
      document.getElementById("modalInputTime").style.display = "none";
      this.countDownReset()
      this.countDownStart()
    }
  }

  setSettingMs() {
    let [h, m, s] = (this.settingMsForm.value).split(':').map(Number)
    if (s === undefined) s = 0 // input type=timeの使用の問題
    this.settingMs = s*1000 + m*1000*60 + h*1000*60*60
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