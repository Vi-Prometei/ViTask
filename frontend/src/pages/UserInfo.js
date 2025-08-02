import React from 'react';
import {Button} from 'antd';
import {UserOutlined} from '@ant-design/icons';

export default function UserInfo({user, onLogout}) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 16
        }}>
            <UserOutlined style={{fontSize: 22, marginRight: 8}}/>
            <span style={{marginRight: 8}}>
                Вы вошли как: <b>{user.first_name} {user.last_name}</b> ({user.login})
            </span>
            <Button type="link" danger onClick={onLogout}>Выйти</Button>
        </div>
    );
}
