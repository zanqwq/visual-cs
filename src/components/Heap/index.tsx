// 大顶堆实现
import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, InputNumber } from "antd";
import { PlusOutlined, UpCircleOutlined } from "@ant-design/icons";
import anime from "animejs";
import { swap, flatGenerator } from "@/utils";

import "./index.less";

const nodeContainerClass = "heap__container";
const nodeClass = "heap__node";

/**
 * 如果一个堆有 n 个节点, 那么, 最多有 layer = floor(logn) 层 (从 0 开始数)
 * 对于节点 i :
 * top(i) = top(2 * i) - gutterVertical,
 * left(i) = (left(2 * i) + left(2 * i + 1)) / 2
 */

type NodePosition = { left: number; top: number };

/**
 *
 * @param a src array
 * @param d node diameter
 * @param gutterHor gutter horizontal
 * @param gutterVer gutter vertical
 * @returns NodePosition[]
 */
function getNodePosition(
  size: number,
  d: number,
  gutterHor: number,
  gutterVer: number
): NodePosition[] {
  if (size < 1) return [];
  const positions = [] as NodePosition[];
  const layer = Math.floor(Math.log2(size));
  positions.length = 2 ** (layer + 1);

  // 初始化最后一层的 position
  positions[2 ** layer] = { left: d / 2, top: layer * gutterVer };
  for (let i = 2 ** layer + 1; i < positions.length; i++) {
    positions[i] = {
      left: positions[i - 1].left + gutterHor,
      top: positions[i - 1].top,
    };
  }

  // 计算剩余节点位置
  for (let i = 2 ** layer - 1; i; i--) {
    positions[i] = {
      left: (positions[2 * i].left + positions[2 * i + 1].left) / 2,
      top: positions[2 * i].top - gutterVer,
    };
  }

  return positions;
}

// eslint-disable-next-line import/no-anonymous-default-export
export function Heap(props: {
  style?: React.CSSProperties;
  a?: number[];
  d?: number;
  gutterHor?: number;
  gutterVer?: number;
}) {
  const {
    style = undefined,
    a = [0],
    d = 50,
    gutterHor = 80,
    gutterVer = 100,
  } = props;

  // Note that h is an array,
  // remember that when the initial state is not a literal type,
  // then we are actually getting the ref of the state,
  // then if we call set method with the same ref, it will not cause rerender.
  // So, remember to use destruction whether in the yield statement or in the set method
  const [h, setH] = useState([...a]);
  const [ctx, setCtx] = useState({} as any);
  const [positions, setPositions] = useState(
    getNodePosition(getSize(a), d, gutterHor, gutterVer)
  );
  const [g, setG] = useState({ next: () => ({ done: true }) } as any);

  const [inputValue, setInputValue] = useState(0);

  const uRef = useRef(null as any),
    vRef = useRef(null as any);

  const [heapifying, setHeapifying] = useState(false);
  const [heapified, setHeapified] = useState(isEmpty(h));
  const [adding, setAdding] = useState(false);
  const [popping, setPopping] = useState(false);

  // use ref to create persitent promise,
  // otherwise it will be recreated when re-render
  const pRef = useRef(Promise.resolve(undefined as any));
  // use promise internally to manage animation progress
  const runAnimationController = () => {
    while (true) {
      let t = g.next();
      if (t.done) break;

      const { h, u, v, animType } = t.value;

      switch (animType) {
        case "swap":
          pRef.current = runSwapAnimation(pRef.current, { h, u, v });
          break;
        case "add":
          pRef.current = runAddAnimation(pRef.current, { h, v });
          break;
        case "pop":
          pRef.current = runPopAnimation(pRef.current, { h, u, v });
          break;
      }
    }

    pRef.current.then(() => {
      setHeapifying(false);
      setAdding(false);
      setPopping(false);
    });
  };
  const runSwapAnimation = (p: Promise<any>, info: any) => {
    const { h, u, v } = info;
    return p.then((data) => {
      const { newPositions = positions } = data || {};
      setCtx({ u, v });

      const animationU = anime({
        targets: uRef.current,
        background: [
          { value: "#aaf", duration: 1000 },
          { value: "#ddd", delay: 1000, duration: 1000 },
        ],
        left: { value: newPositions[v].left, delay: 1000, duration: 500 },
        top: { value: newPositions[v].top, delay: 1000, duration: 500 },
      });
      const animationV = anime({
        targets: vRef.current,
        background: [
          { value: "#faa", duration: 1000 },
          { value: "#ddd", delay: 1000, duration: 1000 },
        ],
        left: { value: newPositions[u].left, delay: 1000, duration: 500 },
        top: { value: newPositions[u].top, delay: 1000, duration: 500 },
      });

      return Promise.all([animationU.finished, animationV.finished])
        .then(() => {
          anime.set(uRef.current, {
            ...newPositions[u],
          });
          anime.set(vRef.current, {
            ...newPositions[v],
          });
          setH(h);
        })
        .then(() => ({ newPositions }));
    });
  };
  const runAddAnimation = (p: Promise<any>, info: any) => {
    const { h, v } = info;
    const newPositions = getNodePosition(getSize(h), d, gutterHor, gutterVer);
    setPositions(newPositions);

    return p.then(() => {
      setH(h);
      setCtx({ v });
      const animationV = anime({
        targets: vRef.current,
        background: [
          { value: "#faa", duration: 1500 },
          { value: "#ddd", duration: 1000 },
        ],
        left: newPositions[v].left,
        top: {
          value: [newPositions[v].top + 1000, newPositions[v].top],
          easing: "linear",
          duration: 500,
        },
      });
      return animationV.finished.then(() => ({ newPositions }));
    });
  };
  const runPopAnimation = (p: Promise<any>, info: any) => {
    const { h, u, v } = info;
    return p.then(() => {
      setCtx({ u, v });
      // u = 1, refer to the top node
      const animationU = anime({
        targets: uRef.current,
        // top: { value: positions[u].top - 1000, duration: 4000 },
        // opacity: { value: [1, 0], duration: 4000 },
        keyframes: [
          { background: "#aaf", duration: 1000 },
          { opacity: [1, 0], top: positions[u].top - 1000, duration: 1000 },
        ],
      });
      return animationU.finished.then(() => {
        const animationV = anime({
          targets: vRef.current,
          keyframes: [
            { background: "#faa", duration: 1000 },
            { left: positions[u].left, top: positions[u].top, duration: 1000 },
            { background: "#ddd", duration: 1000 },
          ],
        });
        return animationV.finished.then(() => {
          // reset
          anime.set(uRef.current, {
            background: "#ddd",
            ...positions[u],
            opacity: 1,
          });
          anime.set(vRef.current, { background: "#ddd", ...positions[v] });
          setH(h);
          const newPositions = getNodePosition(
            getSize(h),
            d,
            gutterHor,
            gutterVer
          );
          setPositions(newPositions);
          return { newPositions };
        });
      });
    });
  };

  useEffect(() => {
    runAnimationController();
  });

  useEffect(() => {
    setH([...a]);
  }, [a]);

  const onHeapifyClick = () => {
    setHeapifying(true);
    setHeapified(true);
    setG(flatGenerator(initHeap([...h])));
  };
  const onAddClick = () => {
    setAdding(true);
    setG(flatGenerator(add([...h], inputValue)));
  };
  const onPopClick = () => {
    setPopping(true);
    setG(flatGenerator(pop([...h])));
  };

  return (
    <>
      <Row gutter={10} style={{ marginBottom: 20 }}>
        <Col>
          <Button
            type="primary"
            onClick={onHeapifyClick}
            loading={heapifying}
            disabled={heapified}
          >
            {heapifying ? "Heapifying..." : heapified ? "Heapified" : "Heapify"}
          </Button>
        </Col>

        <Col>
          <InputNumber
            min={-99}
            max={99}
            value={inputValue}
            onChange={(val) => setInputValue(Number(val))}
          />
          <Button
            onClick={onAddClick}
            disabled={!heapified || heapifying || popping}
            loading={adding}
          >
            <PlusOutlined />
            {adding ? "Adding..." : "Add"}
          </Button>
        </Col>

        <Col>
          <Button
            onClick={onPopClick}
            disabled={!heapified || isEmpty(h) || heapifying || adding}
            loading={popping}
          >
            <UpCircleOutlined />
            {popping ? "Popping..." : "Pop"}
          </Button>
        </Col>
      </Row>

      {/* <Row gutter={10} style={{ marginBottom: 20 }}>
        <Col>
          <Button onClick={onStopClick}>Stop</Button>
        </Col>

        <Col>
          <Button onClick={onGoClick}>Go</Button>
        </Col>
      </Row> */}

      <Row>
        <div className={`${nodeContainerClass}`} style={style}>
          {h.map((num, i) =>
            i ? (
              <div
                key={i}
                ref={i === ctx.u ? uRef : i === ctx.v ? vRef : null}
                className={`${nodeClass} ${nodeClass}--${i}`}
                style={{
                  width: d,
                  height: d,
                  borderRadius: d,
                  ...positions[i],
                  // left: positions[i].left,
                  // top: positions[i].top,
                }}
              >
                {num}
              </div>
            ) : null
          )}
        </div>
      </Row>
    </>
  );
}

/*
Yield statement guide : 
1. yield the modified data
2. yield the operands
*/

//#region heap operation
// 从第一个非叶子节点开始做 down 操作, 复杂度为 O(n)
export function* initHeap(a: number[]) {
  // 最后一个节点编号为 n - 1, 其父节点为第一个非叶子节点
  for (let i = (a.length - 1) >> 1; i; i--) yield down(a, i);
}

export function* add(h: number[], val: number) {
  h.push(val);
  yield { h: [...h], v: h.length - 1, animType: "add" };
  yield up(h, h.length - 1);
}

export function* pop(h: number[]) {
  swap(h, 1, h.length - 1);

  h.length = h.length - 1;

  // yield the popped heap, but we still need the index of the swap node before popped to perform animation
  // so v must be h.length instead of h.length - 1 here
  yield { h: [...h], u: 1, v: h.length, animType: "pop" };

  yield down(h, 1);
}

export function* up(h: number[], v: number) {
  while (v >> 1 && h[v >> 1] < h[v]) {
    swap(h, v, v >> 1);

    yield { h: [...h], u: v >> 1, v, animType: "swap" };

    v >>= 1;
  }
}

export function* down(h: number[], u: number): any {
  const n = h.length;
  let t = u;

  if (2 * u < n && h[2 * u] > h[t]) t = 2 * u;
  if (2 * u + 1 < n && h[2 * u + 1] > h[t]) t = 2 * u + 1;

  if (u !== t) {
    swap(h, u, t);

    yield { h: [...h], u, v: t, animType: "swap" };

    yield down(h, t);
  }
}
//#endregion

//#region heap info
export function getSize(h: number[]) {
  if (isEmpty(h)) return 0;
  return h.length - 1;
}
export function isEmpty(h: number[]) {
  return h.length <= 1;
}
export function top(h: number[]) {
  if (isEmpty(h)) return null;
  return h[1];
}
//#endregion
