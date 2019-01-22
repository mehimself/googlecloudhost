<template>
  <v-container fluid fill-height class="page">
    <v-layout fluid fill-height grid-list-lg>
      <v-flex xs10 offset-xs1 class="cards">
        <v-card class="white">
          <v-card-title primary-title>
            <h1>Center for Cloud Computing Aarhus - Service Portal</h1>
          </v-card-title>
          <v-card-text>
            These pages represent the platform on which to use the services developed by CHCAA.
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
  import { mapState } from 'vuex'
  export default {
    data() {
      return {
        id: 'about'
      }
    },
    computed: {
      ...mapState([
        'isAuthenticated'
      ]),
      title: {
        get() {
          return this.$store.state.texts.texts[this.id].title
        },
        set(value) {
          const update = (
            {
              id: this.id,
              attributeName: 'title',
              value: value
            })
          this.$store.dispatch('texts/putItemAttribute', update)
        }
      },
      body: {
        get() {
          return this.$store.state.news.news[this.id].body
        },
        set(value) {
          const update = (
            {
              id: this.id,
              attributeName: 'body',
              value: value
            })
          this.$store.dispatch('texts/putItemAttribute', update)
        }
      }
    }
  }
</script>
<style scoped>

</style>
