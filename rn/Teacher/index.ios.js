/**
 * Teacher
 * https://github.com/instructure/ios/rn/Teacher
 * @flow
 */

import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native'
import { Navigation } from 'react-native-navigation'
import store from './src/redux/store'
import i18n from 'format-message'
import setupI18n from './i18n/setup'
import { setSession } from './src/api/session'
import { registerScreens } from './src/modules/registerScreens'

registerScreens(store)

const nativeLogin = NativeModules.NativeLogin
nativeLogin.startObserving()

const navigationStyles = {
  navBarBackgroundColor: '#394b58',
  navBarTextColor: '#fff',
  navBarButtonColor: '#fff',
}

setupI18n(NativeModules.SettingsManager.settings.AppleLocale)

const emitter = new NativeEventEmitter(nativeLogin)
emitter.addListener('Login', (info: { authToken: string, baseURL: string }) => {
  if (info.authToken) {
    setSession(info)
    Navigation.startTabBasedApp({
      tabs: [
        {
          label: i18n({
            default: 'Courses',
            description: 'Label indicating the user is on the courses tab',
          }),
          screen: 'teacher.CourseList',
          title: i18n('Courses'),
          titleImage: require('./src/images/canvas-logo.png'),
          navigatorStyle: navigationStyles,
        },
        {
          label: i18n({
            default: 'Inbox',
            description: 'Label indicating the user is on the inbox tab',
          }),
          screen: 'teacher.Inbox',
          navigatorStyle: navigationStyles,
          title: i18n('Inbox'),
        },
        {
          label: i18n({
            default: 'Profile',
            description: 'Label indicating the user is on the profile tab',
          }),
          screen: 'teacher.Profile',
          navigatorStyle: navigationStyles,
          title: i18n('Profile'),
        },
      ],
    })
  } else {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'teacher.DefaultState',
        title: i18n('You Should Login'),
      },
    })
  }
})
