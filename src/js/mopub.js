var exec = require('cordova/exec');

const mopub = {
  _debug: false,
  get debug() {
    return this._debug
  },
  set debug(value) {

    if (![true, false].includes(value))
      throw 'error'

    this._debug = value

    if (value)
      Object.keys(this.eventListeners).forEach((event) => {
        document.addEventListener('mopub.sdk.' + event, this.eventListeners[event])
        this.attachedEventListeners[event] = true
      })
    else
      Object.keys(this.attachedEventListeners).forEach((event) => {

        if (   this.attachedEventListeners[event]
            && (     event != 'interstitialDidLoadAd'
                || ( event == 'interstitialDidLoadAd' && !this.autoShow )
               )
           ) {
          document.removeEventListener('mopub.sdk.' + event, this.eventListeners[event])
          this.attachedEventListeners[event] = false
        }
      })
  },
  _autoShow: false,
  get autoShow() {
    return this._autoShow
  },
  set autoShow(value) {

    if (![true, false].includes(value))
      throw 'error'

    this._autoShow = value

    if (value) {
      document.addEventListener('mopub.sdk.interstitialDidLoadAd', this.eventListeners.interstitialDidLoadAd)
      this.attachedEventListeners[event] = true
    }
    else if (!this.debug) {
      document.removeEventListener('mopub.sdk.interstitialDidLoadAd', this.eventListeners.interstitialDidLoadAd)
      this.attachedEventListeners[event] = false
    }
  },
  attachedEventListeners: { 'isInitialized': false, 'loadInterstitial': false, 'interstitialNotReady': false, 'interstitialDidLoadAd': false, 'interstitialDidFailToLoadAd': false, 'interstitialWillAppear': false, 'interstitialDidAppear': false, 'interstitialDidReceiveTapEvent': false, 'interstitialWillDisappear': false, 'interstitialDidDisappear': false, 'interstitialDidExpire': false },
  eventListeners: {},

  isSdkInitialized: function() {
    return new Promise((resolve, reject) => {
      exec(resolve, reject, 'mopub', 'isSdkInitialized', [])
    })    
  },

  init: function(adUnitId) {
    return new Promise((resolve, reject) => {
      exec(resolve, reject, 'mopub', 'init', [adUnitId])
    })    
  },

  loadInterstitial: function(adUnitId) {

    return new Promise(async (resolve, reject) => {

      var isSdkInitialized = await mopub.isSdkInitialized()

      if (!isSdkInitialized) 
        await mopub.init(adUnitId)

      exec(resolve, reject, 'mopub', 'loadInterstitial', [adUnitId])
    })
  },

  loadInterstitial_Old: function(adUnitId, autoShow) {

    return new Promise(async (resolve, reject) => {

      var isSdkInitialized = await mopub.isSdkInitialized()

      if (!isSdkInitialized) 
        await mopub.init(adUnitId)

      exec(
        () => {
          if (autoShow)
            document.addEventListener('mopub.sdk.interstitialDidLoadAd', (evt) => {
              console.log('---->', evt.type);
              mopub.showInterstitial(resolve, reject)
            }, {once: autoShow})
          else
            resolve
        },
        reject, 'mopub', 'loadInterstitial', [adUnitId])
    })
  },

  isInterstitialReady: function () {
    return new Promise(async (resolve, reject) => {
      exec(resolve, reject, 'mopub', 'isInterstitialReady', [])
    })
  },

  showInterstitial: function () {
    return new Promise(async (resolve, reject) => {
      exec(resolve, reject, 'mopub', 'showInterstitial', [])
    })
  },

}

mopub.eventListeners = Object.keys(mopub.attachedEventListeners).reduce((prev, event) => {
  if (event == 'interstitialDidLoadAd')
    prev[event] = (evt) => { console.log(evt.type); mopub.autoShow && mopub.showInterstitial() }
  else
    prev[event] = (evt) => { console.log(evt.type) }      
  return prev
}, {})

module.exports = mopub 


/*

## Availaible events : 

mopub.sdk.isInitialized
mopub.sdk.interstitialDidLoadAd
mopub.sdk.interstitialNotReady
mopub.sdk.interstitialDidFailToLoadAd
mopub.sdk.interstitialWillAppear
mopub.sdk.interstitialDidAppear
mopub.sdk.interstitialWillDisappear
mopub.sdk.interstitialDidDisappear
mopub.sdk.interstitialDidExpire
mopub.sdk.interstitialDidReceiveTapEvent

## Example

### 1 

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

document.addEventListener('mopub.sdk.interstitialDidLoadAd', (evt) => {
  console.log('---->', evt.type, evt.mopub);
  mopub.showInterstitial('1', console.log, console.error)
});

mopub.init(adUnit, (msg) => {
	mopub.loadInterstitial(adUnit, console.log, console.error)
}, console.error);

### 2

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

mopub.init(adUnit, (msg) => {
	mopub.loadInterstitial(adUnit, console.log, console.error)
}, console.error);

### 3 

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

mopub.init(adUnit, console.log, console.error)
mopub.loadInterstitial(adUnit, console.log, console.error)
mopub.isInterstitialReady(console.log, console.error)
mopub.showInterstitial(console.log, console.error)

### 4 

document.addEventListener('mopub.sdk.interstitialDidLoadAd', (evt) => {
  console.log('---->', evt.type, evt.adUnitId);
  mopub.showInterstitial(console.log, console.error)
});

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

mopub.loadInterstitial(adUnit, console.log, console.error)


### 5 

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

function showWhenReady() {

  setTimeout(async () => {

    var isReady = await mopub.isInterstitialReady()

    if (isReady)
      mopub.showInterstitial(console.log, console.error)
    else
      showWhenReady()
  }, 1000)
}

await mopub.loadInterstitialP(adUnit)

showWhenReady()

### 6 

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

document.addEventListener('mopub.sdk.interstitialDidLoadAd', (evt) => {
  console.log('---->', evt.type, evt.adUnitId)
});

await mopub.loadInterstitialP2(adUnit, true)

---

var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

document.addEventListener('mopub.sdk.interstitialDidLoadAd', (evt) => {
  console.log('NEW ---->', evt.type, evt.adUnitId, evt);
  mopub.showInterstitial(console.log, console.error)
});

await mopub.loadInterstitialP2(adUnit, true)

*/