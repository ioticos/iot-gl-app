<template>
  <base-nav v-model="showMenu" class="navbar-absolute top-navbar" type="white" :transparent="true">
    <div slot="brand" class="navbar-wrapper">
      <div class="navbar-toggle d-inline" :class="{ toggled: $sidebar.showSidebar }">
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="#">IoTicos - {{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">

      <el-select class="select-success" placeholder="Select Device" @change="selectDevice()" v-model="selectedDevice">
        <el-option v-for="device, index of $store.state.devices" class="text-dark" :value="index" :label="device.name"
          :key="device._id">
        </el-option>
      </el-select>


      <base-dropdown tag="li" :menu-on-right="!$rtl.isRTL" title-tag="a" title-classes="nav-link" class="nav-item">
        <template slot="title">
          <div class="notification d-none d-lg-block d-xl-block"></div>
          <i class="tim-icons icon-sound-wave"></i>
          <p class="d-lg-none">New Notifications</p>
        </template>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Mike John responded to your email</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">You have 5 more tasks</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Your friend Michael is in town</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Another notification</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Another one</a>
        </li>
      </base-dropdown>

      <base-dropdown tag="li" :menu-on-right="!$rtl.isRTL" title-tag="a" class="nav-item" title-classes="nav-link"
        menu-classes="dropdown-navbar">
        <template slot="title">
          <div class="photo"><img src="img/mike.jpg" /></div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p @click="logOut()" class="d-lg-none">Log out</p>
        </template>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Profile</a>
        </li>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item">Settings</a>
        </li>
        <div class="dropdown-divider"></div>
        <li @click="logOut()" class="nav-link">
          <a href="#" class="nav-item dropdown-item">Log out</a>
        </li>
      </base-dropdown>

    </ul>
  </base-nav>
</template>
<script>
  import { CollapseTransition } from 'vue2-transitions';
  import { BaseNav, Modal } from '@/components';
  import { Select, Option } from 'element-ui';
  const Cookie = process.client ? require('js-cookie') : undefined

  export default {
    components: {
      CollapseTransition,
      BaseNav,
      Modal,
      [Option.name]: Option,
      [Select.name]: Select,
    },
    computed: {
      routeName() {
        const { path } = this.$route;
        let parts = path.split('/')
        if (parts == ',') {
          return 'Dashboard';
        }
        return parts.map(p => this.capitalizeFirstLetter(p)).join(' ');
      },
      isRTL() {
        return this.$rtl.isRTL;
      }
    },
    data() {
      return {
        selectedDevice: null,
        activeNotifications: false,
        showMenu: false,
        searchModalVisible: false,
        searchQuery: ''
      };
    },
    mounted() {
      this.getDevices();

      //escucho si se emite un mensaje desde devices (agrega o borra)
      this.$nuxt.$on('time-to-get-devices', () => {
        this.getDevices();
      })

    },
    methods: {
      selectDevice() {

        var device = this.$store.state.devices[this.selectedDevice];

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/select-device", device, axiosHeaders)
          .then(res => {

            this.getDevices();

          })
          .catch(e => {
            console.log(e)
            return;
          });
      },
      getDevices() {

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/get-devices", null, axiosHeaders)
          .then(res => {

            var devices = res.data.devices;
       
            //grabo todos los devices en store
            this.$store.commit('setDevices', devices);

            //si no viene ningun device para que el selector deje de mostrar el ultimo seleccionado.
            if (devices.length == 0){
              this.$store.commit('setSelectedDevice', null);
              this.selectedDevice = null;
            }

            //busco cual es el dispositivo seleccionado así lo grabo en store
            devices.forEach((device, index) => {
              if (device.selected == true) {
                this.selectedDevice = index;
                this.$store.commit('setSelectedDevice', device);
              }
            });


          })
          .catch(e => {
            console.log(e)
            return;
          });
      },
      logOut() {
        console.log("logout")

        //if ssr mode true
        //Cookie.remove('auth')

        //if ssr mode false
        localStorage.removeItem('auth');


        const auth = {};
        this.$store.commit('setAuth', auth);


        window.location.href = "/login";


      },
      capitalizeFirstLetter(string) {
        if (!string || typeof string !== 'string') {
          return ''
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
      },
      closeDropDown() {
        this.activeNotifications = false;
      },
      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      },
      toggleMenu() {
        this.showMenu = !this.showMenu;
      }
    }
  };
</script>
<style scoped>
  .top-navbar {
    top: 0px;
  }
</style>