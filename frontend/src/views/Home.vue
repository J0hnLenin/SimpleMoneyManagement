<template>
  <div class="home">
    <div class="hero-section">
      <h1>Добро пожаловать в систему управления денежными потоками</h1>
      <p>Выберите сущность для просмотра и управления данными</p>
    </div>
    
    <div class="entities-grid">
      <router-link to="/statuses" class="entity-card">
        <div class="card-icon">📊</div>
        <h3>Статусы</h3>
        <p>Управление статусами</p>
      </router-link>

      <router-link to="/transaction-types" class="entity-card">
        <div class="card-icon">💰</div>
        <h3>Типы транзакций</h3>
        <p>Управление типами транзакций</p>
      </router-link>

      <router-link to="/categories" class="entity-card">
        <div class="card-icon">📂</div>
        <h3>Категории</h3>
        <p>Управление категориями и подкатегориями</p>
      </router-link>

      <router-link to="/transactions" class="entity-card">
        <div class="card-icon">💳</div>
        <h3>Транзакции</h3>
        <p>Просмотр и управление транзакциями</p>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeView'
});
</script>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  padding: 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-section h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.hero-section p {
  color: #7f8c8d;
  font-size: 1.2rem;
}

.entities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.entity-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.entity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.entity-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.entity-card p {
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.api-url {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #95a5a6;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>