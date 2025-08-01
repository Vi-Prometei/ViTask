import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
    const uid = localStorage.getItem('userID');
    if (uid) config.headers['X-User-ID'] = uid;
    return config;
});

export default api;