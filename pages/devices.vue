<template>
  <div>
    <div class="row">
      <div class="col-sm-12">
        <card>

          <div slot="header">
            <h4 class="card-title">Add new Device</h4>
          </div>

          <div class="row">

            <div class="col-6">
              <base-input v-model="newDevice.name" label="Device Name" type="text" placeholder="Ex: Home, Office..."
                addon-left-icon="tim-icons icon-light-3"></base-input>
            </div>

            <div class="col-6">
              <base-input v-model="newDevice.dId" label="Device ID" type="text" placeholder="Ex: ABC-777-333"
                addon-left-icon="tim-icons icon-link-72"></base-input>
            </div>

          </div>

          <div class="row pull-right">

            <div class="col-12">
              <base-button native-type="submit" type="primary" class="mb-3" size="lg" @click="createNewDevice()">
                Add
              </base-button>
            </div>

          </div>

        </card>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <card>
          <div slot="header">
            <h4 class="card-title">Devices</h4>
          </div>

          <el-table :data="$store.state.devices">

            <el-table-column min-width="50" label="#" align="center">
              <div class="photo" slot-scope="{ row, $index }">
                {{$index + 1}}
              </div>
            </el-table-column>

            <el-table-column prop="name" label="Name"></el-table-column>

            <el-table-column prop="dId" label="dId"></el-table-column>

            <el-table-column header-align="right" align="right" label="Actions">
              <div slot-scope="{ row, $index }" class="text-right table-actions">
                <el-tooltip content="Delete" effect="light" :open-delay="300" placement="top">
                  <base-button @click="deleteDevice(row)" type="danger" icon size="sm" class="btn-link">
                    <i class="tim-icons icon-simple-remove "></i>
                  </base-button>
                </el-tooltip>
              </div>
            </el-table-column>

          </el-table>

        </card>

      </div>
    </div>
  </div>

</template>
<script>
  import { Table, TableColumn } from 'element-ui';
  export default {
    middleware: 'authenticated',
    name: 'devices',
    components: {
      [Table.name]: Table,
      [TableColumn.name]: TableColumn,
    },
    data() {
      return {
        newDevice: {
          name: "",
          dId: ""
        },
      };
    },
    methods: {

      deleteDevice(device) {


        var toDelete = {
          dId: device.dId
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/delete-device", toDelete, axiosHeaders)
          .then(res => {

            if (res.data.status == "error" && res.data.error == "noDevices") {
              this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' No device left...'});
            }

            if (res.data.status == "success") {
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: device.name + ' deleted!' });
            }

            $nuxt.$emit('time-to-get-devices')
            return;
          })
          .catch(e => {
            console.log(e)
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: ' Error deleting ' + device.name });
            return;

          });

      },



      createNewDevice() {

        if (this.newDevice.name == "") {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Device Name is Empty :(' });
          return;
        }

        if (this.newDevice.dId == "") {
          this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: ' Device ID is Empty :(' });
          return;
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        this.$axios.post("/new-device", this.newDevice, axiosHeaders)
          .then(res => {

            if (res.data.status == "error" && res.data.error.errors.dId.kind == "unique") {
              this.$notify({ type: 'warning', icon: 'tim-icons icon-alert-circle-exc', message: 'The device is already registered in the system. Try another device' });
              return;
            } else if (res.data.status == "success") {
              this.newDevice.name = "";
              this.newDevice.dId = "";
              this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: 'Success! Device was added' });
              $nuxt.$emit('time-to-get-devices');
              return;
            }

          })
          .catch(e => {
            this.showNotify("danger", "Error");
            return;
          });

      },
    }
  };
</script>
<style></style>