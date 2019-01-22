<template>
  <v-container fluid fill-height class="page">
    <v-layout row align-center justify-content-center>
      <v-flex xs12 offset-sm1 sm10>
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
          <v-card-text>
            <h1>Python Scripts</h1>
            <div v-if="results">
              <h4>Result</h4>
              <pre>{{results}}</pre>
            </div>
            <div class="text-xs-center">
              <template
                v-for="name in scripts"
              >
                <v-chip
                  v-if="name !== lastScriptRun"
                  @click="run(name)"
                  color="grey"
                  text-color="black">
                  {{ name }}
                </v-chip>
                <v-chip
                  v-else
                  @click="run(name)"
                  color="green"
                  text-color="white">
                  <v-avatar
                    v-if="isRunning"
                  >
                    <v-icon>play_arrow</v-icon>
                  </v-avatar>
                  {{ name }}
                </v-chip>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
  import { GET_SCRIPTS, RUN_SCRIPT } from '@/store/pythonService/mutation-types'
  import { mapState } from 'vuex'

  const namespacePrefix = 'python/'

  export default {
    data() {
      return {
        lastScriptRun: ''
      }
    },
    computed: mapState(namespacePrefix, [
      'scripts',
      'results',
      'isRunning'
    ]),
    methods: {
      run(name) {
        this.lastScriptRun = name
        this.$store.dispatch(namespacePrefix + RUN_SCRIPT, name)
      }
    },
    created() {
      this.$store.dispatch(namespacePrefix + GET_SCRIPTS)
    }
  }
</script>
<style scoped>
  pre {
    background-color: black;
    color: #fff;
    border-radius: 0.4em;
    padding: 1em;
  }
</style>
