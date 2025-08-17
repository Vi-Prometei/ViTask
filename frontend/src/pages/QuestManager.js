import React, { useEffect, useMemo, useState } from 'react';
import {
    Form,
    Input,
    Button,
    List,
    message,
    Card,
    Space,
    Radio,
    Tabs,
    Divider,
    Popconfirm,
    Typography,
    Image,
    Badge,
    Progress,
    Row,
    Col,
    Tooltip,
    Segmented,
    Flex,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
} from '@ant-design/icons';
import api from '../api';

const { Text, Title } = Typography;
const { TextArea } = Input;


function OptionEditorCompact({ namePath, placeholder }) {
    return (
        <Form.Item
            name={namePath}
            style={{ marginBottom: 0 }}
            rules={[
                { required: true, message: 'Заполните строку' },
                { min: 1, message: 'Минимум 1 символ' },
                { max: 300, message: 'Максимум 300 символов' },
                {
                    validator: (_, v) =>
                        (v ?? '').trim().length === 0
                            ? Promise.reject(new Error('Пустые строки не допускаются'))
                            : Promise.resolve(),
                },
            ]}
        >
            <TextArea
                placeholder={placeholder}
                rows={3}
                showCount
                maxLength={300}
                allowClear
            />
        </Form.Item>
    );
}


export default function QuestManager() {
    const [questions, setQuestions] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // режим теста
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizChoice, setQuizChoice] = useState(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [score, setScore] = useState(0);

    // режим представления: «карточки» vs «список»
    const [viewMode, setViewMode] = useState('list');

    const [form] = Form.useForm();

    /* ======= API ======= */
    const fetchQuestions = async () => {
        setLoadingList(true);
        try {
            const res = await api.get('/api/quest');
            setQuestions(Array.isArray(res.data) ? res.data : []);
        } catch {
            message.error('Не удалось загрузить вопросы');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchQuestions(); }, []);

    useEffect(() => {
        // первичная инициализация, фиксируем предсказуемую высоту элементов
        form.setFieldsValue({ question: '', image_url: '', options: ['', ''], correct_index: undefined });
    }, [form]);

    /* ======= Создание ======= */
    const onFinish = async (values) => {
        try {
            setCreateLoading(true);

            const raw = values.options || [];
            const options = raw.map((x) => (x ?? '').trim());
            if (options.length < 2) {
                message.error('Нужно минимум 2 варианта ответа');
                return;
            }
            if (options.some((v) => v.length === 0)) {
                message.error('Пустые варианты не допускаются');
                return;
            }

            const correctIdx = Number(values.correct_index);
            if (Number.isNaN(correctIdx) || correctIdx < 0 || correctIdx >= options.length) {
                message.error('Отметьте правильный вариант');
                return;
            }

            const payload = {
                question: (values.question || '').trim(),
                image_url: (values.image_url || '').trim(),
                options,
                correct_answer: correctIdx,
            };

            await api.post('/api/quest', payload);
            message.success('Вопрос создан');
            form.resetFields();
            form.setFieldsValue({ question: '', image_url: '', options: ['', ''], correct_index: undefined });
            fetchQuestions();
        } catch {
            message.error('Ошибка при создании вопроса');
        } finally {
            setCreateLoading(false);
        }
    };

    const onFinishFailed = ({ errorFields }) => {
        const msg = errorFields?.[0]?.errors?.[0] || 'Проверьте форму';
        message.error(msg);
    };

    const deleteQuestion = async (id) => {
        try {
            await api.delete(`/api/quest/${id}`);
            message.success('Вопрос удалён');
            fetchQuestions();
        } catch {
            message.error('Ошибка при удалении вопроса');
        }
    };

    /* ======= Тест ======= */
    const currentQuestion = useMemo(() => questions[quizIndex], [questions, quizIndex]);
    const total = questions.length;
    const progress = total ? Math.round((quizIndex / total) * 100) : 0;

    const onCheckAnswer = () => {
        if (quizChoice == null) {
            message.info('Сначала выберите ответ');
            return;
        }
        setQuizChecked(true);
        if (quizChoice === currentQuestion?.correct_answer) {
            setScore((s) => s + 1);
        }
    };

    const onNextQuestion = () => {
        setQuizChoice(null);
        setQuizChecked(false);
        if (quizIndex + 1 < questions.length) {
            setQuizIndex((i) => i + 1);
        } else {
            message.success(`Тест завершён. Ваш результат: ${score + (quizChecked && quizChoice === currentQuestion?.correct_answer ? 1 : 0)}/${questions.length}`);
            setQuizIndex(0);
            setScore(0);
        }
    };

    /* ======= Стили/хелперы ======= */
    const shellCardStyle = {
        borderRadius: 16,
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(5,5,5,0.04)',
        marginBottom: 16,
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #f6f9ff, #ffffff)',
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 16,
        border: '1px solid rgba(5,5,5,0.04)',
    };

    const optionCard = (borderColor) => ({
        borderRadius: 12,
        border: borderColor ? `1px solid ${borderColor}` : '1px solid rgba(5,5,5,0.08)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    });

    /* ======= Вкладка: Управление ======= */
    const ManageTab = (
        <>
            <Card style={shellCardStyle} bodyStyle={{ paddingTop: 8 }}>
                <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Создать вопрос</Title>
                        <Text type="secondary">Добавьте текст, варианты и отметьте правильный</Text>
                    </div>
                    <Segmented
                        size="middle"
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Список', value: 'list' },
                            { label: 'Карточки', value: 'cards' },
                        ]}
                    />
                </Flex>

                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{ options: ['', ''], correct_index: undefined, question: '', image_url: '' }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="question"
                        label="Вопрос"
                        rules={[
                            { required: true, message: 'Введите текст вопроса' },
                            { min: 10, message: 'Минимум 10 символов' },
                            { max: 500, message: 'Максимум 500 символов' },
                        ]}
                    >
                        <TextArea
                            placeholder="Например: Какой порт по умолчанию у PostgreSQL?"
                            rows={3}
                            showCount
                            maxLength={500}
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item name="image_url" label="URL изображения">
                        <Input placeholder="Ссылка на изображение" allowClear />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(p, c) => p.image_url !== c.image_url}>
                        {({ getFieldValue }) => {
                            const url = getFieldValue('image_url');
                            return url ? (
                                <div style={{ marginBottom: 12 }}>
                                    <Image src={url} alt="preview" width={360} fallback="" />
                                </div>
                            ) : null;
                        }}
                    </Form.Item>

                    <Divider orientation="left" style={{ marginTop: 8 }}>Варианты ответа</Divider>

                    <Form.Item
                        name="correct_index"
                        label="Правильный вариант"
                        rules={[{ required: true, message: 'Отметьте правильный вариант' }]}
                    >
                        <Radio.Group style={{ width: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Form.List name="options">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, idx) => (
                                                <div key={key} style={{ display: 'flex', gap: 8, width: '100%' }}>
                                                    <Radio value={idx} style={{ marginTop: 6 }} />

                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={name}                // ← ВАЖНО: без 'options' тут
                                                            rules={[
                                                                { required: true, message: 'Заполните строку' },
                                                                { min: 1, message: 'Минимум 1 символ' },
                                                                { max: 300, message: 'Максимум 300 символов' },
                                                                ({ getFieldValue }) => ({
                                                                    validator(_, v) {
                                                                        return (v ?? '').trim().length === 0
                                                                            ? Promise.reject(new Error('Пустые строки не допускаются'))
                                                                            : Promise.resolve();
                                                                    },
                                                                }),
                                                            ]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <TextArea
                                                                placeholder={`Вариант ответа ${idx + 1}`}
                                                                rows={3}
                                                                showCount
                                                                maxLength={300}
                                                                allowClear
                                                            />
                                                        </Form.Item>
                                                    </div>

                                                    <Tooltip title={fields.length <= 2 ? 'Минимум 2 варианта' : 'Удалить вариант'}>
                                                        <Button
                                                            danger
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => remove(name)}
                                                            disabled={fields.length <= 2}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            ))}

                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />}>
                                                    Добавить вариант
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>

                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={createLoading}>
                            Создать
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card style={shellCardStyle} bodyStyle={{ paddingTop: 8 }}>
                <Title level={4} style={{ marginTop: 0 }}>Список вопросов</Title>

                <List
                    loading={loadingList}
                    bordered={false}
                    dataSource={questions}
                    grid={viewMode === 'cards' ? { gutter: 16, column: 2 } : undefined}
                    locale={{ emptyText: 'Вопросов пока нет' }}
                    renderItem={(item) => {
                        const correctText =
                            Array.isArray(item.options) && item.options[item.correct_answer] != null
                                ? item.options[item.correct_answer]
                                : `#${item.correct_answer}`;

                        const content = (
                            <>
                                {item.image_url ? (
                                    <div style={{ margin: '6px 0' }}>
                                        <Image src={item.image_url} width={320} alt="question" fallback="" />
                                    </div>
                                ) : null}

                                <Typography.Paragraph type="secondary" style={{ marginBottom: 6 }}>
                                    Варианты:
                                </Typography.Paragraph>
                                <ol style={{ marginTop: 0 }}>
                                    {(item.options || []).map((opt, i) => (
                                        <li key={i}>{opt}</li>
                                    ))}
                                </ol>

                                <Typography.Text>
                                    Правильный ответ: <Typography.Text code>{correctText}</Typography.Text>
                                </Typography.Text>
                            </>
                        );

                        if (viewMode === 'cards') {
                            return (
                                <List.Item>
                                    <Card
                                        hoverable
                                        style={{ borderRadius: 14 }}
                                        actions={[
                                            <Popconfirm
                                                key="del"
                                                title="Удалить вопрос?"
                                                okText="Да"
                                                cancelText="Нет"
                                                onConfirm={() => deleteQuestion(item.id)}
                                            >
                                                <Button danger type="link" icon={<DeleteOutlined />}>
                                                    Удалить
                                                </Button>
                                            </Popconfirm>,
                                        ]}
                                    >
                                        <Title level={5} style={{ marginTop: 0 }}>{`${item.id}. ${item.question}`}</Title>
                                        {content}
                                    </Card>
                                </List.Item>
                            );
                        }

                        return (
                            <List.Item
                                style={{ paddingLeft: 0, paddingRight: 0 }}
                                actions={[
                                    <Popconfirm
                                        key="del"
                                        title="Удалить вопрос?"
                                        okText="Да"
                                        cancelText="Нет"
                                        onConfirm={() => deleteQuestion(item.id)}
                                    >
                                        <Button danger>Удалить</Button>
                                    </Popconfirm>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={<Typography.Text strong>{`${item.id}. ${item.question}`}</Typography.Text>}
                                    description={content}
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>
        </>
    );

    /* ======= Вкладка: Пройти ======= */
    const QuizTab = (
        <Card style={shellCardStyle} bodyStyle={{ paddingTop: 8 }}>
            {questions.length === 0 ? (
                <Text type="secondary">Нет вопросов для прохождения.</Text>
            ) : (
                <>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                        <Col>
                            <Space size="middle">
                                <Badge status="processing" text={`Вопрос ${quizIndex + 1} из ${questions.length}`} />
                                <Text type="secondary">Счёт: {score}</Text>
                            </Space>
                        </Col>
                        <Col style={{ minWidth: 200 }}>
                            <Progress percent={progress} size="small" showInfo={false} />
                        </Col>
                    </Row>

                    <div style={{ marginBottom: 12 }}>
                        <Title level={5} style={{ margin: 0 }}>{currentQuestion?.question}</Title>
                    </div>

                    {currentQuestion?.image_url ? (
                        <div style={{ marginBottom: 12 }}>
                            <Image src={currentQuestion.image_url} width={420} alt="question" fallback="" />
                        </div>
                    ) : null}

                    <Radio.Group
                        value={quizChoice}
                        onChange={(e) => setQuizChoice(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {(currentQuestion?.options || []).map((opt, idx) => {
                                const isCorrect = idx === currentQuestion?.correct_answer;
                                const isChosen = quizChoice === idx;
                                const borderColor =
                                    quizChecked && isChosen
                                        ? (isCorrect ? '#52c41a' : '#ff4d4f')
                                        : undefined;

                                return (
                                    <Card key={idx} size="small" style={optionCard(borderColor)}>
                                        <Space>
                                            <Radio value={idx} />
                                            <Text>{opt}</Text>
                                            {quizChecked && isChosen && isCorrect && (
                                                <CheckCircleTwoTone twoToneColor="#52c41a" />
                                            )}
                                            {quizChecked && isChosen && !isCorrect && (
                                                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                                            )}
                                        </Space>
                                    </Card>
                                );
                            })}
                        </Space>
                    </Radio.Group>

                    <Space style={{ marginTop: 16 }}>
                        {!quizChecked ? (
                            <Button type="primary" onClick={onCheckAnswer}>
                                Проверить
                            </Button>
                        ) : (
                            <Button type="primary" onClick={onNextQuestion}>
                                {quizIndex + 1 < questions.length ? 'Следующий вопрос' : 'Завершить'}
                            </Button>
                        )}

                        <Button
                            onClick={() => {
                                setQuizIndex(0);
                                setQuizChoice(null);
                                setQuizChecked(false);
                                setScore(0);
                            }}
                        >
                            Сбросить тест
                        </Button>
                    </Space>
                </>
            )}
        </Card>
    );


    const tabItems = [
        { key: 'manage', label: 'Управление', children: ManageTab },
        { key: 'quiz', label: 'Пройти', children: QuizTab },
    ];

    return (
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: 12 }}>
            <div style={headerStyle}>
                <Row align="middle" gutter={[12, 12]}>
                    <Col flex="auto">
                        <Title level={3} style={{ margin: 0 }}>Вопросы и тесты</Title>
                        <Text type="secondary">Создавайте вопросы и проходите тест — удобно и без дёрганий</Text>
                    </Col>
                    <Col>
                        <Badge
                            count={questions.length}
                            overflowCount={999}
                            style={{ backgroundColor: '#2f54eb' }}
                            title="Количество вопросов"
                        >
                            <div style={{ width: 40, height: 40 }} />
                        </Badge>
                    </Col>
                </Row>
            </div>

            <Tabs defaultActiveKey="manage" items={tabItems} />
        </div>
    );
}
