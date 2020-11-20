<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">


      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">IoT GL</h1>
        </template>

        <div>
          <base-input name="email" v-model="user.email" placeholder="Email" addon-left-icon="tim-icons icon-email-85">
          </base-input>

          <base-input name="password" v-model="user.password" type="password" placeholder="Password"
            addon-left-icon="tim-icons icon-lock-circle">
          </base-input>

        </div>

        <div slot="footer">
          <base-button native-type="submit" type="primary" class="mb-3" size="lg" @click="login" block>
            Login
          </base-button>
          <div class="pull-left">
            <h6>
              <nuxt-link class="link footer-link" to="/register">
                Create Account
              </nuxt-link>
            </h6>
          </div>

          <div class="pull-right">
            <h6><a href="#help!!!" class="link footer-link">Need Help?</a></h6>
          </div>
        </div>
      </card>

    </div>
  </div>
</template>

<script>
  const Cookie = process.client ? require('js-cookie') : undefined
  export default {
    middleware: 'notAuthenticated',
    name: 'login-page',
    layout: 'auth',
    data() {
      return {
        user: {
          email: '',
          password: '',
        }
      };
    },
    methods: {
      login() {

        //if email is empty - si el email está vacío
        if (this.user.email == "") {
          this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Email field is empty' });
          return 
        }

        //if password is empty - si la clave está vacía
        if (this.user.password == "") {
          this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Password field is empty' });
          return
        }

        //all ok? call to API - ¿Todo bien? Llamemos a la API
        this.$axios.post("/login", this.user)
          .then(res => {



            //Invalid credentials? then notification - ¿Credenciales inválidas? entonces notificamos
            if (res.data.status == "error" && res.data.error == "Invalid Credentials") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'Invalid Credentials' });
              return;
            }

            //Do we have a token? - ¿Recibimos un token?
            if (res.data.token) {

              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Hi ' + res.data.userData.name + ', welcome to IoTicos GL' });

              const auth = {
                accessToken: res.data.token,
                userData: res.data.userData,
              }

              //token to de store - token a la tienda
              this.$store.commit('setAuth', auth);

              // if ssr saving token in cookie - si ssr grabamos token en una cookie
              // update middlewares too - actualizar middlewares también
              // update logout function too -  actualizar función logout también
              //Cookie.set('auth', auth);

              //set auth object in localStorage - Grabamos el token en localStorage
              localStorage.setItem('auth', JSON.stringify(auth));

              $nuxt.$router.push('/dashboard');

            }

          })
          .catch(e => {
            console.log(e)

          });

      }
    }
  };
</script>
<style>
  .navbar-nav .nav-item p {
    line-height: inherit;
    margin-left: 5px;
  }
</style>