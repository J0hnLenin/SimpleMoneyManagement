<template>
  <footer class="footer">
    <div class="footer-content">
      <p>&copy; Андрей Зимин, 2025. Все права защищены.</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Footer'
});
</script>

<style scoped>
.footer {
  background-color: #34495e;
  color: white;
  padding: 1rem 0;
  margin-top: auto;
}

.footer-content {
  text-align: center;
  padding: 0 2rem;
}
</style>