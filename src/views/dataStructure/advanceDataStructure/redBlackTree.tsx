import React from "react";

const Page = function () {
  return (
    <>
      <h1>Red Black Tree</h1>

      {/* <Rbt /> */}
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

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

/*
Q1 : 为什么插入操作能够保证 2-3 树的完美平衡 ?
A1 : 通过允许存在双键节点 (即拥有 3 条度的三节点), 在插入时总是通过 "膨胀",
     使得节点度数增加, 再做适当调整, 使得树满足 2-3 树的基本性质, 且完美平衡.
     
     当出现 4 节点时, 通过提出 4 节点的 "中间键", 使得树长高, 以保证满足 2-3 树定义, 且完美平衡.
*/

export class Rbt {
  // 根节点总是黑节点
  private root: RbtNode | null = null;

  put(key: any, val: any) {
    this.root = this.putNode(this.root, key, val);

    // 根节点总是黑节点
    this.root.color = BLACK;
  }

  // 向以 h 为根节点的子树 put 一个节点
  // 返回 put 后的 h 节点, 以便旋转操作后的调整
  private putNode(h: RbtNode | null, key: any, val: any): RbtNode {
    console.log("putNode", h, key, val);
    debugger;
    if (h === null) {
      return new RbtNode({
        key: key,
        val: val,
        left: null,
        right: null,
        color: RED,
      });
    }

    if (key < h.key) h.left = this.putNode(h.left, key, val);
    else if (key > h.key) h.right = this.putNode(h.right, key, val);
    else h.val = val;

    // 由于如果可以左旋, 则进行左旋
    if (!this.isRed(h.left) && this.isRed(h.right)) h = this.rotateL(h);
    //  因此下面 h.left 不为 null. h.left.left 不会报错
    if (this.isRed(h.left) && this.isRed((h.left as RbtNode).left))
      h = this.rotateR(h);
    // 如果将这行代码移到递归 putNode 上面, 那么这棵左倾红黑树将 1-1 对应一棵 2-3-4 树
    if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);

    return h;
  }

  get(key: any): any {
    return this.getVal(this.root, key);
  }
  private getVal(h: RbtNode | null, key: any): any {
    if (h === null) return null;

    if (key === h.key) return h.val;
    else if (key < h.key) return this.getVal(h.left, key);
    else return this.getVal(h.right, key);
  }

  // 返回最小/最大键
  min() {
    if (this.root === null) return null;
    return this.minKey(this.root);
  }
  minKey(h: RbtNode): any {
    if (h.left === null) return h.key;
    return this.minKey(h.left);
  }
  max() {
    if (this.root === null) return null;
    return this.maxVal(this.root);
  }
  maxVal(h: RbtNode): any {
    if (h.right === null) return h.key;
    return this.maxVal(h.right);
  }

  // set(key: any, val: any) {

  // }

  // 不变性 : 保证当前节点 h 或 h.right 之一为红节点
  delMax() {
    if (this.root === null) return;

    this.root = this.delMaxNode(this.root);
    if (this.root !== null) this.root.color = BLACK;
  }
  delMaxNode(h: RbtNode) {
    // 将左红链接进行右旋转
    if (this.isRed(h.left)) h = this.rotateR(h);

    // h.right 为 null, 则 h 为删除节点
    // 且经过上面以及下面的操作, 此时 h 必定在 2-3 树中
    // 不是一个 2 节点, 可以直接删除
    if (h.right == null) return null;

    // 1. 当 h.right 为红色, 那么不变性满足, 不用处理
    // 2. 当 h.right 不为红色, 说明此时 h 为红色
    if (!this.isRed(h.right) && !this.isRed(h.right.left))
      h = this.moveRedRight(h);

    // 递归删除
    h.right = this.delMaxNode(h.right as RbtNode);

    // 记得修复
    return this.fixUp(h);
  }
  // 断言 h 是红节点, h.left 和 h.right 都是黑节点
  moveRedRight(h: RbtNode) {
    this.flipColors(h);
    if (this.isRed((h.left as RbtNode).left)) {
      h = this.rotateR(h);
      this.flipColors(h);
    }
    return h;
  }

  delMin() {
    if (this.root === null) return;

    this.root = this.delMinNode(this.root);
    if (this.root) this.root.color = BLACK;
  }
  delMinNode(h: RbtNode) {
    if (h.left === null) return null;

    if (!this.isRed(h.left) && !this.isRed((h.left as RbtNode).left))
      h = this.moveRedLeft(h);

    // 递归删除
    h.left = this.delMinNode(h.left as RbtNode);

    return this.fixUp(h);
  }
  moveRedLeft(h: RbtNode) {
    this.flipColors(h);
    if (this.isRed((h.right as RbtNode).left)) {
      h.right = this.rotateR(h.right as RbtNode);
      h = this.rotateL(h);
      this.flipColors(h);
    }
    return h;
  }

  // del(k: any): void {
  //   if (this.root === null) return;
  //   this.root = this.delNode(this.root, k);
  //   if (this.root !== null) this.root.color = BLACK;
  // }
  // delNode(h: RbtNode, k: any): RbtNode | null {
  //   if (k < h.k) {
  //     // 向左删除, 并且保持 h 或 h.left 为红
  //     if (!this.isRed(h.left) && !this.isRed((h.left as RbtNode).left))
  //       h = this.moveRedLeft(h);
  //     h.left = this.delNode(h.left as RbtNode, k);
  //   } else {
  //     if (this.isRed(h.left)) h = this.rotateR(h);

  //     // 如果当前节点 h 为删除节点且 h.right 为空
  //     // 那么根据不变性, h 此时为红节点(why h.left ?), 直接删除
  //     if (k === h.k && h.right === null) return null;

  //     if (!this.isRed(h.right) && !this.isRed((h.right as RbtNode).left))
  //       h = this.moveRedRight(h);

  //     // 如果当前节点 h 为删除节点且 h 不在底部, 则
  //     // 通过删除最小节点操作 delMin,
  //     // 将当前节点 h 替换成最小节点
  //     if (k === h.k) {
  //       h.v = this.getVal(h.right, k);
  //       h.k = this.minKey(h.right);
  //       h.right = this.delMin(h.right);
  //     } else h.right = this.delNode(h.right, k);
  //   }

  //   return this.fixUp(h);
  // }

  //#region util functions
  private isRed(node: RbtNode | null): boolean {
    if (node === null) return false;
    return node.color === RED;
  }
  private rotateL(h: RbtNode) {
    const x: RbtNode = h.right as RbtNode; // 肯定对 h 做左旋操作时, h 有右儿子
    // 旋转
    h.right = x.left;
    x.left = h;

    // 修复颜色
    x.color = h.color;
    h.color = RED;

    return x;
  }
  private rotateR(h: RbtNode) {
    const x: RbtNode = h.left as RbtNode;

    // 旋转
    h.left = x.right;
    x.right = x;

    // 修复颜色
    x.color = h.color;
    h.color = RED;

    return x;
  }
  // 对应将一个 4 节点分解, 将 4 节点中间的键提到父节点, 因此要d将 h 变成红节点
  private flipColors(h: RbtNode) {
    h.color = !h.color;
    (h.left as RbtNode).color = !(h.left as RbtNode).color;
    (h.right as RbtNode).color = (h.right as RbtNode).color;
  }
  private fixUp(h: RbtNode) {
    if (this.isRed(h.right)) h = this.rotateL(h);
    if (this.isRed(h.left) && this.isRed((h.left as RbtNode).left))
      h = this.rotateR(h);
    if (this.isRed(h.left) && this.isRed(h.right)) this.flipColors(h);
    return h;
  }
  //#endregion
}
