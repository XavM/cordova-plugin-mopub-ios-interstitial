var exec = require('cordova/exec');

function Mopub(){

  var _debug = false,
      _autoShow = false 

  var obj = {

    get debug() {
      return _debug
    },
    set debug(value) {

      if (![true, false].includes(value))
        throw 'error'

      _debug = value

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
    get autoShow() {
      return _autoShow
    },
    set autoShow(value) {

      if (![true, false].includes(value))
        throw 'error'

      _autoShow = value

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

    isInterstitialReady: function () {
      return new Promise(async (resolve, reject) => {
        exec(resolve, reject, 'mopub', 'isInterstitialReady', [])
      })
    },

    showInterstitial: function () {
      return new Promise(async (resolve, reject) => {
        exec(resolve, reject, 'mopub', 'showInterstitial', [])
      })
    }
  }

  return obj
}

var mopub = new Mopub();

mopub.eventListeners = Object.keys(mopub.attachedEventListeners).reduce((prev, event) => {
  if (event == 'interstitialDidLoadAd')
    prev[event] = (evt) => { console.log(evt.type); mopub.autoShow && mopub.showInterstitial() }
  else
    prev[event] = (evt) => { console.log(evt.type) }      
  return prev
}, {})

module.exports = mopub 
