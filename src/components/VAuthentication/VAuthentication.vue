<template>
  <button
    @click="auth('github')"
    class="button--github">
    Auth github
  </button>
  <pre
    class="response"
    v-if="response !== null">{{JSON.stringify(response, null, 2)}}</pre>
</template>
<script>
  import { mapState } from 'vuex'
  import VSiteLogo from '../VSiteLogo'
  export default {
    name: 'VHeader',
    data: () => ({
      access_token: null,
      response: null
    }),
    computed: {
      ...mapState([
        'saveEnergy',
        'isAuthenticated'
      ]),
      routes: function () {
        return this.items.filter(item => !item.loginRequired || this.isAuthenticated)
      }
    },
    methods: {
      auth: function (provider) {
        if (this.$auth.isAuthenticated()) {
          this.$auth.logout()
        }

        this.response = null

        var this_ = this;
        this.$auth.authenticate(provider).then(function (authResponse) {
          if (provider === 'github') {
            this_.$http.get('https://api.github.com/user').then(function (response) {
              this_.response = response
            })
          }
        }).catch(function (err) {
          this_.response = err
        })
      }
    },
    components: {
      VSiteLogo
    }
  }
</script>
<style scoped>
  .navigation-drawer a {
    text-decoration: none;
  }
  .list .list__group__items {
    background-color: #eee;
  }
</style>
