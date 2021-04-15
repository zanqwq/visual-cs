import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  ctx,
  parseCtxToTreeNode,
  isFile,
  curPath,
  FileTreeNode,
} from "@/utils";

const root: FileTreeNode = parseCtxToTreeNode(ctx);

interface FileTreeNodeConsumer {
  consume: (node: FileTreeNode) => void;
}
// dfs
function walkFileTreeNode(
  root: FileTreeNode,
  nodeConsumer: FileTreeNodeConsumer
) {
  nodeConsumer.consume(root);
  // 递归出口为 Object.keys(root).length === 0
  Object.keys(root).forEach((pathSegment) => {
    walkFileTreeNode(root[pathSegment], nodeConsumer);
  });
}

const routes: any[] = [];
const routesAppender: FileTreeNodeConsumer = {
  consume(node: FileTreeNode) {
    if (node[isFile]) {
      const page = node[curPath]; // 蜜汁错误, 把 node[curPath] 套进 `` 字符串就会报错说 curPath is not defined, 我傻了

      const imported = import(`@/views${page}`);
      const Layout = React.lazy(() =>
        imported.then((res: any) => res.default.meta.layout)
      );
      const Page = React.lazy(() => imported);

      let path = node[curPath].replace(".tsx", "");
      if (path.endsWith("index")) path = path.substring(0, path.length - 5); // src/foo/index.tsx 匹配路由 /foo

      routes.push(
        <Route exact key={node[curPath]} path={path}>
          <React.Suspense fallback={null}>
            <Layout key="globalLayout">
              <Page />
            </Layout>
          </React.Suspense>
        </Route>
      );
    }
  },
};
walkFileTreeNode(root, routesAppender);

// 实现 nuxtjs 功能 :
// 1. /foo/bar 自动匹配 src/views/foo/bar/index.tsx
// 2. /foo/:id 自动匹配 src/views/foo/_id.tsx (动态路由)

export default function GlobalRouter() {
  return (
    <Router>
      <Switch>{routes}</Switch>
    </Router>
  );
}
