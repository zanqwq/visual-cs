import "./styles/index.less";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { useDispatch, useStore, useSelector } from "react-redux";
import {
  selectUserName,
  selectLogin,
  setName,
  setLogin,
} from "@/features/user/userSlice";

import {
  Layout,
  Menu,
  Avatar,
  Popover,
  Form,
  Input,
  Button,
  Row,
  Col,
} from "antd";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";

import lodash from "lodash";
import {
  ctx,
  parseCtxToTreeNode,
  isFile,
  curPath,
  FileTreeNode,
} from "@/utils";

const { Header, Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

function MenuChildren(props: { root: FileTreeNode }) {
  const { root } = props;

  let children = Object.keys(root);
  let index = children.findIndex((child) => child === "index.tsx");
  if (index !== -1) {
    [children[0], children[index]] = [children[index], children[0]]; // 将 index 放到 menu 首项
    children = [children[0], ...children.splice(1).sort()];
  }

  return (
    <>
      {children.map((child) => {
        const key = root[curPath] + "/" + child;

        let label = lodash
          .snakeCase(child.replace(".tsx", ""))
          .split("_")
          .map((word) => lodash.upperFirst(word))
          .join(" ");

        if (root[child] && root[child][isFile]) {
          return <Menu.Item key={key}>{label}</Menu.Item>;
        } else {
          return (
            root[child] && (
              <SubMenu key={key} title={label}>
                {MenuChildren({ root: root[child] })}
              </SubMenu>
            )
          );
        }
      })}
    </>
  );
}

function FileTreeMenu(props: { menuProps: any; root: FileTreeNode }) {
  const { menuProps, root } = props;
  const history = useHistory();
  return (
    <Menu
      mode={menuProps.mode}
      theme={menuProps.theme}
      onClick={({ key }) => {
        history.push(key.toString().replace(".tsx", "").replace("index", ""));
      }}
    >
      {MenuChildren({ root })}
      {/* <MenuChildren root={root} /> */}
      {/* ??? 为啥上面这样写不行, 因为这样在 React 组件树下会渲染出 MenuChildren ??? */}
      {/* Antd Menu 组件会严格检测它的子组件是否为 SubMenu MenuItem ... */}
    </Menu>
  );
}

// TODO : Menu Item 点不亮
export default function DefaultLayout(props: { children?: any }) {
  const [siderCollapsed, toggleSiderCollapse] = useState(false);

  const root = parseCtxToTreeNode(ctx);

  const store = useStore();
  const dispatch = useDispatch();
  const username = useSelector(selectUserName);
  const login = useSelector(selectLogin);
  const [inputUserName, setInputUserName] = useState("");
  const userPopover = (
    <Form style={{ width: 200, height: 400 }}>
      {!login && (
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username" }]}
        >
          <Input
            value={inputUserName}
            onChange={(e) => setInputUserName(e.target.value)}
            prefix={<UserOutlined />}
            placeholder="username"
          ></Input>
        </Form.Item>
      )}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          onClick={() => {
            if (!login) {
              if (inputUserName) {
                dispatch(setName(inputUserName));
                dispatch(setLogin(true));
                setPopoverVisible(false);
              }
            } else {
              dispatch(setName(""));
              dispatch(setLogin(false));
              setPopoverVisible(false);
            }
          }}
        >
          {login ? "Log out" : "Log In"}
        </Button>
      </Form.Item>
    </Form>
  );

  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <Layout style={{ height: "100vh" }} key="layout">
      <Sider trigger={null} collapsible collapsed={siderCollapsed} key="sider">
        <div className="logo">
          <Avatar size="large">V</Avatar>
        </div>

        <FileTreeMenu
          key="menu"
          menuProps={{ mode: "vertical", theme: "dark" }}
          root={root}
        />
      </Sider>

      <Layout className="site-layout" style={{ height: "100%" }}>
        <Header className="site-layout-background" style={{ paddingLeft: 0 }}>
          <Row>
            <Col span={2}>
              {React.createElement(
                !siderCollapsed ? MenuFoldOutlined : MenuUnfoldOutlined,
                {
                  className: "trigger",
                  onClick: () => toggleSiderCollapse(!siderCollapsed),
                }
              )}
            </Col>

            <Col span={20}>{/* TODO : */}</Col>
            <Col span={2}>
              <Row align="middle" justify="end" style={{ height: "100%" }}>
                <Popover
                  title={`Hello, ${login ? username : "title genius"}`}
                  content={userPopover}
                  placement="bottomLeft"
                  arrowPointAtCenter
                  visible={popoverVisible}
                  onVisibleChange={(visible) => setPopoverVisible(visible)}
                >
                  <Avatar
                    size="large"
                    style={{
                      cursor: "pointer",
                      background: login ? "#1890ff" : undefined,
                    }}
                  >
                    {login ? username.charAt(0) : <UserOutlined />}
                  </Avatar>
                </Popover>
              </Row>
            </Col>
          </Row>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
            padding: 24,
            height: "100%",
            overflow: "auto",
          }}
        >
          {props.children}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Visual-Computer-Science ©2021 Created by zanqwq
        </Footer>
      </Layout>
    </Layout>
  );
}
