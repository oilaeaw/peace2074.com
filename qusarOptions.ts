// import materialIcons from 'quasar/icon-set/svg-material-icons'
// import materialIconsRound from 'quasar/icon-set/svg-material-icons-round'
// import '@quasar/quasar-ui-qmediaplayer/dist/index.css'

export const QuasarOptions = {
  plugins: [
    'AppFullscreen',
    'Dialog',
    'Loading',
    'LoadingBar',
    'BottomSheet',
    'Notify',
  ],
  importStrategy: 'auto',
  extras: {
    font: 'roboto-font',
    fontIcons: ['material-icons'],
    animations: 'all',
  },
  config: {
    dark: false,
  },
  components: {
    defaults: {
      QBtn: {
        glossy: true,
      },
    },
  },
}

export default QuasarOptions
