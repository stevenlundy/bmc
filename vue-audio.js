let audio, uuid

const prefixCls = 'vue-sound'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) {
    let v, r
    r = Math.random() * 16 | 0; v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

Vue.component("vue-audio", {
  name: 'vue-audio',
  props: {
    file: {
      type: String,
      default: null
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Number,
      default: 0
    }
  },
  computed: {
    playerId: function () {
      return 'player-' + this.uuid
    },
    classes: function () {
      return prefixCls
    }
  },
  data () {
    return {
      uuid: '0',
      innerLoop: undefined,
      audio: undefined,
    }
  },
  methods: {
    goToStartTime: function() {
      if (this.startTime < 0) {
        this.audio.currentTime = this.audio.duration + this.startTime
      } else {
        this.audio.currentTime = this.startTime
      }
    },
    _handleLoaded: function () {
      if (this.audio.readyState >= 2) {
        if (this.autoPlay) this.play()

        this.goToStartTime()

      } else {
        throw new Error('Failed to load sound file')
      }
    },
    init: function () {
      this.audio.addEventListener('loadeddata', this._handleLoaded)
      this.audio.addEventListener('play', this._handlePlayPause)
      this.audio.addEventListener('ended', this.goToStartTime)
    },
    getAudio: function () {
      return this.$el.querySelectorAll('audio')[0]
    }
  },
  mounted: function () {
    this.uuid = generateUUID()
    this.audio = this.getAudio()
    this.innerLoop = this.loop
    this.init()
  },
  beforeDestroy: function () {
    this.audio.removeEventListener('loadeddata', this._handleLoaded)
    this.audio.removeEventListener('play', this._handlePlayPause)
    this.audio.removeEventListener('ended', this.goToStartTime)
  },
  template: '<div :class="`${classes}-wrapper`">' +
    '<audio controls v-bind:id="playerId" :loop="innerLoop" ref="audiofile" :src="file" preload="auto" ></audio>' +
    '<button @click="goToStartTime()" v-show="startTime">Go to start of segment</button>' +
  '</div>'
});
