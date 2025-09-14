import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import StatusesView from '../views/StatusesView.vue';
import TransactionTypesView from '../views/TransactionTypesView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import TransactionsView from '../views/TransactionsView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/statuses',
    name: 'Statuses',
    component: StatusesView
  },
  {
    path: '/transaction-types',
    name: 'TransactionTypes',
    component: TransactionTypesView
  },
  {
    path: '/categories',
    name: 'Categories',
    component: CategoriesView
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;