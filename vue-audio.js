const baseVolumeValue = 7.5
let audio, uuid

const prefixCls = 'vue-sound'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) {
    let v, r
    r = Math.random() * 16 | 0; v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const convertTimeHHMMSS = (val) => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return (hhmmss.indexOf('00:') === 0) ? hhmmss.substr(3) : hhmmss
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
    duration: function () {
      return this.audio ? convertTimeHHMMSS(this.totalDuration) : ''
    },
    playerId: function () {
      return 'player-' + this.uuid
    },
    classes: function () {
      return prefixCls
    }
  },
  data () {
    return {
      isMuted: false,
      loaded: false,
      playing: false,
      paused: true,
      progressStyle: '',
      currentTime: '00:00',
      uuid: '0',
      innerLoop: undefined,
      audio: undefined,
      totalDuration: 0,
      hideVolumeSlider: false,
      volumeValue: baseVolumeValue
    }
  },
  methods: {
    setPosition: function name (e) {
      let tag = e.target
      if (this.paused) return

      if (e.target.tagName === 'SPAN') {
        return
      }
      const pos = tag.getBoundingClientRect()
      const seekPos = (e.clientX - pos.left) / pos.width
      this.audio.currentTime = parseInt(this.audio.duration * seekPos)
    },
    updateVolume: function () {
      this.hideVolumeSlider = false
      this.audio.volume = this.volumeValue / 100
      if (this.volumeValue / 100 > 0) {
        this.isMuted = this.audio.muted = false
      }

      if (this.volumeValue / 100 === 0) {
        this.isMuted = this.audio.muted = true
      }
    },
    toggleVolume: function () {
      this.hideVolumeSlider = true
    },
    stop: function () {
      this.playing = false
      this.paused = true
      this.audio.pause()
      this.audio.currentTime = 0
    },
    play: function () {
      if (this.playing && !this.paused) return
      this.paused = false
      this.audio.play()
      this.playing = true
    },
    pause: function () {
      this.paused = !this.paused;
      (this.paused) ? this.audio.pause() : this.audio.play()
    },
    changeLoop: function () {
      this.innerLoop = !this.innerLoop
    },
    download: function () {
      this.stop()
      window.open(this.file, 'download')
    },
    mute: function () {
      this.isMuted = !this.isMuted
      this.audio.muted = this.isMuted
      this.volumeValue = this.isMuted ? 0 : 75
    },
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

        this.loaded = true
        this.totalDuration = parseInt(this.audio.duration)
        this.goToStartTime()

      } else {
        throw new Error('Failed to load sound file')
      }
    },
    _handlePlayingUI: function (e) {
      let currTime = parseInt(this.audio.currentTime)
      let percentage = parseInt((currTime / this.totalDuration) * 100)
      this.progressStyle = `width:${percentage}%;`
      this.currentTime = convertTimeHHMMSS(currTime)
    },
    _handlePlayPause: function (e) {
      if (e.type === 'pause' && this.playing === false) {
        this.progressStyle = `width:0%;`
        this.currentTime = '00:00'
        this.paused = true
      }
    },
    init: function () {
      this.audio.addEventListener('timeupdate', this._handlePlayingUI)
      this.audio.addEventListener('loadeddata', this._handleLoaded)
      this.audio.addEventListener('pause', this._handlePlayPause)
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
    this.audio.removeEventListener('timeupdate', this._handlePlayingUI)
    this.audio.removeEventListener('loadeddata', this._handleLoaded)
    this.audio.removeEventListener('pause', this._handlePlayPause)
    this.audio.removeEventListener('play', this._handlePlayPause)
    this.audio.removeEventListener('ended', this.goToStartTime)
  },
  template: '<div :class="`${classes}-wrapper`">' +
    // '<div :class="`${classes}__player`">' +
    //   '<a @click="stop()" title="Stop" class="icon-stop2" ></a>' +
    //   `<a @click="pause()" title="Play" :class="[ paused ? 'icon-play3' : 'icon-pause2' ]"></a>` +
    //   '<div v-on:click="setPosition" :class="`${classes}__playback-time-wrapper`" title="Time played : Total time">' +
    //       '<div v-bind:style="progressStyle" :class="`${classes}__playback-time-indicator`"></div>' +
    //       '<span :class="`${classes}__playback-time-current`">{{currentTime}}</span>' +
    //       '<span :class="`${classes}__playback-time-separator`"></span>' +
    //       '<span :class="`${classes}__playback-time-total`">{{duration}}</span>' +
    //   '</div>' +
    //   '<div :class="`${classes}__extern-wrapper`">' +
    //     '<a @click="download()" class="icon-download"></a>' +
    //     `<a @click="changeLoop()" :class="[ innerLoop ? 'icon-spinner10' : 'icon-spinner11']"></a>` +
    //     `<a @click="mute()" :class="[isMuted ? 'icon-volume-mute2': 'icon-volume-high' ]" title="Mute"></a>` +
    //     '<a v-on:mouseover="toggleVolume()" class="volume-toggle icon-paragraph-justify" title="Volume">' +
    //       '<input orient="vertical" v-model.lazy="volumeValue" v-on:change="updateVolume()" v-show="hideVolumeSlider" type="range" min="0" max="100" class="volume-slider"/>' +
    //     '</a>' +
    //   '</div>' +
    // '</div>' +
    '<audio controls v-bind:id="playerId" :loop="innerLoop" ref="audiofile" :src="file" preload="auto" ></audio>' +
    '<button @click="goToStartTime()" v-show="startTime">Go to start of segment</button>' +
  '</div>'
});
