<template>
  <div>
    <navbar />
    <nuxt />
  </div>
</template>

<script>
// import setLoginUser from '~/plugins/setLoginUser'
import Navbar from '~/components/Navbar'
export default {
  middleware: ['setLoginUser'],
  components: {
    Navbar
  }
  // async mounted() {
  //   await setLoginUser(this.$store, this.$redirect)
  // }
}
</script>
