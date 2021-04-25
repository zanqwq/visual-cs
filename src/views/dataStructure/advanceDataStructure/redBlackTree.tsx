import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Button, InputNumber } from "antd";
import { Graph /* Cell, Node, Edge, Shape */ } from "@antv/x6";
// import G6 from "@antv/g6";
import DefaultLayout from "@/layout/index";
import { getNodePosition } from "@/components/Heap";

const RED = true;
const BLACK = false;

type RbtNodeProps = {
  key: any;
  val: any;
  left: RbtNode | null;
  right: RbtNode | null;
  color: boolean;
};

class RbtNode {
  key: any;
  val: any;

  left: RbtNode | null = null;
  right: RbtNode | null = null;
  color: boolean;

  constructor(props: RbtNodeProps) {
    this.key = props.key;
    this.val = props.val;
    this.left = props.left;
    this.right = props.right;
    this.color = props.color;
  }
}

type RbtNode_LR = RbtNode & { left: RbtNode; right: RbtNode };
type RbtNode_L = RbtNode & { left: RbtNode };
type RbtNode_R = RbtNode & { right: RbtNode };

/*
Q1 : 为什么插入操作能够保证 2-3 树的完美平衡 ?
A1 : 通过允许存在双键节点 (即拥有 3 条度的三节点), 在插入时总是通过 "膨胀",
     使得节点度数增加, 再做适当调整, 使得树满足 2-3 树的基本性质, 且完美平衡.
     
     当出现 4 节点时, 通过提出 4 节点的 "中间键", 使得树长高, 以保证满足 2-3 树定义, 且完美平衡.
*/

export class Rbt {
  //#region root
  private root: RbtNode | null = null; // 根节点永远为黑节点
  public getRoot() {
    return this.root;
  }
  //#endregion

  //#region get
  get(key: any): any {
    return this._get(this.root, key);
  }
  private _get(h: RbtNode | null, key: any): any {
    if (h === null) return null;

    if (key === h.key) return h.val;
    else if (key < h.key) return this._get(h.left, key);
    else return this._get(h.right, key);
  }
  //#endregion

  //#region min/max key
  min() {
    if (this.root === null) return null;
    return this._min(this.root);
  }
  private _min(h: RbtNode): any {
    if (h.left === null) return h.key;
    return this._min(h.left);
  }
  max() {
    if (this.root === null) return null;
    return this._max(this.root);
  }
  private _max(h: RbtNode): any {
    if (h.right === null) return h.key;
    return this._max(h.right);
  }
  //#endregion

  //#region put
  put(key: any, val: any) {
    this.root = this._put(this.root, key, val);

    // 根节点总是黑节点
    this.root.color = BLACK;
  }
  // 向以 h 为根节点的子树 put 一个节点
  // 返回 put 后的 h 节点, 以便旋转操作后的调整
  private _put(h: RbtNode | null, key: any, val: any): RbtNode {
    if (h === null) {
      return new RbtNode({
        // 新的节点总是红色的, 对应着23树的节点膨胀
        key: key,
        val: val,
        left: null,
        right: null,
        color: RED,
      });
    }

    if (key < h.key) h.left = this._put(h.left, key, val);
    else if (key > h.key) h.right = this._put(h.right, key, val);
    else h.val = val;

    if (!this.isRed(h.left) && this.isRed(h.right)) h = this.rotateL(h);
    if (this.isRed(h.left) && h.left && this.isRed(h.left.left))
      h = this.rotateR(h);
    // 如果将这行代码移到递归 putNode 上面,
    // 那么这棵左倾红黑树将一一对应一棵 2-3-4 树
    if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);

    return h;
  }
  //#endregion

  //#region delMin
  delMin() {
    if (this.root === null) return;

    this.root = this._delMin(this.root);
    if (this.root) this.root.color = BLACK;
  }
  private _delMin(h: RbtNode) {
    // 当 h.left 为 null 时, h.right 不为 null 是不合法的
    // 所以 h.left 为 null 时不用考虑接上 h.right
    // 直接 return null 来删除 h 即可
    if (h.left === null) return null;

    // 在递归调用 delMin 之前
    // 确保 h.left 或 h.left.left 可以变成红节点
    if (!this.isRed(h.left) && !this.isRed(h.left.left))
      h = this.moveRedLeft(h);

    // 递归删除, 断言 h.left 不为 null,
    // 因为 h.left 起始时不为 null, 而 moveRedLeft 不会将 h.left 变为 null
    h.left = this._delMin(h.left!);

    return this.fix(h);
  }
  private moveRedLeft(h: RbtNode) {
    // 断言 h 为 red, h.left & h.right 为 black
    this.flipColors(h);
    // 因为 h.left !== null, 为了平衡, 断言 h.right 必定不为 null
    if (this.isRed(h.right!.left)) {
      h.right = this.rotateR(h.right!);
      h = this.rotateL(h);
      this.flipColors(h);
    }
    return h;
  }
  //#endregion

  //#region delMax
  delMax() {
    if (this.root === null) return;

    this.root = this._delMax(this.root);
    if (this.root !== null) this.root.color = BLACK;
  }
  private _delMax(h: RbtNode) {
    // 在删除之前, 确保 h 或 h.right 为红
    if (this.isRed(h.left)) h = this.rotateR(h);

    // h.right 是黑色 null 节点,
    // 所以 h 是红节点
    // 所以 h.left 一定不是 null, 否则非法
    // 因此直接返回 null 来删除
    if (h.right === null) return null;

    // 在递归调用 delMax 前
    // 确保 h.right 或 h.right.right 可以变成红节点
    if (!this.isRed(h.right) && !this.isRed(h.right.left))
      h = this.moveRedRight(h);

    h.right = this._delMax(h.right!);

    return this.fix(h);
  }
  // 断言 h 是红节点, h.left 和 h.right 都是黑节点
  private moveRedRight(h: RbtNode) {
    this.flipColors(h);
    // h.right 不为 null, 所以断言 h.left 不为 null
    if (this.isRed(h.left!.left)) {
      h = this.rotateR(h);
      this.flipColors(h);
    }
    return h;
  }
  //#endregion

  //#region del by key
  del(key: any): void {
    if (this.root === null) return;

    this.root = this._del(this.root, key);
    if (this.root !== null) this.root.color = BLACK;
  }
  private _del(h: RbtNode, key: any): RbtNode | null {
    // key 小于当前节点 h 的 key, 则在递归删除前
    // 确保 h.left 或 h.left.left 可以变为红节点
    if (key < h.key) {
      // 如果 h.left 为 null, 那么对应 key 的节点不存在
      // 当前 h 节点不需要做任何操作, 并且不再继续递归
      if (h.left !== null) {
        if (!this.isRed(h.left) && !this.isRed(h.left.left))
          h = this.moveRedLeft(h);

        h.left = this._del(h.left!, key);
      }
    }
    // key >= 当前节点 h 的 key
    // (需要注意, key = h.key 时, h.right 是否为 null 需要区分)
    else {
      // 由于删除任意键的策略为: 用删除节点的右子树中的最小节点替换它
      // 因此, key = h.key 或 key > h.key 时, 都需要确保 h 或 h.right 为红节点
      // 因此, 第一步就是和 delMax 一样, 先 rotateR
      // 确保在删除前, h 或 h.right 为红节点
      if (this.isRed(h.left)) h = this.rotateR(h);

      // 当 key = h.key 且 h.right 为 null
      // 则直接删除 (h 为红节点且 h.right 为 null, 所以 h.left 为 null)
      if (key === h.key && h.right === null) return null;

      if (h.right !== null) {
        // 如果 key > h.key 或 key = h.key 但 h.right 不为 null
        // 那么, 需要在递归删除前, 确保 h.right 或 h.right.right 可以变成红节点
        if (!this.isRed(h.right) && !this.isRed(h.right.left))
          h = this.moveRedRight(h);

        // 当 key = h.key 且 h.right 不为 null
        // 将 h 修改为 h.right 这棵子树中的最小节点
        // 并删除 h.right 这棵子树中的最小节点
        if (key === h.key) {
          const minKey = this._min(h.right!);
          h.val = this._get(h.right, minKey); // 先修改 val, 后修改 key
          h.key = minKey;
          h.right = this._delMin(h.right!);
        } else h.right = this._del(h.right!, key);
      }
    }

    return this.fix(h);
  }
  //#endregion

  //#region util functions
  private isRed(node: RbtNode | null): boolean {
    if (node === null) return false;
    return node.color === RED;
  }
  private rotateL(h: RbtNode) {
    const x = h.right!; // 肯定对 h 做左旋操作时, h 有右儿子
    // 旋转
    h.right = x.left;
    x.left = h;

    // 修复颜色
    x.color = h.color;
    h.color = RED;

    return x;
  }
  private rotateR(h: RbtNode) {
    const x = h.left!;

    // 旋转
    h.left = x.right;
    x.right = h;

    // 修复颜色
    x.color = h.color;
    h.color = RED;

    return x;
  }
  // 对应将一个 4 节点分解, 将 4 节点中间的键提到父节点, 因此要d将 h 变成红节点
  private flipColors(h: RbtNode) {
    h.color = !h.color;
    h.left!.color = !h.left!.color;
    h.right!.color = !h.right!.color;
  }
  private fix(h: RbtNode) {
    if (this.isRed(h.right)) h = this.rotateL(h);
    if (this.isRed(h.left) && this.isRed((h.left as RbtNode).left))
      h = this.rotateR(h);
    if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);
    return h;
  }
  //#endregion
}

const convertRbtToData = (rbt: Rbt) => {
  console.log("convert", rbt.getRoot());
  const data = {
    nodes: [] as any[],
    edges: [] as any[],
  };

  const root = rbt.getRoot();
  if (root === null) return data;

  const getMaxNodeNo = (root: RbtNode, no: number) => {
    let res = no;
    if (root.left !== null) {
      res = Math.max(res, getMaxNodeNo(root.left, no * 2));
    }
    if (root.right !== null) {
      res = Math.max(res, getMaxNodeNo(root.right, no * 2 + 1));
    }
    return res;
  };

  const maxNo = getMaxNodeNo(root, 1);
  const positions = getNodePosition(maxNo, 50, 100, 100);

  const dfs = (root: RbtNode, no: number) => {
    data.nodes.push({
      id: `${root.key}`,
      shape: "circle",
      x: positions[no].left,
      y: positions[no].top,
      width: 50,
      height: 50,
      label: `${root.key}`,
      attrs: {
        body: {
          fill: `${root.color === RED ? "#faa" : "#000"}`,
          stroke: `${root.color === RED ? "#faa" : "#000"}`,
        },
        label: {
          text: `${root.key}`,
          fill: "#fff",
        },
      },
    });

    if (root.left !== null) {
      data.edges.push({
        source: `${root.key}`,
        target: `${root.left.key}`,
        attrs: {
          line: {
            stroke: `${root.left.color === RED ? "#faa" : "#000"}`,
          },
        },
      });

      dfs(root.left, no * 2);
    }
    if (root.right !== null) {
      data.edges.push({
        source: `${root.key}`,
        target: `${root.right.key}`,
      });

      dfs(root.right, no * 2 + 1);
    }
  };

  dfs(root, 1);

  return data;
};

const Page = function () {
  const [putKey, setPutKey] = useState(0 as any);
  const [delKey, setDelKey] = useState(0 as any);
  const [rbt, setRbt] = useState(new Rbt());
  const containerRef = useRef(null as any);

  useEffect(() => {
    if (containerRef.current === null) {
      containerRef.current = document.getElementById("rbt-container");
    }
    // const width = container.clientWidth;
    // const height = container.clientHeight;

    const graph = new Graph({
      container: containerRef.current,
      background: {
        color: "#fff",
      },
      panning: {
        enabled: true,
      },
      mousewheel: {
        enabled: true,
        modifiers: ["ctrl", "meta"],
      },
    });

    const data = convertRbtToData(rbt);

    graph.fromJSON(data);

    return () => {
      // 销毁画布
      graph.dispose();
    };
  });

  return (
    <DefaultLayout>
      <h1>Red Black Tree</h1>
      <Row gutter={10}>
        <Col>
          <InputNumber
            value={putKey}
            onChange={(val) => setPutKey(Number(val))}
          ></InputNumber>
          <Button
            onClick={() => {
              console.log("put");
              rbt.put(putKey, putKey);
              setPutKey("");
            }}
          >
            Put
          </Button>
        </Col>
        {/* <Col>
          <InputNumber
            value={delKey}
            onChange={(val) => setDelKey(Number(val))}
          ></InputNumber>
          <Button
            onClick={() => {
              console.log("delete");
              rbt.del(delKey);
              console.log(rbt.getRoot());

              setDelKey("");
            }}
          >
            Delete
          </Button>
        </Col> */}
      </Row>

      {/* <Rbt /> */}
      <div
        id="rbt-container"
        style={{ width: "100%", height: "100%", marginTop: 50 }}
      ></div>
    </DefaultLayout>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
