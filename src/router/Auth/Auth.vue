<template>
  <v-container fluid fill-height class="page">
    <v-layout fluid fill-height grid-list-lg>
      <v-flex xs10 offset-xs1 class="cards">
        <v-card class="white">
          <v-card-title primary-title>
            <h1>Authentication</h1>
          </v-card-title>
          <v-card-text>
            <form action="/auth/local/login" method="POST">
              <input
                type="hidden"
                name="_csrf"
                :value="_csrf">
              <div class="col-sm-8 col-sm-offset-2">
                <div class="form-group">
                  <label
                    for="email"
                    class="control-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email" id="email"
                    placeholder="Email"
                    autofocus=""
                    class="form-control">
                </div>
                <div class="form-group">
                  <label
                    for="password"
                    class="control-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    class="form-control">
                </div>
                <div class="form-group">
                  <button
                    type="submit"
                    class="btn btn-primary">
                    <i class="fa fa-user"></i>
                    Login
                  </button>
                  <a
                    href="/forgot"
                    class="btn btn-link">
                    Forgot your password?
                  </a>
                </div>
                <hr>
                <a
                  href="/auth/google"
                  class="btn btn-block btn-google btn-social">
                  <i class="fa fa-google-plus"></i>
                  Sign in with Google
                </a>
                <a
                  href="/auth/github"
                  class="btn btn-block btn-github btn-social">
                  <i class="fa fa-github"></i>
                  Sign in with GitHub
                </a>
              </div>
            </form>
          </v-card-text>
        </v-card>
        <v-card class="white">
          <v-card-title>
            <h3>Upcoming Platform for Custom Research Applications</h3>
          </v-card-title>
          <v-card-text>
            Part of our activities focus on developing avant-garde research resources for customized High Performance
            Computing (HPC) research applications
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
