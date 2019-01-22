<template>
  <div class="logo"
       :id="id">
    <i
      aria-hidden="true"
      class="icon material-icons"
      :class="{'inactive': !active, 'active': active}"
      :style="{fontSize: size + 'em'}">nfc</i>
  </div>
</template>
<script>
  export default {
    name: 'VLogo',
    computed: {
      height: function () {
        return Math.round(this.size || 32)
      },
      width: function () {
        return Math.round((this.size || 32) * 29 / 32)
      },
      id: function () {
        return Date.now()
      }
    },
    props: {
      'size': {
        'default': '2',
        type: String
      },
      'active': {
        default: false,
        type: Boolean
      }
    }
  }
</script>
<style scoped>

  @keyframes activeA {
    0% {
      transform: rotate3D(0, 1, 1, 10deg);
    }
    50% {
      filter: invert(100%);
    }
    100% {
      transform: rotate3D(0, 1, 1, 360deg);
    }
  }

  .logo .active {
    animation-name: activeA;
    animation-duration: 2s;
    animation-direction: normal;
    animation-timing-function: ease-out; /* or: ease, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2) */
    animation-fill-mode: none; /* or: backwards, both, none */
  }
</style>
