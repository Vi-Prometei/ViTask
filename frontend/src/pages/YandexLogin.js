import React from 'react';
import { Card, Button } from 'antd';

const YANDEX_CLIENT_ID = '3ea8618d3802468e9756114029ae185f';
const YANDEX_REDIRECT = 'http://127.0.0.1:8080/yandex.html';
export default function YandexLogin() {
    const handleLogin = () => {
        window.location.href =
            `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(YANDEX_REDIRECT)}`;
    };

    return (
        <Card title="Вход через Яндекс.Диск" style={{ maxWidth: 400, margin: '100px auto' }}>
            <Button type="primary" onClick={handleLogin} size="large">
                Войти через Яндекс
            </Button>
            <p style={{ marginTop: 16 }}>
                Для доступа к Яндекс.Диску нужно авторизоваться через Яндекс.Паспорт.
            </p>
        </Card>
    );
}
