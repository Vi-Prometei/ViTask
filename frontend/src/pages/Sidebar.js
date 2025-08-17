import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import {
    UnorderedListOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    UserOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Sidebar({ activeTab, setActiveTab, setEditingTask, form }) {
    // Чтобы не создавать массив на каждый рендер — мемоизируем
    const items = useMemo(
        () => [
            { key: 'list',      icon: <UnorderedListOutlined />,   label: 'Задачи' },
            { key: 'create',    icon: <PlusOutlined />,            label: 'Создание задачи' },
            { key: 'completed', icon: <CheckCircleOutlined />,     label: 'Архив' },
            { key: 'disk',      icon: <UserOutlined />,            label: 'Яндекс.Диск' },
            { key: 'quest',     icon: <QuestionCircleOutlined />,  label: 'Вопросы' },
        ],
        []
    );

    return (
        <Sider width={200} style={{ background: '#fff' }}>
            <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                items={items}
                onClick={(e) => {
                    const key = e.key; // string
                    setActiveTab(key);
                    if (key === 'list') {
                        setEditingTask(null);
                        form?.resetFields?.();
                    }
                }}
                style={{ height: '100%', borderRight: 0 }}
            />
        </Sider>
    );
}
