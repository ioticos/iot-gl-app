<template>
    <div class="container login-page">
        <div class="col-lg-4 col-md-6 ml-auto mr-auto">

            <card class="card-login card-white">
                <template slot="header">
                    <img src="img//card-primary.png" alt="" />
                    <h1 class="card-title">IoT GL</h1>
                </template>

                <div>

                    <base-input name="name" v-model="user.name" placeholder="Name"
                        addon-left-icon="tim-icons icon-badge">
                    </base-input>

                    <base-input name="email" v-model="user.email" placeholder="Email"
                        addon-left-icon="tim-icons icon-email-85">
                    </base-input>

                    <base-input name="password" v-model="user.password" type="password" placeholder="Password"
                        addon-left-icon="tim-icons icon-lock-circle">
                    </base-input>
                </div>

                <div slot="footer">

                    <base-button native-type="submit" type="primary" class="mb-3" size="lg" @click="register" block>
                        Register
                    </base-button>

                    <div class="pull-left">
                        <h6>
                            <nuxt-link class="link footer-link" to="/login">
                                login
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
    export default {
        middleware: 'notAuthenticated',
        name: 'login-page',
        layout: 'auth',
        data() {
            return {
                user: {
                    name: "",
                    email: '',
                    password: '',
                }
            };
        },
        methods: {

            register() {
                this.$axios.post("/new-user", this.user)
                    .then(res => {

                        //if user email aready exists -- si el usuario ya está registrado
                        if (res.data.status == "error" && res.data.error.errors.email.kind == "unique") {

                            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'User already exists :(' });
                            return;

                        }

                        //success! - Usuario crado.
                        if (res.data.status == "success") {
                            this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Now you can login...' });

                            return;
                        }

                    })
                    .catch(e => {
                        console.log(e);

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