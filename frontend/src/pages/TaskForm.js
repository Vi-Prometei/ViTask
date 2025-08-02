import React from 'react';
import {Form, Input, DatePicker, Button} from 'antd';

const {TextArea} = Input;

export default function TaskForm({ form, onFinish, editingTask, loading, onCancel }) {
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{title: '', description: ''}}
        >
            <Form.Item name="title" label="Название задачи"
                       rules={[{required: true, message: 'Введите название'}]}>
                <Input placeholder="Название"/>
            </Form.Item>
            <Form.Item name="description" label="Описание задачи"
                       rules={[{required: true, message: 'Введите описание'}]}>
                <TextArea rows={4} placeholder="Описание"/>
            </Form.Item>
            <Form.Item name="deadline" label="Дедлайн"
                       rules={[{required: true, message: 'Выберите дату'}]}>
                <DatePicker showTime format="DD.MM.YYYY HH:mm"/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {editingTask ? 'Обновить задачу' : 'Создать задачу'}
                </Button>
                {editingTask && (
                    <Button
                        style={{marginLeft: 8}}
                        onClick={onCancel}
                    >
                        Отмена
                    </Button>
                )}
            </Form.Item>
        </Form>
    );
}
