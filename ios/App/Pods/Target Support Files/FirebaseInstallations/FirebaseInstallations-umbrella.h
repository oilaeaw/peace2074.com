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

#import <FirebaseInstallations/FirebaseInstallations.h>
#import <FirebaseInstallations/FIRInstallations.h>
#import <FirebaseInstallations/FIRInstallationsAuthTokenResult.h>
#import <FirebaseInstallations/FIRInstallationsErrors.h>

FOUNDATION_EXPORT double FirebaseInstallationsVersionNumber;
FOUNDATION_EXPORT const unsigned char FirebaseInstallationsVersionString[];

