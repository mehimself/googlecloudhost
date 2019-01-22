<template>
  <v-app id="inspire">
    <v-header></v-header>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-dialog v-model="dialog" width="800px">
      <v-card>
        <v-card-title
          class="grey lighten-4 py-4 title"
        >
          Upload file
        </v-card-title>
        <v-container grid-list-sm class="pa-4">
          <v-layout row wrap>
            <v-flex xs12 align-center justify-space-between>
              <v-layout align-center>
                <v-avatar size="40px" class="mr-3">
                  <img
                    src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png"
                    alt=""
                  >
                </v-avatar>
                <v-text-field
                  placeholder="Name"
                ></v-text-field>
              </v-layout>
            </v-flex>
            <v-flex xs6>
              <v-text-field
                prepend-icon="business"
                placeholder="Company"
              ></v-text-field>
            </v-flex>
            <v-flex xs6>
              <v-text-field
                placeholder="Job title"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                prepend-icon="mail"
                placeholder="Email"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                type="tel"
                prepend-icon="phone"
                placeholder="(000) 000 - 0000"
                mask="phone"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                prepend-icon="notes"
                placeholder="Notes"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-btn flat color="primary">More</v-btn>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
          <v-btn flat @click="dialog = false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import VHeader from '../../components/VHeader'

  export default {
    data: () => ({
      dialog: false
    }),
    props: {
      source: String
    },
    components: {
      VHeader
    }
  }
</script>
<style>
  body {
    font-size: 16px;
  }

  .cards {
    margin-left: 1em;
    margin-right: 1em;
  }

  .cards .card {
    margin-top: 1em;
  }

  .card {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 1em;
  }

  .clear {
    background-color: transparent !important;
  }

  .glass {
    background-color: rgba(0, 12, 25, 0.4) !important;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, .7));
    border-top: #3e4e52 1px solid;
    border-left: #3e4e52 1px solid;
    border-right: #222d3c 1px solid;
  }

  .cards .white {
    color: black !important;
    background-color: rgba(255, 255, 255, 0.95) !important;
  }

  .page {
    background-image: url('/images/laptop-3174729_1920.jpg');
    background-size: cover;
  }


  .card.dark {
    color: white;
    background-color: rgba(0, 0, 0, 0.6);
    -webkit-border-radius: 1em;
    -moz-border-radius: 1em;
    border-radius: 0.2em;
    padding: 1em;
  }


</style>
