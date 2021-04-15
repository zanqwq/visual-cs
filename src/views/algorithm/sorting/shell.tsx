import React, { useState } from "react";
import { Button, Row, Col } from "antd";
import { getRandomArr } from "@/utils";
import { BoxContainer, BoxItem } from "@/components/Box";

const Page = function () {
  const [a, setA] = useState(getRandomArr(30, [10, 30]));
  const [g, setG] = useState(shellSort([...a]));
  const [ctx, setCtx] = useState({} as any);
  const [timeId, setTimeId] = useState(null as any);

  const [isSorting, setSorting] = useState(false);
  const [isStop, setStop] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const onNewClick = () => {
    const newA = getRandomArr(30, [10, 30]);
    const newG = shellSort([...newA]);
    setA(newA);
    setG(newG);
    setCtx({} as any);
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
      if (!Array.isArray(t.value)) return;
      const [gap, i, j, ...newA] = t.value;
      setA(newA);
      setCtx({ gap, i, j });
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
      setHasNext(false);
      return;
    }
    const [gap, i, j, ...newA] = t.value;
    setA(newA);
    setCtx({ gap, i, j });
  };

  const getBackgroundColor = (idx: number) => {
    // return idx === ctx.i ? "#aaf" : idx === ctx.j ? "#faa" : "#ddd";
    const { gap, i, j } = ctx;
    if (idx <= i) {
      if (!((i - idx) % gap)) return idx === j ? "#aaf" : "#faa";
      return "#ddd";
    }
    return "#ddd";
  };

  return (
    <>
      <h1>Shell Sort</h1>
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

      <BoxContainer>
        {a.map((num, idx) => (
          <BoxItem
            key={idx}
            style={{
              height: `${num * 10}px`,
              backgroundColor: getBackgroundColor(idx),
            }}
          >
            {num}
          </BoxItem>
        ))}
      </BoxContainer>
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

export function* shellSort(a: number[]) {
  const n = a.length;
  yield [-1, -1, -1, ...a];
  for (let gap = n >> 1; gap >= 1; gap >>= 1) {
    for (let i = 1; i < n; i++) {
      let t = a[i],
        j = i - gap;

      yield [gap, i, i, ...a];
      while (j >= 0 && t < a[j]) {
        a[j + gap] = a[j];
        a[j] = t;
        yield [gap, i, j, ...a];
        j -= gap;
      }
    }
  }
  yield [-1, -1, -1, ...a];
}
