import React from 'react';
import {Collapse, Space, Tooltip, Button, Popconfirm} from 'antd';
import {
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    RollbackOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const {Panel} = Collapse;

export default function TaskList({
                                     tasks,
                                     onComplete,
                                     onEdit,
                                     onDelete,
                                     completed = false
                                 }) {
    return (
        <Collapse accordion>
            {tasks.map((task) => {
                const deadline = dayjs(task.deadline);
                const created = dayjs(task.createdAt);
                const remaining = deadline.diff(dayjs(), 'day');
                return (
                    <Panel
                        key={task.id}
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <strong>{task.title} (#{task.id})</strong>
                                    <div style={{fontSize: 12, color: 'gray'}}>
                                        Создано: {created.format('DD.MM.YYYY HH:mm')}<br/>
                                        Дедлайн: {deadline.format('DD.MM.YYYY HH:mm')}<br/>
                                        Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Просрочено'}
                                    </div>
                                </div>
                                <Space>
                                    {!completed ? (
                                        <>
                                            <Tooltip title="Выполнить">
                                                <Button
                                                    type="text"
                                                    icon={<CheckCircleOutlined style={{fontSize: 20, color: 'green'}}/>}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        onComplete(task);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Редактировать">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined style={{fontSize: 20}}/>}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        onEdit(task);
                                                    }}
                                                />
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <Tooltip title="Вернуть">
                                            <Button
                                                type="text"
                                                icon={<RollbackOutlined style={{fontSize: 20, color: 'orange'}}/>}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onComplete(task);
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                    <Popconfirm
                                        title="Удалить задачу?"
                                        onConfirm={() => onDelete(task.id)}
                                        okText="Да"
                                        cancelText="Нет"
                                    >
                                        <Tooltip title="Удалить">
                                            <Button type="text" danger icon={<DeleteOutlined style={{fontSize: 20}}/>}/>
                                        </Tooltip>
                                    </Popconfirm>
                                </Space>
                            </div>
                        }
                    >
                        <p><strong>Описание:</strong><br/>{task.description}</p>
                        <p><strong>Создано:</strong> {created.format('DD.MM.YYYY HH:mm')}</p>
                        <p><strong>Дедлайн:</strong> {deadline.format('DD.MM.YYYY HH:mm')}</p>
                        <p>
                            <strong>Осталось:</strong> {remaining >= 0 ? `${remaining} дней` : 'Просрочено'}
                        </p>
                    </Panel>
                );
            })}
        </Collapse>
    );
}
