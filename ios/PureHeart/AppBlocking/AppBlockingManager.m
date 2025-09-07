#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "PureHeart-Swift.h"

@interface AppBlockingManagerBridge : NSObject <RCTBridgeModule>
@end

@implementation AppBlockingManagerBridge

RCT_EXPORT_MODULE(AppBlockingManagerBridge)

RCT_EXPORT_METHOD(showFamilyActivityPicker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  AppBlockingManager *manager = [[AppBlockingManager alloc] init];
  [manager showFamilyActivityPicker:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getBlockedApps:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  AppBlockingManager *manager = [[AppBlockingManager alloc] init];
  [manager getBlockedApps:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(clearAllBlockedApps:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  AppBlockingManager *manager = [[AppBlockingManager alloc] init];
  [manager clearAllBlockedApps:resolve rejecter:reject];
}

@end
