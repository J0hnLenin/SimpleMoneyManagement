<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h2>Simple money management</h2>
    </div>
     <div class="navbar-left">
      <div class="navbar-brand">
        <h2>Транзакции</h2>
      </div>
      <div class="navbar-links">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link to="/statuses" class="nav-link">Статусы</router-link>
        <router-link to="/transaction-types" class="nav-link">Типы</router-link>
        <router-link to="/categories" class="nav-link">Категории</router-link>
        <router-link to="/transactions" class="nav-link">Транзакции</router-link>
      </div>
    </div>
    <div class="navbar-auth">
      <div v-if="isAuthenticated" class="user-info">
        <span>Добро пожаловать!</span>
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>
      <div v-else class="login-form">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Логин" 
          class="auth-input"
        >
        <input 
          v-model="password" 
          type="password" 
          placeholder="Пароль" 
          class="auth-input"
          @keypress.enter="login"
        >
        <button @click="login" class="login-btn">Войти</button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import authService from '@/services/auth';

export default defineComponent({
  name: 'Navbar',
  setup() {
    const username = ref('');
    const password = ref('');
    const isAuthenticated = ref(authService.isAuthenticated());

    const login = async () => {
      try {
        await authService.login({
          username: username.value,
          password: password.value
        });
        isAuthenticated.value = true;
        username.value = '';
        password.value = '';
        alert('Успешный вход!');
      } catch (error) {
        alert('Ошибка авторизации. Проверьте логин и пароль.');
      }
    };

    const logout = () => {
      authService.logout();
      isAuthenticated.value = false;
      alert('Вы вышли из системы');
    };

    return {
      username,
      password,
      isAuthenticated,
      login,
      logout
    };
  }
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar-brand h2 {
  margin: 0;
  color: #ecf0f1;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #bdc3c7;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #ecf0f1;
}

.nav-link.router-link-active {
  color: #ecf0f1;
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-input {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.login-btn, .logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.login-btn {
  background-color: #27ae60;
  color: white;
}

.login-btn:hover {
  background-color: #229954;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>