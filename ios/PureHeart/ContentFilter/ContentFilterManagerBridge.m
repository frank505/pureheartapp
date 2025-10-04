#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "PureHeart-Swift.h"

@interface ContentFilterManagerBridge : NSObject <RCTBridgeModule>
@end

@implementation ContentFilterManagerBridge

RCT_EXPORT_MODULE(ContentFilterManager)

- (ContentFilterManager *)getContentFilterManager {
    return [[ContentFilterManager alloc] init];
}

RCT_EXPORT_METHOD(isFilterEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] isFilterEnabled:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(enableFilter:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] enableFilter:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(disableFilter:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] disableFilter:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(reloadContentBlocker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] reloadContentBlocker:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(addBlockedDomain:(NSString *)domain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] addBlockedDomain:domain resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(removeBlockedDomain:(NSString *)domain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] removeBlockedDomain:domain resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getBlockedDomains:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] getBlockedDomains:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(getDefaultBlockedDomains:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] getDefaultBlockedDomains:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(isDomainBlocked:(NSString *)url
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] isDomainBlocked:url resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(openContentBlockerSettings:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getContentFilterManager] openContentBlockerSettings:resolve rejecter:reject];
}

@end
