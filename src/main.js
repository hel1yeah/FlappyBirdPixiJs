import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router.js';
import store from './store/store.js';

import 'normalize-scss';
import './assets/scss/main.scss';

const app = createApp(App)
app.use(router).use(store).mount('#app');

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA8GApJhwjeHPgxtF811LVi0QmBcWoqLBE",
//   authDomain: "flappybirdpixijs.firebaseapp.com",
//   projectId: "flappybirdpixijs",
//   storageBucket: "flappybirdpixijs.appspot.com",
//   messagingSenderId: "743418318575",
//   appId: "1:743418318575:web:8163246aead0d49502951a"
// };

// // Initialize Firebase
// const appp = initializeApp(firebaseConfig);


