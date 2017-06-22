<template>
  <div class="hello">
    <h1>{{ msg }}</h1>   
    
    <button @click="showClicked" style="width:90px;height:50px;font-size:16px;background-color:red">手势密码</button>
    <pwd v-model="showPwd" ></pwd>

  </div>
</template>

<script>

import pwd from '@/components/pwd'

export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      showPwd:false
    }
  },
  components: {
    pwd
  },
   methods: {
    showClicked(){
      console.log('xxxxx');
      this.showPwd = true;
    }

   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
