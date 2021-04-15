import "./styles/index.less";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { Layout, Menu, Avatar, Row, Col } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

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
  console.log("file tree menu update");
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

export default function DefaultLayout(props: { children?: any }) {
  console.log("layout rerender");
  const [siderCollapsed, toggleSiderCollapse] = useState(false);

  const root = parseCtxToTreeNode(ctx);

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

            <Col span={22}>{/* TODO : */}</Col>
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
