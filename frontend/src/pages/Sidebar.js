import React from 'react';
import {Menu, Layout} from 'antd';
import {
    UnorderedListOutlined, PlusOutlined, CheckCircleOutlined, UserOutlined
} from '@ant-design/icons';

const {Sider} = Layout;

export default function Sidebar({
                                    activeTab,
                                    setActiveTab,
                                    setEditingTask,
                                    form
                                }) {
    return (
        <Sider width={200} style={{background: '#fff'}}>
            <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onClick={(e) => {
                    setActiveTab(e.key);
                    if (e.key === 'list') {
                        setEditingTask(null);
                        form.resetFields();
                    }
                }}
                style={{height: '100%', borderRight: 0}}
            >
                <Menu.Item key="list" icon={<UnorderedListOutlined/>}>
                    Задачи
                </Menu.Item>
                <Menu.Item key="create" icon={<PlusOutlined/>}>
                    Создание задачи
                </Menu.Item>
                <Menu.Item key="completed" icon={<CheckCircleOutlined/>}>Архив</Menu.Item>
                <Menu.Item key="disk" icon={<UserOutlined />}>Яндекс.Диск</Menu.Item>
            </Menu>
        </Sider>
    );
}
