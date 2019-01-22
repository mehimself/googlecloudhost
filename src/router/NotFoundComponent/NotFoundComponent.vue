<template>
  <v-container fill-height ref="container">
    <v-layout align-center>
      <v-flex twext-xs-center xs8 offset-xs2>
          <div class="backgroundImage elevation-10">
            <v-container fill-height>
              <v-layout align-center>
                <v-flex text-xs-center xs10 offset-xs1>
                  <div class="title elevation-1">
                    <div class="textbox">
                      <h1>{{ $route.path }} was not found.</h1>
                      <p class="threed">error 404</p>
                    </div>
                  </div>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  function getWindowDimensions(that) {
    that.windowWidth = window.innerWidth
    that.windowHeight = window.innerHeight
  }
  export default {
    data: () => {
      return {
        windowWidth: 100,
        windowHeight: 100
      }
    },
    mounted() {
      let that = this
      this.$nextTick(function () {
        window.addEventListener('resize', function (e) {
          getWindowDimensions(that)
        })
      })
      getWindowDimensions(that)
    }
  }
</script>

<style scoped>
  .backgroundImage {
    padding: 1em;
    background: url('/404.jpg') center center no-repeat;
    height: 600px;
  }
  .title {
    background-color: rgba(255, 255, 255, 0.6);
    padding:  1em;
    border-radius: 1em;
  }
</style>
