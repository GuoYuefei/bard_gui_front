import React from 'react'
import { Form, Tooltip, Icon, Input, Button, Row, Col } from 'antd'
import yaml from 'js-yaml'

const { Item } = Form

class BardConfigForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            config: null
        }
    }

    componentDidMount() {
        this.loading()
    }

    loading = async () => {
        const response = await fetch('http://localhost:2019/bard/config/get')
        const data = await response.text();

        const config = yaml.safeLoad(data)
        console.log(config)
        this.setState({ config })
    }

    

    render() {

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 21 },
            },
        };

        const { getFieldDecorator } = this.props.form;

        const {
            server,
            server_port,
            local_address,
            local_port,
            users,
        } = this.state.config || {}

        const {
            username,
            password,
            com_config,
        } = users[0] || {}

        const {
            plugins = [],
            TCSP = "",
        } = com_config || {}

        return (
            <Form {...formItemLayout}>
                <Item
                    label={
                        <span>
                            服务器&nbsp;
                            <Tooltip title="你的服务器ip或者域名">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('server', {
                        initialValue: server,
                        rules: [{ required: true, message: 'Please input your server ip or domian!', whitespace: true }],
                    })(<Input.Password />)}
                </Item>

                <Item
                    label={
                        <span>
                            服务端口&nbsp;
                            <Tooltip title="你的服务器端口">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('server_port', {
                        initialValue: server_port,
                        rules: [{ required: true, message: 'Please input your server port!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Item
                    label={
                        <span>
                            用户名&nbsp;
                            <Tooltip title="服务器端配置的用户名">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('username', {
                        initialValue: username,
                        rules: [{ required: true, message: 'Please input your username!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Item
                    label={
                        <span>
                            密码&nbsp;
                            <Tooltip title="对应用户名的密码">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('password', {
                        initialValue: password,
                        rules: [{ required: true, message: 'Please input your password!', whitespace: true }],
                    })(<Input.Password />)}
                </Item>


                <Item
                    label={
                        <span>
                            客户端&nbsp;
                            <Tooltip title="一般为127.0.0.1">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('local_address', {
                        initialValue: local_address,
                        rules: [{ required: true, message: 'Please input your local ip!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Item
                    label={
                        <span>
                            客户端口&nbsp;
                            <Tooltip title="你的客户端端口">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('local_port', {
                        initialValue: local_port,
                        rules: [{ required: true, message: 'Please input your local port!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Item
                    label={
                        <span>
                            插件&nbsp;
                            <Tooltip title="通讯使用的插件">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('plugins', {
                        initialValue: plugins,
                        rules: [{ required: true, message: 'Please enter the plug-in for communication!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Item
                    label={
                        <span>
                            子协议&nbsp;
                            <Tooltip title="通讯使用的子协议">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    }
                >
                    {getFieldDecorator('TCSP', {
                        initialValue: TCSP,
                        rules: [{ required: true, message: 'Please input your SubProtocol!', whitespace: true }],
                    })(<Input />)}
                </Item>

                <Row style={{ paddingBottom: 8}}>
                    <Col lg={{span: 5, offset: 4}}>
                        <Button type="primary" htmlType="submit">
                            保存配置
                        </Button>
                    </Col>
                    <Col span={5}>
                        <Button type="primary" htmlType="submit">
                            打开bard
                        </Button> 
                    </Col>
                    <Col span={5}>
                        <Button type="primary" htmlType="submit">
                            关闭bard
                        </Button>
                    </Col>
                    <Col span={5}>
                        <Button type="primary" htmlType="submit">
                            重启bard
                        </Button>
                    </Col>
                </Row>
                    

            </Form>
        )
    }
}

export default Form.create({ name: 'register' })(BardConfigForm);
