<template>
  <v-container fluid fill-height class="page">
    <v-layout row align-center justify-content-center>
      <v-flex xs0 sm6>
        <v-site-logo :size="logoSize" light=false></v-site-logo>
      </v-flex>
      <v-flex xs12 sm6>
        <v-card class="white">
          <v-card-title primary-title>
            <h1>
              Center for Humanities Computing Aarhus
            </h1>
          </v-card-title>
          <v-card-text>
            <p>
              Empowering Domain Experts with Sustainable Knowledge Discovery and Collaborative Systems Innovation
            </p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
  import VSiteLogo from '../../components/VSiteLogo'

  export default {
    data() {
      return {
        windowSize: 40
      }
    },
    computed: {
      logoSize: function () {
        return String(this.windowSize / 5)
      }
    },
    components: {
      VSiteLogo
    },
    mounted() {
      let that = this
      this.$nextTick(function () {
        window.addEventListener('resize', function (e) {
          that.windowSize = window.innerWidth / 15
        })
      })
      that.windowSize = window.innerWidth / 15
    }
  }
</script>
<style scoped>

</style>
