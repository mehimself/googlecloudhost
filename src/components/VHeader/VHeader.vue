<template>
  <div>
    <v-navigation-drawer
      fixed
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
      v-model="drawer"
    >
      <v-list dense>
        <template v-for="item in routes">
          <v-layout
            row
            v-if="item.heading"
            align-center
            :key="item.heading"
          >
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-flex>
          </v-layout>
          <v-list-group
            v-else-if="item.children"
            v-model="item.model"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>
                  <span class="body-2 black--text">{{ item.text }}</span>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              v-for="(child, i) in item.children"
              :key="i"
              @click="$router.push({name: child.link})"
            >
              <v-list-tile-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  <span class="body-2 black--text">{{ child.text }}</span>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
          <v-list-tile v-else @click="$router.push({name: item.link})" :key="item.text">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                <span class="body-2 black--text">{{ item.text }}</span>
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      color="blue-grey darken-3"
      dark
      app
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      fixed
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">CHCAA</span>
        <v-btn icon large>
          <v-site-logo v-if="!saveEnergy"></v-site-logo>
        </v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click="toggleAuthentication()"
      >
        <v-icon>fingerprint</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>
<script>
  import { mapState } from 'vuex'
  import VSiteLogo from '../../components/VSiteLogo'
  export default {
    name: 'VHeader',
    data: () => ({
      drawer: false,
      dialog: false,
      items: [
        {icon: 'home', link: 'home', text: 'Home'},
        {icon: 'domain', link: 'about', text: 'About'},
        {icon: 'chat_bubble', link: 'contact', text: 'Contact'}
      ]
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
      /*
      login(payload) {
        console.log('payload', payload)
        payload.requestOptions = {
          name: 'github',
          url: '/auth/github',
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          redirectUri: 'http://chcaa.au.dk/auth/callback'?,
          optionalUrlParams: ['scope'],
          scope: ['user:email'],
          scopeDelimiter: ' ',
          oauthType: '2.0',
          popupOptions: {width: 1020, height: 618}
        }
        console.log('payload 2', payload)
        this.$store.dispatch('login', payload)
      }
      */
      toggleAuthentication: function () {
        console.log(this.$store.state.isAuthenticated)
        this.$store.commit('isAuthenticated', {isAuthenticated: !this.$store.state.isAuthenticated})
      },
      authenticate: function (provider) { // todo: modularize, easier to understand, easier to maintain
        if (this.isAuthenticated()) {
          this.$auth.logout()
        }

        this.response = null

        let this_ = this
        this.$auth.authenticate(provider).then(function (authResponse) {
          if (provider === 'github') {
            this_.$http.get('https://api.github.com/user').then(function (response) {
              this_.response = response
            })
          } else if (provider === 'facebook') {
            this_.$http.get('https://graph.facebook.com/v2.5/me', {
              params: {access_token: this_.$auth.getToken()}
            }).then(function (response) {
              this_.response = response
            })
          } else if (provider === 'google') {
            this_.$http.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect').then(function (response) {
              this_.response = response
            })
          } else if (provider === 'twitter') {
            this_.response = authResponse.body.profile
          } else if (provider === 'instagram') {
            this_.response = authResponse
          } else if (provider === 'bitbucket') {
            this_.$http.get('https://api.bitbucket.org/2.0/user').then(function (response) {
              this_.response = response
            })
          } else if (provider === 'linkedin') {
            this_.response = authResponse
          } else if (provider === 'live') {
            this_.response = authResponse
          }
        }).catch(function (err) {
          this_.response = err
        })
      },
      authLogout: function () {
        this.$auth.logout().then(() => {
          if (!this.$auth.isAuthenticated()) {
            this.response = null
          }
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
