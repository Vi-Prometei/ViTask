import React, { useState, useEffect, useMemo } from 'react';
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
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleTwoTone, CloseCircleTwoTone, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function QuestManager() {
    const [questions, setQuestions] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizChoice, setQuizChoice] = useState(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [revealCorrect, setRevealCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [form] = Form.useForm();

    const fetchQuestions = async () => {
        setLoadingList(true);
        try {
            const res = await axios.get('/api/quest');
            setQuestions(Array.isArray(res.data) ? res.data : []);
        } catch {
            message.error('Не удалось загрузить вопросы');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // ---------- Создание вопроса ----------
    useEffect(() => {
        if (!form.getFieldValue('options')) {
            form.setFieldsValue({ options: ['', ''], correct_index: undefined });
        }
    }, [form]);

    const onFinish = async (values) => {
        try {
            setCreateLoading(true);

            const options = values.options || [];
            if (options.length < 2) {
                message.error('Нужно минимум 2 варианта ответа');
                return;
            }
            for (let i = 0; i < options.length; i++) {
                const v = (options[i] ?? '').trim();
                if (!v) {
                    message.error(`Вариант №${i + 1} пустой`);
                    return;
                }
                options[i] = v;
            }

            const correctIdx = values.correct_index;
            if (typeof correctIdx !== 'number' || correctIdx < 0 || correctIdx >= options.length) {
                message.error('Отметьте правильный вариант');
                return;
            }

            const payload = {
                question: (values.question || '').trim(),
                image_url: (values.image_url || '').trim(),
                options,
                correct_answer: correctIdx, // 0-based
            };

            await axios.post('/api/quest', payload);
            message.success('Вопрос создан');
            form.resetFields();
            form.setFieldsValue({ options: ['', ''], correct_index: undefined });
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
            await axios.delete(`/api/quest/${id}`);
            message.success('Вопрос удалён');
            fetchQuestions();
        } catch {
            message.error('Ошибка при удалении вопроса');
        }
    };

    // ---------- Пройти тест ----------
    const currentQuestion = useMemo(() => questions[quizIndex], [questions, quizIndex]);
    const total = questions.length;
    const progress = total ? Math.round((quizIndex / total) * 100) : 0;

    const onCheckAnswer = () => {
        if (quizChoice == null) {
            message.info('Сначала выберите ответ');
            return;
        }
        setQuizChecked(true);
        setRevealCorrect(false);
        if (quizChoice === currentQuestion?.correct_answer) {
            setScore((s) => s + 1);
        }
    };

    const onNextQuestion = () => {
        setQuizChoice(null);
        setQuizChecked(false);
        setRevealCorrect(false);
        if (quizIndex + 1 < questions.length) {
            setQuizIndex((i) => i + 1);
        } else {
            message.success(`Тест завершён. Ваш результат: ${score}/${questions.length}`);
            setQuizIndex(0);
            setScore(0);
        }
    };

    // ---------- UI helpers ----------
    const shellCardStyle = {
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        border: '1px solid rgba(5,5,5,0.06)',
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #f0f5ff, #fff)',
        borderRadius: 16,
        padding: '12px 16px',
        marginBottom: 16,
    };

    const optionCard = (borderColor) => ({
        borderRadius: 12,
        borderColor,
        transition: 'border-color 0.2s ease',
    });

    // ---------- Содержимое вкладок ----------
    const ManageTab = (
        <>
            <Card style={shellCardStyle} styles={{ body: { paddingTop: 8 } }}>
                <Title level={4} style={{ marginTop: 0 }}>Создать вопрос</Title>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{ options: ['', ''], correct_index: undefined }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="question"
                        label="Вопрос"
                        rules={[{ required: true, message: 'Введите текст вопроса' }]}
                    >
                        <TextArea
                            placeholder="Например: Какой порт по умолчанию у PostgreSQL?"
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            showCount
                            maxLength={500}
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item name="image_url" label="URL изображения (опционально)">
                        <Input placeholder="https://example.com/image.png" allowClear />
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
                                            {fields.map((field, idx) => (
                                                <Space
                                                    key={field.key}
                                                    align="start"
                                                    style={{ display: 'flex', width: '100%', gap: 8 }}
                                                >
                                                    <Radio value={idx} style={{ marginTop: 6 }} />
                                                    <Form.Item
                                                        {...field}
                                                        style={{ flex: 1, marginBottom: 8 }}
                                                        rules={[
                                                            { required: true, message: 'Заполните вариант' },
                                                            {
                                                                validator: (_, val) =>
                                                                    (val ?? '').trim().length === 0
                                                                        ? Promise.reject(new Error('Пустые строки не допускаются'))
                                                                        : Promise.resolve(),
                                                            },
                                                        ]}
                                                    >
                                                        <TextArea
                                                            placeholder={`Вариант ${idx + 1}`}
                                                            autoSize={{ minRows: 1, maxRows: 4 }}
                                                            showCount
                                                            maxLength={400}
                                                            allowClear
                                                        />
                                                    </Form.Item>

                                                    <Tooltip title={fields.length <= 2 ? 'Минимум 2 варианта' : 'Удалить вариант'}>
                                                        <Button
                                                            danger
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => remove(field.name)}
                                                            disabled={fields.length <= 2}
                                                        />
                                                    </Tooltip>
                                                </Space>
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

            <Divider />

            <Card style={shellCardStyle} styles={{ body: { paddingTop: 8 } }}>
                <Title level={4} style={{ marginTop: 0 }}>Список вопросов</Title>
                <List
                    loading={loadingList}
                    bordered={false}
                    dataSource={questions}
                    locale={{ emptyText: 'Вопросов пока нет' }}
                    renderItem={(item) => {
                        const correctText =
                            Array.isArray(item.options) && item.options[item.correct_answer] != null
                                ? item.options[item.correct_answer]
                                : `#${item.correct_answer}`;

                        return (
                            <List.Item
                                style={{ paddingLeft: 0, paddingRight: 0 }}
                                actions={[
                                    <Popconfirm
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
                                    description={
                                        <div>
                                            {item.image_url ? (
                                                <div style={{ margin: '6px 0' }}>
                                                    <Image src={item.image_url} width={320} alt="question" fallback="" />
                                                </div>
                                            ) : null}

                                            <Typography.Text type="secondary">Варианты:</Typography.Text>
                                            <ol style={{ marginTop: 4 }}>
                                                {(item.options || []).map((opt, i) => (
                                                    <li key={i}>{opt}</li>
                                                ))}
                                            </ol>

                                            <Typography.Text>
                                                Правильный ответ: <Typography.Text code>{correctText}</Typography.Text>
                                            </Typography.Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>
        </>
    );

    const QuizTab = (
        <Card style={shellCardStyle} styles={{ body: { paddingTop: 8 } }}>
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

                                // Подсветка: показываем только выбранный вариант.
                                // Правильный показываем лишь по кнопке "Показать правильный".
                                const borderColor =
                                    quizChecked && isChosen
                                        ? (isCorrect ? '#52c41a' : '#ff4d4f')
                                        : (revealCorrect && isCorrect ? '#52c41a' : undefined);

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
                                setRevealCorrect(false);
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
        {
            key: 'manage',
            label: 'Управление',
            children: ManageTab,
        },
        {
            key: 'quiz',
            label: 'Пройти',
            children: QuizTab,
        },
    ];

    return (
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: 12 }}>
            <div style={headerStyle}>
                <Row align="middle" gutter={[12, 12]}>
                    <Col flex="auto">
                        <Title level={3} style={{ margin: 0 }}>Вопросы и тесты</Title>
                        <Text type="secondary">Создавайте вопросы, а затем проходите тест во второй вкладке</Text>
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
