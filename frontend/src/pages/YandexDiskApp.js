import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, List, Spin, Button, Tooltip, Modal } from 'antd';
import { CloudOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';
import axios from 'axios';

export default function YandexDiskApp({ yaToken, onLogout }) {
    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const debouncedSearch = useMemo(
        () => debounce(async (query) => {
            if (!yaToken) return;
            setLoading(true);
            try {
                let url = '/api/disk/files';
                const params = {};
                if (query.length >= 3) params.q = query;
                const res = await axios.get(url, {
                    params,
                    headers: { 'Authorization': `Bearer ${yaToken}` }
                });
                setFiles(res.data.files || []);
            } catch { setFiles([]); }
            setLoading(false);
        }, 1000),
        [yaToken]
    );

    useEffect(() => { debouncedSearch(search); return debouncedSearch.cancel; }, [search, debouncedSearch]);

    useEffect(() => {
        if (!yaToken) return;
        setLoading(true);
        axios.get('/api/disk/files', {
            headers: { 'Authorization': `Bearer ${yaToken}` }
        }).then(res => setFiles(res.data.files || []))
            .catch(() => setFiles([]))
            .finally(() => setLoading(false));
    }, [yaToken]);

    const download = (file) => {
        window.open(`/api/disk/download?path=${encodeURIComponent(file.path)}`, '_blank');
    };

    const previewFile = async (file) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/disk/file', {
                params: { path: file.path },
                headers: { 'Authorization': `Bearer ${yaToken}` }
            });
            setPreview({ name: file.name, content: res.data.content });
        } catch { }
        setLoading(false);
    };

    return (
        <Card
            title={<span><CloudOutlined /> Яндекс.Диск <Button style={{ float: 'right' }} danger size="small" onClick={() => {localStorage.removeItem('ya_disk_token'); onLogout();}}>Выйти из Яндекса</Button></span>}
            bodyStyle={{ minHeight: 500 }}
        >
            <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по файлам (от 3 символов)"
                prefix={<SearchOutlined />}
                allowClear
                style={{ maxWidth: 400, marginBottom: 16 }}
            />
            <Spin spinning={loading}>
                <List
                    bordered
                    dataSource={files}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Tooltip title="Скачать">
                                    <Button icon={<DownloadOutlined />} size="small" onClick={() => download(item)} />
                                </Tooltip>,
                                <Tooltip title="Открыть содержимое">
                                    <Button size="small" onClick={() => previewFile(item)}>Открыть</Button>
                                </Tooltip>
                            ]}
                        >
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                            <span style={{ color: "#888", marginLeft: 12 }}>{item.path}</span>
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Файлы не найдены' }}
                />
            </Spin>
            <Modal
                title={preview?.name}
                open={!!preview}
                onCancel={() => setPreview(null)}
                footer={null}
                width={600}
            >
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto' }}>
                    {preview?.content}
                </pre>
            </Modal>
        </Card>
    );
}
