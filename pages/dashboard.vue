<template>
  <div>
    <div class="row">

      <div class="col-lg-4" :class="{ 'text-right': false }">
        <card type="chart">

          <template slot="header">
            <h5 v-if="filterRealTimeData() != false" class="card-category pull-right">
              {{getTime((now-filterRealTimeData().values.temp.time) / 1000)}} ago</h5>
            <h5 class="card-category">{{$store.state.selectedDevice.name}} Temperature</h5>

            <h3 class="card-title">
              <i class="fa fa-thermometer-three-quarters text-primary" aria-hidden="true" style="font-size: 30px;"></i>
              <span v-if="filterRealTimeData() != false">{{filterRealTimeData().values.temp.value}} ºC</span>
              <span v-else> - NO DATA - </span>
            </h3>
          </template>

          <div class="chart-area" style="height: 300px">
            <highchart style="height: 100%" v-if="isMounted" :options="chartOptionsTemp" />
          </div>

        </card>
      </div>

      <div class="col-lg-4" :class="{ 'text-right': false }">
        <card type="chart">

          <template slot="header">
            <h5 v-if="filterRealTimeData() != false" class="card-category pull-right">
              {{getTime((now-filterRealTimeData().values.hum.time) / 1000)}} ago</h5>
            <h5 class="card-category">{{$store.state.selectedDevice.name}} Humidity</h5>

            <h3 class="card-title">

              <i class="fas fa-fill-drip text-success" aria-hidden="true" style="font-size: 30px;"></i>
              <span v-if="filterRealTimeData() != false"> {{filterRealTimeData().values.hum.value}} %</span>
              <span v-else> - NO DATA - </span>
            </h3>
          </template>

          <div class="chart-area" style="height: 300px">
            <highchart style="height: 100%" v-if="isMounted" :options="chartOptionsHum" />
          </div>

        </card>
      </div>


      <div class="col-lg-4" :class="{ 'text-right': false }">
        <card type="chart">

          <template slot="header">
            <h5 v-if="filterRealTimeData() != false" class="card-category pull-right">
              {{getTime((now-filterRealTimeData().values.light.time) / 1000)}} ago</h5>
            <h5 class="card-category">{{$store.state.selectedDevice.name}} Light</h5>

            <h3 class="card-title">

              <i class="far fa-lightbulb text-warning" style="font-size: 30px;"></i>
              <span v-if="filterRealTimeData() != false"> {{filterRealTimeData().values.light.value}} lm</span>
              <span v-else> - NO DATA - </span>
            </h3>
          </template>

          <div class="chart-area" style="height: 300px">
            <highchart style="height: 100%" v-if="isMounted" :options="chartOptionsLight" />
          </div>

        </card>
      </div>



    </div>

    <div class="row">
      <div class="col-6">
        <Json :value="$store.state.realTimeData"></Json>
      </div>
      <div class="col-6">
        <Json :value="filterRealTimeData()"></Json>
      </div>

      <Json :value="chartOptionsTemp"></Json>
    </div>


  </div>
</template>
<script>
  import LineChart from '@/components/Charts/LineChart';
  import BarChart from '@/components/Charts/BarChart';
  import * as chartConfigs from '@/components/Charts/config';
  import config from '@/config';
  export default {
    middleware: 'authenticated',
    name: 'Dashboard',

    data() {
      return {
        now: 0,
        smallChartsData: [],
        isMounted: false,

        chartOptionsTemp: {
          credits: {
            enabled: false
          },
          chart: {
            renderTo: 'container',
            defaultSeriesType: 'line',
            backgroundColor: 'rgba(0,0,0,0)',
          },
          title: {
            text: ''
          },
          xAxis: {
            type: 'datetime',
            labels: {
              style: {
                color: '#d4d2d2'
              }
            }
          },
          yAxis: {
            title: {
              text: ''
            },
            labels: {
              style: {
                color: '#d4d2d2',
                font: '11px Trebuchet MS, Verdana, sans-serif'
              }
            }
          },
          plotOptions: {
            series: {
              label: {
                connectorAllowed: false,
              },
              pointStart: 2010
            }
          },
          series: [{
            name: 'Temp ºC',
            data: [],
            color: "#e14eca"
          },],
          legend: {
            itemStyle: {
              color: '#d4d2d2'
            }
          },
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }]
          }
        },

        chartOptionsHum: {
          credits: {
            enabled: false
          },
          chart: {
            renderTo: 'container',
            defaultSeriesType: 'line',
            backgroundColor: 'rgba(0,0,0,0)',
          },
          title: {
            text: ''
          },
          xAxis: {
            type: 'datetime',
            labels: {
              style: {
                color: '#d4d2d2'
              }
            }
          },
          yAxis: {
            title: {
              text: ''
            },
            labels: {
              style: {
                color: '#d4d2d2',
                font: '11px Trebuchet MS, Verdana, sans-serif'
              }
            }
          },
          plotOptions: {
            series: {
              label: {
                connectorAllowed: false,
              },
              pointStart: 2010
            }
          },
          series: [{
            name: 'Hum %',
            data: [],
            color: "#00f2c3"
          },],
          legend: {
            itemStyle: {
              color: '#d4d2d2'
            }
          },
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }]
          }
        },

        chartOptionsLight: {
          credits: {
            enabled: false
          },
          chart: {
            renderTo: 'container',
            defaultSeriesType: 'line',
            backgroundColor: 'rgba(0,0,0,0)',
          },
          title: {
            text: ''
          },
          xAxis: {
            type: 'datetime',
            labels: {
              style: {
                color: '#d4d2d2'
              }
            }
          },
          yAxis: {
            title: {
              text: ''
            },
            labels: {
              style: {
                color: '#d4d2d2',
                font: '11px Trebuchet MS, Verdana, sans-serif'
              }
            }
          },
          plotOptions: {
            series: {
              label: {
                connectorAllowed: false,
              },
              pointStart: 2010
            }
          },
          series: [{
            name: 'Light lm',
            data: [],
            color: "#ff8d72"
          },],
          legend: {
            itemStyle: {
              color: '#d4d2d2'
            }
          },
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }]
          }
        },

      };
    },

    mounted() {
      this.getNow();
      this.getSmallChartsData();


    },

    methods: {

      async drawSmallChartTemp() {

        var data = this.filterSmallChartsData('temp');
        console.log(data);

        data.forEach(element => {
          var aux = {
            x: null,
            y: null
          }
          aux.x = element.payload.time;
          aux.y = element.payload.values.temp;
          this.chartOptionsTemp.series[0].data.push(aux);
          this.isMounted = true;
        });
        console.log(this.chartOptionsTemp.series[0].data)



      },
      async drawSmallChartHum() {
        var data = this.filterSmallChartsData('hum');

        data.forEach(element => {
          var aux = {
            x: null,
            y: null
          }
          aux.x = element.payload.time;
          aux.y = element.payload.values.hum;
          this.chartOptionsHum.series[0].data.push(aux)
        });

      },

      async drawSmallChartLight() {

        var data = this.filterSmallChartsData('light');

        data.forEach(element => {
          var aux = {
            x: null,
            y: null
          }
          aux.x = element.payload.time;
          aux.y = element.payload.values.light;
          this.chartOptionsLight.series[0].data.push(aux)
        });

        setTimeout(() => {
          this.mounted = true;
        }, 3000);


      },


      filterSmallChartsData(variable) {
        const result = this.smallChartsData.filter(data => data.payload.dId == this.$store.state.selectedDevice.dId && data.payload.values.hasOwnProperty(variable));
        if (result.length > 0) {
          return result;
        } else {
          return [];
        }
      },

      async getSmallChartsData() {

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.accessToken
          }
        }

        try {

          const res = await this.$axios.post("/get-small-charts-data", null, axiosHeaders)
          
          this.smallChartsData = res.data.data;

          console.log(this.smallChartsData)
          await this.drawSmallChartTemp();
          await this.drawSmallChartHum();
          await this.drawSmallChartLight();
        } catch (error) {
          this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error getting charts data...' });
          console.log(error)
          return;
        }




      },

      filterRealTimeData() {
        const result = this.$store.state.realTimeData.filter(data => data.dId == this.$store.state.selectedDevice.dId);

        if (result.length == 1) {
          return result[0];
        } else {
          return false;
        }
      },
      getTime(time) {

        if (time < 0) {
          time = 0;
        }

        if (time < 59) {
          return time.toFixed() + " secs";
        }

        if (time > 59 && time <= 3600) {
          time = time / 60;
          return time.toFixed() + " min";
        }

        if (time > 3600 && time <= 86400) {
          time = time / 3600;
          return time.toFixed() + " hour";
        }

        if (time > 86400) {
          time = time / 86400;
          return time.toFixed() + " day";
        }

      },
      getNow() {
        this.now = Date.now();
        setTimeout(() => {
          this.getNow();
        }, 1000);
      }


    }

  };
</script>
<style></style>//