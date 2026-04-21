#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import <FirebaseCore/FIRApp.h>
#import <FirebaseCore/FIRConfiguration.h>
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseCore/FIRLoggerLevel.h>
#import <FirebaseCore/FIROptions.h>
#import <FirebaseCore/FIRTimestamp.h>
#import <FirebaseCore/FIRVersion.h>

FOUNDATION_EXPORT double FirebaseCoreVersionNumber;
FOUNDATION_EXPORT const unsigned char FirebaseCoreVersionString[];

