#import "CDVMoPub.h"
#import <Cordova/CDVPlugin.h>
#import "MoPub.h"

@implementation CDVMoPub

- (void)isSdkInitialized:(CDVInvokedUrlCommand*)command {

    NSLog(@"MoPub SDK isSdkInitialized: %@", [MoPub sharedInstance].isSdkInitialized ? @"YES" : @"NO");

    CDVPluginResult* pluginResult;

    if ([MoPub sharedInstance].isSdkInitialized) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:true];

    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:false];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)init:(CDVInvokedUrlCommand*)command {

    NSString* AD_UNIT_ID = [command.arguments objectAtIndex:0];

    NSLog(@"MoPub SDK init with adUnit %@", AD_UNIT_ID);

    if (AD_UNIT_ID != nil && [AD_UNIT_ID length] == 32) {

        // MoPub test adUnit
        MPMoPubConfiguration *sdkConfig = [[MPMoPubConfiguration alloc] initWithAdUnitIdForAppInitialization:AD_UNIT_ID];

        sdkConfig.loggingLevel = MPBLogLevelDebug;

        [[MoPub sharedInstance] initializeSdkWithConfiguration:sdkConfig completion:^{

            // Ready to make ad requests.
            NSLog(@"MoPub SDK initialization complete with adUnit %@", AD_UNIT_ID);

            NSString* js;
            js = [NSString stringWithFormat:@"javascript:cordova.fireDocumentEvent('mopub.sdk.isInitialized', { \"adUnitId\": \"%@\" });", AD_UNIT_ID];
            [self.commandDelegate evalJs:js];

            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:AD_UNIT_ID];

            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }];

    } else {

        NSLog(@"MoPub SDK init FAILED for adUnit: %@", AD_UNIT_ID);

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

- (void)loadInterstitial:(CDVInvokedUrlCommand*)command {

    NSString* AD_UNIT_ID = [command.arguments objectAtIndex:0];

    NSLog(@"MoPub SDK loadInterstitial with adUnit %@", AD_UNIT_ID);

    if ([MoPub sharedInstance].isSdkInitialized) {

        NSString* js;
        js = [NSString stringWithFormat:@"javascript:cordova.fireDocumentEvent('mopub.sdk.loadInterstitial', { \"adUnitId\": \"%@\" });", AD_UNIT_ID];
        [self.commandDelegate evalJs:js];

        // Instantiate the interstitial using the class convenience method.
        self.interstitial = [MPInterstitialAdController
            interstitialAdControllerForAdUnitId:AD_UNIT_ID];

        self.interstitial.delegate = self;

        // Fetch the interstitial ad.
        [self.interstitial loadAd];

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:AD_UNIT_ID];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

    } else {

        // The SDK is not initialized
        NSLog(@"MoPub SDK is not initialized");
    
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"MoPub SDK is not initialized"];
    
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

- (void)isInterstitialReady:(CDVInvokedUrlCommand*)command {

    NSLog(@"MoPub SDK isInterstitialReady: %@", self.interstitial.ready ? @"YES" : @"NO");

    CDVPluginResult* pluginResult;

    if (self.interstitial.ready) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:true];

    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:false];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)showInterstitial:(CDVInvokedUrlCommand*)command {

    NSLog(@"MoPub SDK showInterstitial");

    CDVPluginResult *pluginResult;

    if (self.interstitial.ready) {

        NSLog(@"MoPub SDK interstitial is ready");

        [self.interstitial showFromViewController:self.viewController];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        // The interstitial wasn't ready
        NSLog(@"MoPub SDK interstitial is NOT ready");
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"interstitial not ready yet."];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)interstitialDidLoadAd:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialDidLoadAd");

    NSString* js;

    if (self.interstitial && self.interstitial.ready) {

        NSLog(@"MoPub SDK interstitial is ready");

        NSString* AD_UNIT_ID = self.interstitial.adUnitId;

        js = [NSString stringWithFormat:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidLoadAd', { \"adUnitId\": \"%@\" });", AD_UNIT_ID];
        
    } else {
        // The interstitial wasn't ready
        NSLog(@"MoPub SDK interstitial is NOT ready");

        js = [NSString stringWithFormat:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialNotReady');"];
    }

    [self.commandDelegate evalJs:js];
}

- (void)interstitialDidFailToLoadAd:(MPInterstitialAdController *)interstitial
                          withError:(NSError *)error {

    NSLog(@"MoPub SDK interstitialDidFailToLoadAd: %@", [error localizedDescription]);

    js = [NSString stringWithFormat:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidLoadAd', { \"error\": \"%@\" });", [error localizedDescription]];
    [self.commandDelegate evalJs:js];
}

/*
- (void)interstitialWillAppear:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialWillAppear");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialWillAppear');"];
}
*/

- (void)interstitialDidAppear:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialDidAppear");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidAppear');"];
}

/*
- (void)interstitialWillDisappear:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialWillDisappear");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialWillDisappear');"];
}
*/

- (void)interstitialDidDisappear:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialDidDisappear");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidDisappear');"];
}

- (void)interstitialDidExpire:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialDidExpire");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidExpire');"];
}

- (void)interstitialDidReceiveTapEvent:(MPInterstitialAdController *)interstitial {

    NSLog(@"MoPub SDK interstitialDidReceiveTapEvent");
    [self.commandDelegate evalJs:@"javascript:cordova.fireDocumentEvent('mopub.sdk.interstitialDidReceiveTapEvent');"];
}

@end
