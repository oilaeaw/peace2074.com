import { NativeScriptConfig } from '@nativescript/core'

export default {
  id: 'com.peace2074.app',
  projectName: 'peace2074mobile',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
} as NativeScriptConfig
