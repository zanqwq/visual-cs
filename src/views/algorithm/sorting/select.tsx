import React, { useState } from "react";
import { Button, Row, Col } from "antd";
import { getRandomArr, swap } from "@/utils";
import { BoxContainer, BoxItem } from "@/components/Box";
import DefaultLayout from "@/layout/index";

const Page = function () {
  const [a, setA] = useState(getRandomArr(30, [10, 30]));
  const [g, setG] = useState(selectSort([...a]));
  const [ctx, setCtx] = useState({} as any);
  const [timeId, setTimeId] = useState(null as any);

  const [isSorting, setSorting] = useState(false);
  const [isStop, setStop] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const onNewClick = () => {
    const newA = getRandomArr(30, [10, 30]);
    const newG = selectSort([...newA]);
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
      const [i, j, ...newA] = t.value;
      setA(newA);
      setCtx({ i, j });
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
    const [i, j, ...newA] = t.value;
    setA(newA);
    setCtx({ i, j });
  };

  const getBackgroundColor = (idx: number) => {
    return idx === ctx.i ? "#aaf" : idx === ctx.j ? "#faa" : "#ddd";
  };

  return (
    <DefaultLayout>
      <h1>Select Sort</h1>
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
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

export function* selectSort(a: number[]) {
  const n = a.length;
  yield [-1, -1, ...a];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (a[i] > a[j]) swap(a, i, j);
      yield [i, j, ...a];
    }
  yield [-1, -1, ...a];
}
