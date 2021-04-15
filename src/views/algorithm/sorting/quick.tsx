import React, { useState } from "react";
import { Button, Row, Col, Alert, Tag } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { getRandomArr, flatGenerator, swap } from "@/utils";
import { BoxContainer, BoxItem } from "@/components/Box";

const Page = function () {
  const [a, setA] = useState(getRandomArr(30, [10, 30]));
  const [ctx, setCtx] = useState({} as any);
  const [g, setG] = useState(flatGenerator(quickSort([...a])));

  const [timeId, setTimeId] = useState(null as any);
  const [isSorting, setSorting] = useState(false);
  const [isStop, setStop] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const onNewClick = () => {
    const newA = getRandomArr(30, [10, 30]);
    const newG = flatGenerator(quickSort([...newA]));
    setA(newA);
    setCtx({} as any);
    setG(newG);
    if (timeId) clearInterval(timeId);
    setTimeId(null);

    setSorting(false);
    setStop(false);
    setHasNext(true);
  };

  const startAutoSorting = () => {
    setSorting(true);
    const id = setInterval(() => {
      let t = g.next();
      if (t.done) {
        clearTimeout(id);
        setTimeId(null);
        setSorting(false);
        setStop(false);
        setHasNext(false);
        return;
      }
      const { l, r, x, i, j, a } = t.value;
      setA(a);
      setCtx({ l, r, x, i, j });
    }, 500);
    setTimeId(id);
  };
  const onSortClick = () => {
    startAutoSorting();
  };

  const onStopClick = () => {
    setStop(!isStop);
    if (!isStop && timeId) {
      clearTimeout(timeId);
      setTimeId(null);
    } else startAutoSorting();
  };

  const onNextClick = () => {
    const t = g.next();
    if (t.done) {
      setSorting(false);
      setStop(false);
      setHasNext(false);
      return;
    }
    const { l, r, x, i, j, a } = t.value;
    setA(a);
    setCtx({ l, r, x, i, j });
  };

  const Color = {
    ltI: "#DCEDFF", // 灰
    eqI: "#1E55B5", // 最亮

    gtJ: "#F4D2D2", // 灰
    eqJ: "#E76262", // 最亮
  };
  const getBackgroundColor = (idx: number) => {
    if (idx < ctx.l || idx > ctx.r) return "#ddd";
    if (idx === ctx.i) return Color.eqI;
    if (idx < ctx.i) return Color.ltI;
    if (idx === ctx.j) return Color.eqJ;
    if (idx > ctx.j) return Color.gtJ;
    return "#ddd";
  };

  const getIndicator = (idx: number) => {
    const tmp = [] as string[];
    if (idx === ctx.l) tmp.push("L");
    if (idx === ctx.r) tmp.push("R");
    if (!tmp.length) return null;
    return (
      <>
        <ArrowUpOutlined />
        <div>{tmp.join(",")}</div>
      </>
    );
  };

  return (
    <>
      <h1>Quick Sort</h1>
      <Row gutter={10} style={{ marginBottom: "10px" }}>
        <Col>
          <Button type="primary" onClick={onNewClick}>
            New
          </Button>
        </Col>

        <Col>
          <Button
            disabled={isSorting || !hasNext}
            loading={isSorting}
            onClick={onSortClick}
          >
            {!hasNext ? "Done" : !isSorting ? "Sort" : "Sorting..."}
          </Button>
        </Col>

        <Col>
          <Button disabled={!isSorting} danger={!isStop} onClick={onStopClick}>
            {!isStop ? "Stop" : "Go"}
          </Button>
        </Col>

        <Col>
          <Button
            type="primary"
            disabled={!hasNext || (isSorting && !isStop)}
            ghost
            onClick={onNextClick}
          >
            Next
          </Button>
        </Col>
      </Row>

      <Row style={{ marginBottom: "10px" }}>
        <Col span="24" style={{ marginBottom: "10px" }}>
          <Alert
            message={
              <>
                <Tag>x</Tag>equal to{" "}
                <Tag>a[(l + r) / 2] = {JSON.stringify(ctx.x)}</Tag>
              </>
            }
            type="info"
          />
        </Col>

        <Col span="24" style={{ marginBottom: "10px" }}>
          <Alert
            message={
              <>
                <Tag>a[i] = {a[ctx.i]}</Tag> less than <Tag>x = {ctx.x}</Tag> ?
              </>
            }
            type={a[ctx.i] < ctx.x ? "success" : "error"}
          ></Alert>
        </Col>

        <Col span="24">
          <Alert
            message={
              <>
                <Tag>a[j] = {a[ctx.j]}</Tag> greater than <Tag>x = {ctx.x}</Tag>{" "}
                ?
              </>
            }
            type={a[ctx.j] > ctx.x ? "success" : "error"}
          ></Alert>
        </Col>
      </Row>

      <Row>
        <BoxContainer>
          {a.map((num, idx) => (
            <BoxItem
              key={idx}
              style={{
                height: `${num * 10}px`,
                backgroundColor: getBackgroundColor(idx),
              }}
            >
              <div>{num}</div>
              {getIndicator(idx)}
            </BoxItem>
          ))}
        </BoxContainer>
      </Row>
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

export function* quickSort(
  a: number[],
  l: number = 0,
  r: number = a.length - 1
): any {
  if (l >= r) return;

  let i = l - 1,
    j = r + 1,
    x = a[(l + r) >> 1];

  yield { l, r, i: -1, j: a.length, x, a };

  while (i < j) {
    do {
      ++i;
      yield { l, r, i, j, x, a };
    } while (a[i] < x);

    do {
      --j;
      yield { l, r, i, j, x, a };
    } while (a[j] > x);

    if (i < j) {
      swap(a, i, j);
      yield { l, r, i, j, x, a };
    }
  }

  yield quickSort(a, l, j);
  yield quickSort(a, j + 1, r);

  yield { l: -1, r: -1, i: -1, j: a.length, x, a };
}
