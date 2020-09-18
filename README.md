# cordova-plugin-mopub-ios-interstitial

WIP: Easy to use Cordova MoPub plugin for iOS (interstitial only).

## How to use Examples

### All steps (in order)

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	await mopub.isSdkInitialized()
	await mopub.init(adUnit)
	await mopub.loadInterstitial(adUnit)
	await mopub.isInterstitialReady()
	await mopub.showInterstitial()

### Auto init SDK when loading interstitial 

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	await mopub.loadInterstitial(adUnit)
	await mopub.isInterstitialReady()
	await mopub.showInterstitial()

### Show interstitial when ready using eventListener

	document.addEventListener('mopub.sdk.interstitialDidLoadAd', async (evt) => {
	  console.log(evt.type, evt.adUnitId)
	  await mopub.showInterstitial()
	})

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	mopub.autoShow = false

	await mopub.loadInterstitial(adUnit)

### Auto show interstitial when ready

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	mopub.autoShow = true

	await mopub.loadInterstitial(adUnit)

	// Turn off autoShow
	mopub.autoShow = false

### Show interstitial when ready using await mopub.isInterstitialReady()

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	mopub.autoShow = false

	function showWhenReady() {

	  setTimeout(async () => {

	    var isReady = await mopub.isInterstitialReady()

	    if (isReady)
	      await mopub.showInterstitial()
	    else
	      showWhenReady()
	  }, 1000)
	}

	showWhenReady()

	await mopub.loadInterstitial(adUnit)

### Show debug message at every step (DevTools console only)

	var adUnit = '4f117153f5c24fa6a3a92b818a5eb630'

	mopub.autoShow = true
	mopub.debug = true

	// List all attached event listeners using the Developer tools console:
	// getEventListeners(document)

	await mopub.loadInterstitial(adUnit)

	// Turn off debug messages
	mopub.autoShow = true

## Availaible events you can attach to : 

	mopub.sdk.isInitialized
	mopub.sdk.loadInterstitial
	mopub.sdk.interstitialDidFailToLoadAd
	mopub.sdk.interstitialNotReady
	mopub.sdk.interstitialDidLoadAd
	mopub.sdk.interstitialDidExpire
	mopub.sdk.interstitialWillAppear
	mopub.sdk.interstitialDidAppear
	mopub.sdk.interstitialDidReceiveTapEvent
	mopub.sdk.interstitialWillDisappear
	mopub.sdk.interstitialDidDisappear
