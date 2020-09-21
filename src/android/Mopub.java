package com.xavm.cordova.plugin;

import com.mopub.common.MoPub;
import com.mopub.common.SdkConfiguration;
import com.mopub.common.SdkInitializationListener;
import com.mopub.common.logging.MoPubLog;
import com.mopub.mobileads.MoPubErrorCode;

/* TODO: implement consent
import com.mopub.common.privacy.ConsentData;
import com.mopub.common.privacy.ConsentDialogListener;
import com.mopub.common.privacy.ConsentStatus;
import com.mopub.common.privacy.ConsentStatusChangeListener;
import com.mopub.common.privacy.PersonalInfoManager;
*/

import com.mopub.mobileads.MoPubInterstitial;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;

import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


/**
 * This class represents the native implementation for the MoPub Cordova plugin.
 * This plugin can be used to request MoPub interstitial ads natively via the mopub-android-sdk.
 * The MoPub Android SDK is a dependency for this plugin; See: plugin.gradle.
 */
public class Mopub extends CordovaPlugin {

  private MoPubInterstitial mInterstitial;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
  }

  @Override
  public void onPause(boolean multitasking) {
    MoPub.onPause(cordova.getActivity());
    super.onPause(multitasking);
  }

  @Override
  public void onResume(boolean multitasking) {
    MoPub.onResume(cordova.getActivity());
    super.onResume(multitasking);
  }

  @Override
  public void onStop() {
    MoPub.onStop(cordova.getActivity());
    super.onStop();
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    mInterstitial.destroy();
  }

  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    if (action.equals("init")) {

      String AD_UNIT_ID = args.getString(0);

      if (AD_UNIT_ID != null && AD_UNIT_ID.length() == 32) {

        cordova.getActivity().runOnUiThread(new Runnable() {
          public void run() {

            SdkConfiguration sdkConfiguration = new SdkConfiguration.Builder(AD_UNIT_ID)
                    .withLogLevel(MoPubLog.LogLevel.DEBUG)
                    .withLegitimateInterestAllowed(false)
                    .build();

            MoPub.initializeSdk(cordova.getActivity(), sdkConfiguration, new SdkInitializationListener() {
              @Override
              public void onInitializationFinished() {

                Log.d("MoPub SDK", "initialized");

                JSONObject data = new JSONObject();
                try {
                  data.put("adUnitId",  AD_UNIT_ID);
                } catch (JSONException e) {
                  e.printStackTrace();
                }
                fireAdEvent("mopub.sdk.isInitialized", data);

                callbackContext.success(AD_UNIT_ID);
              }
            });
          }
        });

        return true;

      }
      else {

        callbackContext.error("Expected a 32 chars length string argument.");
        return false;
      }
    }

    else if (action.equals("isSdkInitialized")) {
      Log.d("MoPub SDK", "isSdkInitialized");
      callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, MoPub.isSdkInitialized()));
      return true;
    }

    else if (action.equals("loadInterstitial")) {

      String AD_UNIT_ID = args.getString(0);

      if (AD_UNIT_ID != null && AD_UNIT_ID.length() == 32) {

        mInterstitial = new MoPubInterstitial(cordova.getActivity(), AD_UNIT_ID);

        mInterstitial.setInterstitialAdListener(new MoPubInterstitial.InterstitialAdListener() {
          @Override
          public void onInterstitialLoaded(MoPubInterstitial interstitial) {
            Log.d("MoPub SDK", "onInterstitialLoaded");
            JSONObject data = new JSONObject();
            try {
              data.put("adUnitId",  mInterstitial.getAdUnitId());
            } catch (JSONException e) {
              e.printStackTrace();
            }
            fireAdEvent("mopub.sdk.interstitialDidLoadAd", data);
          }
          @Override
          public void onInterstitialFailed(MoPubInterstitial interstitial, MoPubErrorCode errorCode) {
            Log.d("MoPub SDK", "onInterstitialFailed");
            fireAdEvent("mopub.sdk.interstitialDidFailToLoadAd");
          }
          @Override
          public void onInterstitialShown(MoPubInterstitial interstitial) {
            Log.d("MoPub SDK", "onInterstitialShown");
            fireAdEvent("mopub.sdk.interstitialDidAppear");
          }
          @Override
          public void onInterstitialClicked(MoPubInterstitial interstitial) {
            Log.d("MoPub SDK", "onInterstitialClicked");
            fireAdEvent("mopub.sdk.interstitialDidReceiveTapEvent");
          }
          @Override
          public void onInterstitialDismissed(MoPubInterstitial interstitial) {
            Log.d("MoPub SDK", "onInterstitialDismissed");
            fireAdEvent("mopub.sdk.interstitialDidDisappear");
          }
        });

        JSONObject data = new JSONObject();
        try {
          data.put("adUnitId",  mInterstitial.getAdUnitId());
        } catch (JSONException e) {
          e.printStackTrace();
        }
        fireAdEvent("mopub.sdk.loadInterstitial", data);

        mInterstitial.load();

        Log.d("MoPub SDK", "interstitialLoad");
        callbackContext.success(AD_UNIT_ID);
        return true;
      }
      else {

        callbackContext.error("Expected a 32 chars length string argument.");
        return false;
      }

    }

    else if (action.equals("isInterstitialReady")) {
      Log.d("MoPub SDK", "isInterstitialReady");
      callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, mInterstitial != null && mInterstitial.isReady()));
      return true;
    }

    else if (action.equals("showInterstitial")) {

      Log.d("MoPub SDK", "showInterstitial");

      if (mInterstitial != null && mInterstitial.isReady()) {
        mInterstitial.show();
        callbackContext.success();
        return true;
      } else {
        callbackContext.error("interstitial not ready yet");
        return false;
      }
    }

    return false;
  }

  private class CordovaEventBuilder {

    private String eventName;
    private String jsonData;

    public CordovaEventBuilder(String eventName) {
      this.eventName = eventName;
    }

    public CordovaEventBuilder withData(String data) {
      this.jsonData = data;
      return this;
    }

    public CordovaEventBuilder withData(JSONObject jsonObj) {
      if (jsonObj == null) {
        return withData("");
      }
      return withData(jsonObj.toString());
    }

    public String build() {
      StringBuilder js = new StringBuilder();
      js.append("javascript:cordova.fireDocumentEvent('");
      js.append(eventName);
      js.append("'");
      if (jsonData != null && !"".equals(jsonData)) {
        js.append(",");
        js.append(jsonData);
      }
      js.append(");");
      return js.toString();
    }
  }

  public void fireAdEvent(String eventName) {
    String js = new CordovaEventBuilder(eventName).build();
    loadJS(js);
  }

  public void fireAdEvent(String eventName, JSONObject data) {
    String js = new CordovaEventBuilder(eventName).withData(data).build();
    loadJS(js);
  }

  private void loadJS(String js) {

    // FIX: A WebView method was called on thread 'JavaBridge'. All WebView methods must be called on the same thread.
    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        webView.loadUrl(js);
      }
    });
  }

}
