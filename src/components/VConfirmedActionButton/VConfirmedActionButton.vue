<template>
  <div>
      <v-btn
        color="orange"
        dark
        small
        absolute
        right
        style="z-index: 2; "
        @click="askToConfirm()"
      >
        <v-icon>{{buttonIcon}}</v-icon>
      </v-btn>
      <v-btn
        v-if="isButtonVisible"
        color="red"
        dark
        small
        @click="performAction()"
      >
        {{confirmButtonText}}
      </v-btn>
  </div>
</template>
<script>
  export default {
    name: 'VConfirmedActionButton',
    data: () => ({
      timeout: null,
      isButtonVisible: false
    }),
    props: {
      'timeoutDuration': {
        type: Number,
        default: 2000
      },
      'buttonIcon': {
        type: String,
        default: 'delete'
      },
      'confirmButtonText': {
        typ: String,
        default: 'CONFIRM DELETE'
      },
      'action': {
        required: true
      }
    },
    methods: {
      askToConfirm: function () {
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.isButtonVisible = true
        let that = this
        this.timeout = setTimeout(function () { that.isButtonVisible = null }, this.timeoutDuration)
      },
      performAction: function () {
        console.log('action confirmed')
        this.isButtonVisible = null
        this.action()
      }
    }
  }
</script>
