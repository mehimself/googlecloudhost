<template>
  <div class="logo"
        :class="lightScheme">
    <v-flex
      justify-center
      align-items-center
      class="logoFrame"
      :style="{width: size * 2 + 'em', height: size * 2 + 'em', marginTop: -size / 4 + 'em'}">
      <div class="cube show-top"
           :style="{
            width: size * shadeDelta + 'em',
            height: size * shadeDelta + 'em',
            marginLeft: faceOffset + 'em',
            marginTop: faceOffset + 'em'}">
        <figure class="front shade" :style="faceStyle('front', true)"></figure>
        <figure class="back shade" :style="faceStyle('back', true)"></figure>
        <figure class="right shade" :style="faceStyle('right', true)"></figure>
        <figure class="left shade" :style="faceStyle('left', true)"></figure>
        <figure class="top shade" :style="faceStyle('top', true)"></figure>
        <figure class="bottom shade" :style="faceStyle('bottom', true)"></figure>
      </div>
      <div class="cube show-top"
           :style="{width: size + 'em', height: size + 'em', marginLeft: size / 2 + 'em', marginTop: size / 2 + 'em'}">
        <figure class="front face" :style="faceStyle('front')"></figure>
        <figure class="back face" :style="faceStyle('back')"></figure>
        <figure class="right face" :style="faceStyle('right')"></figure>
        <figure class="left face" :style="faceStyle('left')"></figure>
        <figure class="top face" :style="faceStyle('top')"></figure>
        <figure class="bottom face" :style="faceStyle('bottom')"></figure>
      </div>
    </v-flex>
    <svg class="defs-only">
      <filter id="lightLogoFilter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100vh" width="100vw">
        <feColorMatrix
          type="matrix"
          values="1 0 0 0   1
                  0 1 0 0   1
                  0 0 1 0   1
                  1 1 1 0   0"/>
      </filter>
      <filter id="darkLogoFilter" color-interpolation-filters="sRGB"
              x="0" y="0" height="100vh" width="100vw">
        <feColorMatrix
          type="matrix"
          values="1 0 0 0    0.4
                  0 1 0 0.05 0.4
                  0 0 1 0.05 0.4
                  2 2 2 0.5  0"/>
      </filter>
    </svg>
  </div>
</template>
<script>
  // todo: implement energy saving design
  export default {
    name: 'VSiteLogo',
    data() {
      return {
        shadeDelta: 0.91
      }
    },
    methods: {
      faceStyle: function (face, shade) {
        let faceTransform = ''
        switch (face) {
          case 'top':
            faceTransform = 'rotateX(90deg)'
            break
          case 'right':
            faceTransform = 'rotateY(90deg)'
            break
          case 'bottom':
            faceTransform = 'rotateX(-90deg)'
            break
          case 'left':
            faceTransform = 'rotateY(-90deg)'
            break
          case 'back':
            faceTransform = 'rotateX(-180deg)'
        }
        let size = this.size
        if (shade) {
          size = size * this.shadeDelta
        }
        let style = ''
        style += 'background-image: url(\'/logo/data_square' + (size < 5 ? '_small' : '') + '.gif\');'
        style += 'width:' + size + 'em;'
        style += 'height:' + size + 'em;'
        style += 'transform:' + faceTransform + ' translateZ(' + (size / 2) + 'em);'
        style += '-webkit-transform:' + faceTransform + ' translateZ(' + (size / 2) + 'em);'
        style += '-moz-transform:' + faceTransform + ' translateZ(' + (size / 2) + 'em);'
        style += '-o-transform:' + faceTransform + ' translateZ(' + (size / 2) + 'em);'
        return style
      }
    },
    computed: {
      faceOffset: function () {
        return this.size * (1 + (1 - this.shadeDelta)) / 2
      },
      height: function () {
        return Math.round(this.size || 32)
      },
      width: function () {
        return Math.round((this.size || 32) * 29 / 32)
      },
      id: function () {
        return Date.now()
      },
      lightScheme: function () {
        return this.light === 'true' ? 'light' : 'dark'
      }
    },
    props: {
      'size': {
        'default': '2',
        type: String
      },
      'light': {
        'default': 'true',
        type: String
      }
    }
  }
</script>
<style>
  .defs-only {
    display: none;
  }
  .logo.light > .logoFrame {
    -webkit-filter: url(#lightLogoFilter);
    filter: url(#lightLogoFilter);
  }
  .logo.dark > .logoFrame {
    -webkit-filter: url(#darkLogoFilter);
    filter: url(#darkLogoFilter);
  }
  .logoFrame {
    -webkit-perspective: 1000px;
    -moz-perspective: 1000px;
    -o-perspective: 1000px;
    perspective: 1000px;
  }

  .logo .cube {
    position: absolute;
    -webkit-transform-style: preserve-3d;
    -moz-transform-style: preserve-3d;
    -o-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-transition: -webkit-transform 1s;
    -moz-transition: -moz-transform 1s;
    -o-transition: -o-transform 1s;
    transition: transform 1s;
  }

  .logo .cube figure {
    display: block;
    position: absolute;
    background-size: 100% 100%;
  }

  .logo.light figure.face {
    border: 1px solid black;
  }

  .logo.dark figure.face {
    border: 1px solid white;
  }

  .logo .cube figure.shade {
    display: block;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .logo .cube.panels-backface-invisible figure {
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  @keyframes diag1 {
    0%, 100% {
      transform: rotate3D(1, -1, 0, 0deg);
    }
    12% {
      transform: rotate3D(1, 0, 1, 1080deg);
    }
    25% {
      transform: rotate3D(0, 1, 1, 0deg);
    }
    37% {
      transform: rotate3D(1, 0, -1, 360deg);
    }
    50% {
      transform: rotate3D(-1, 1, 0, 0deg);
    }
    62% {
      transform: rotate3D(0.5, 0, 1, 720deg);
    }
    75% {
      transform: rotate3D(1, 1, 0, 0deg);
    }
    88% {
      transform: rotate3D(0, 1, -1, 360deg);
    }
  }

  .logo .cube {
    animation-name: diag1;
    animation-duration: 240s;
    animation-iteration-count: infinite;
    animation-direction: normal;
    animation-timing-function: ease; /* or: ease, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2) */
    animation-fill-mode: none; /* or: backwards, both, none */
  }
</style>
