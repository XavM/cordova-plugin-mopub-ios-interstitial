#import <Cordova/CDVPlugin.h>
#import "MPInterstitialAdController.h"

@interface CDVMoPub : CDVPlugin <MPInterstitialAdControllerDelegate>

@property (nonatomic, retain) MPInterstitialAdController *interstitial;


- (void)isSdkInitialized:(CDVInvokedUrlCommand*)command;

- (void)init:(CDVInvokedUrlCommand*)command;

/* WIP: Consent
- (void)showConsentDialog:(CDVInvokedUrlCommand*)command;
*/

- (void)loadInterstitial:(CDVInvokedUrlCommand*)command;

- (void)isInterstitialReady:(CDVInvokedUrlCommand*)command;

- (void)showInterstitial:(CDVInvokedUrlCommand*)command;

@end

