<template>
  <v-chip
    small
    close
    :color="color"
    :class="{'confirm': isButtonVisible}"
    @input="act()"
  >
    <v-avatar v-if="isButtonVisible">
      <v-icon>{{actionIcon}}</v-icon>
    </v-avatar>
    {{label}}
  </v-chip>
</template>
<script>
  export default {
    name: 'VConfirmedActionChip',
    data: () => ({
      timeout: null,
      isButtonVisible: false
    }),
    props: {
      'timeoutDuration': {
        type: Number,
        default: 2000
      },
      'label': {
        type: String,
        required: true
      },
      'actionIcon': {
        typ: String,
        default: 'delete'
      },
      'action': {
        required: true
      },
      'itemIndex': {
        type: Number
      }
    },
    computed: {
      color: function () {
        return this.isButtonVisible ? 'red' : 'light-grey'
      }
    },
    methods: {
      act: function () {
        if (this.isButtonVisible) {
          console.log('action confirmed')
          this.isButtonVisible = null
          this.action(this.itemIndex)
        } else {
          if (this.timeout) {
            clearTimeout(this.timeout)
          }
          this.isButtonVisible = true
          let that = this
          this.timeout = setTimeout(function () { that.isButtonVisible = null }, this.timeoutDuration)
        }
      }
    }
  }
</script>
<style scoped>
  .confirm {
    color: white;
  }
</style>
