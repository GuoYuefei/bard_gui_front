import React from 'react'
import { Form, Tooltip, Icon, Input, Button, Row, Col, Select, InputNumber, message, Switch, Popconfirm } from 'antd'
import yaml from 'js-yaml'
import { api_host } from '../config'

const { Item } = Form
const { Option } = Select

class BardConfigForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            config: null,
            plugins_list: null,
            status: false,
            switchLoading: false,
            restartLoading: false,
            installLoading: false,
        }
    }

    componentDidMount() {
        this.loadingPlugins()
        this.loading()
        this.timer_status()
    }

    componentWillUnmount() {
        // 清除定时器
        this.interval && clearInterval(this.interval);
    }

    loading = async () => {
        const response = await fetch(api_host + '/bard/config/get')
        const data = await response.text();
        // console.log("收到的config:", data)

        const config = yaml.safeLoad(data)
        // console.log(config)
        this.setState({ config })
    }

    loadingPlugins = async () => {
        const response = await fetch(api_host + '/plugins/get')
        const data = await response.text();
        const plugins_list = yaml.safeLoad(data);
        // console.log(plugins_list)

        this.setState({ plugins_list })
    }

    // 这个
    timer_status = () => {
        this.loaddingStatus()
        this.interval = setInterval(this.loaddingStatus, 3000);
    }

    loaddingStatus = async () => {
        const response = await fetch(api_host + '/bard/status')
        const data = await response.json();

        if(data.code === 1) {
            this.setState({
                status: false,
            })
        } else if(data.code === 0) {
            this.setState({
                status: true
            })
        }
        
    }

    saveConfig = () => {
        
        const values = this.formData()

        // console.log("==>", values)
        // console.log("======>", yaml.safeDump(values))

        fetch(api_host + '/bard/config/update', {
            method: 'POST',
            body: yaml.safeDump(values),
        }).then((response) => {
            // 成功了就干嘛干嘛的
            // console.log(response)
            return response.json()
        },(error) => {
            message.error('数据传送发生错误[1]');
        }).then((data) => {
            switch(data.code) {
                case 0: message.success('保存配置成功');break;
                case 1: message.error('无法读取到保存数据');break;
                case 2: message.error('无法读取到配置文件信息');break;
                default: message.error('发生其他错误')
            }
        }, (error) => {
            message.error('回复消息出错，无法解析')
        }).catch((error) => {
            message.error('数据传送发生错误[2]')
        })
    }

    formData = () => {
        // 形成数据并返回
        let config = this.state.config

        this.props.form.validateFields((errors, values) => {
            if(errors) {
                // 存在错误 提示
                message.error('输入存在错误');
            }
            // console.log(values)
            // 这里还是手动组装传输数据
            config.server = values.server
            config.server_port = values.server_port
            config.local_address = values.local_address
            config.local_port = values.local_port
            config.users[0].username = values.username
            config.users[0].password = values.password
            config.users[0].com_config.plugins = values.plugins
            config.users[0].com_config.TCSP = values.TCSP
        })

        return config
    }

    do = (uri, tips1, tips2, tips3, callback1, callback2) => {
        fetch(api_host + uri, {
            method: 'POST',
        }).then((response) => {
            return response.json()
        }, err => {
            message.error(tips1)
        }).then(data => {
            if(data.code === 0) {
                // ==0 无错
                message.success(data.message)
                callback1&&callback1()
                callback2&&callback2()
            } else {
                callback2&&callback2()
                message.error(data.message)
            }
        }, error => {
            callback2&&callback2()
            // go程序错误，非shell程序错误
            message.error(tips2)
        }).catch( err => {
            callback2&&callback2()
            message.error(tips3)
        })
    }

    // 打开bard
    open = () => {
        this.do(
            '/bard/start', 
            "数据接收错误， bard是否打开未知",
            "打开bard失败",
            "数据发送失败，打开bard失败",
            this.loaddingStatus,
            () => {
                this.setState({
                    switchLoading: false,
                })
            },
        )
    }

    // 关闭bard
    close = () => {
        this.do(
            '/bard/stop', 
            "数据接收错误， bard是否关闭未知",
            "关闭bard失败",
            "数据发送失败，关闭bard失败",
            this.loaddingStatus,
            () => {
                this.setState({
                    switchLoading: false,
                })
            },
        )
    }
    
    onSwitch = (checked) => {
        this.setState({
            switchLoading: true,
        })
        if(checked) {
            this.open()
        } else {
            this.close()
        }
    }

    // 重启bard
    restart = () => {
        this.setState({
            switchLoading: true,
            restartLoading: true,
        })
        this.do(
            '/bard/restart', 
            "数据接收错误， bard是否打开未知",
            "重新启动bard失败",
            "数据发送失败，重新启动bard失败",
            this.loaddingStatus,
            () => {
                this.setState({
                    switchLoading: false,
                    restartLoading: false,
                })
            },
        )
    }

    // 安装bard
    install = () => {
        this.setState({
            installLoading: true,
        })
        this.do(
            '/bard/install', 
            "数据接收错误， bard是否安装未知未知",
            "安装bard失败",
            "数据发送失败，安装bard失败",
            this.loading,
            () => {
                this.setState({
                    installLoading: false,
                })
            }
        )
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

        // switch 根据状态改变颜色
        const switchStyle = this.state.status ? { backgroundColor: "rgba(0, 255, 0, 1)"} : {}; 

        const { getFieldDecorator, setFieldsValue } = this.props.form;

        const {
            plugins: plugins_list = [],
            TCSP: TCSP_list = [],
        } = this.state.plugins_list || {}

        const {
            server,
            server_port,
            local_address,
            local_port,
            users=[],
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
                    })(<Input.Password 
                        onChange={v => {
                            setFieldsValue({ server: v })
                        }}
                    />)}
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
                        rules: [{ required: true, message: 'Please input your server port!' }],
                    })(<InputNumber
                        style={{ width: '100%' }}
                        min={1} max={65535}
                        onChange={v => {
                            setFieldsValue({ server_port: v })
                        }} />
                    )}
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
                    })(<Input 
                        onChange={v => {
                            setFieldsValue({ username: v })
                        }}
                    />)}
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
                    })(<Input.Password 
                        onChange={v => {
                            setFieldsValue({ password: v })
                        }}
                    />)}
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
                    })(<Input 
                        onChange={v => {
                            setFieldsValue({ local_address: v })
                        }}
                    />)}
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
                        rules: [{ required: true, message: 'Please input your local port!' }],
                    })(
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1} max={65535}
                            onChange={v => {
                                setFieldsValue({ local_port: v })
                            }}
                        />
                    )}
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
                        // rules: [{ required: true, message: 'Please enter the plug-in for communication!', whitespace: true }],
                    })(<Select
                        mode="multiple"
                        placeholder="Please select"
                        onChange={(v)=>{
                            // console.log(v)
                            setFieldsValue({ plugins: v })
                        }}
                      >
                        {plugins_list.map((v, i) => (
                            <Option key={i} value={v}>{v}</Option>
                        ))}
                      </Select>)}
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
                        // TODO 应该要在用户输入plugins之后限定rules
                        // rules: [{ required: true, message: 'Please input your SubProtocol!', whitespace: true }],
                    })(<Select
                        showSearch
                        placeholder="插件配置不为空时，该项也不得为空"
                        optionFilterProp="children"
                        allowClear
                        onChange={(v) => {
                            setFieldsValue({ TCSP: v })
                        }}
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                          {
                              TCSP_list.map((v, i) => (
                                  <Option value={v} key={i}>{v}</Option>
                              ))
                          }
                      </Select>)}
                </Item>

                <Row style={{ paddingBottom: 8}}>
                    <Col lg={{span: 5, offset: 4}}>
                        <Button type="primary" htmlType="submit" onClick={this.saveConfig}>
                            保存配置
                        </Button>
                    </Col>
                    
                    {/* <Col span={5}>
                        <Button type="primary" htmlType="submit" onClick={this.open}>
                            打开bard
                        </Button> 
                    </Col>
                    <Col span={5}>
                        <Button type="primary" htmlType="submit" onClick={this.close}>
                            关闭bard
                        </Button>
                    </Col> */}

                    <Col span={5}>
                    <Popconfirm
                        title="确定重新安装?(覆盖配置)"
                        onConfirm={this.install}
                        // onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" htmlType="submit" 
                            loading={this.state.installLoading}
                        >
                            安装bard
                        </Button>
                    </Popconfirm>
                        
                    </Col>

                    <Col span={5}>
                        <Button type="primary" htmlType="submit" onClick={this.restart}
                            loading={this.state.restartLoading}
                        >
                            重启bard
                        </Button>
                    </Col>

                    <Col lg={5} style={{ paddingTop: 5, paddingLeft: 15 }}>
                        <Switch style={ switchStyle }
                            checked={this.state.status}
                            onChange={this.onSwitch}
                            loading={this.state.switchLoading}
                        >
                          
                        </Switch>
                    </Col>
                </Row>   
            </Form>
        )
    }
}

export default Form.create({ name: 'register' })(BardConfigForm);
