import React, { useState } from "react";
import { Button, Row, Col } from "antd";
import { getRandomArr, flatGenerator } from "@/utils";
import { BoxContainer, BoxItem } from "@/components/Box";

import { ArrowUpOutlined } from "@ant-design/icons";

const Page = function () {
  const [a, setA] = useState(getRandomArr(30, [10, 30]));
  const [cache, setCache] = useState([] as number[]);
  const [g, setG] = useState(flatGenerator(mergeSort([...a])));
  const [ctx, setCtx] = useState({} as any);
  const [timeId, setTimeId] = useState(null as any);

  const [isSorting, setSorting] = useState(false);
  const [isStop, setStop] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const onNewClick = () => {
    const newA = getRandomArr(30, [10, 30]);
    const newG = flatGenerator(mergeSort([...newA]));
    setA(newA);
    setCache([]);
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
      const { l, m, r, i, j, winner, a, cache } = t.value;
      console.log(t.value);
      setA(a);
      setCache(cache);
      setCtx({ l, m, r, i, j, winner });
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
    const { l, m, r, i, j, winner, a, cache } = t.value;
    setA(a);
    setCache(cache);
    setCtx({ l, m, r, i, j, winner });
  };

  const leftColor = {
    base: "#92BEEF", // 一般
    ltI: "#DCEDFF", // 灰
    eqI: "#1E55B5", // 最亮
  };
  const rightColor = {
    base: "#F49999",
    ltJ: "#F4D2D2",
    eqJ: "#E76262",
  };
  const getBackgroundColor = (idx: number) => {
    // return idx === ctx.i ? "#aaf" : idx === ctx.j ? "#faa" : "#ddd";
    const { l, m, r, i, j } = ctx;
    if (idx < l || idx > r) return "#ddd";
    if (idx <= m) {
      if (idx === i) return leftColor.eqI;
      else if (idx < i) return leftColor.ltI;
      return leftColor.base;
    } else if (idx > m) {
      if (idx === j) return rightColor.eqJ;
      else if (idx < j) return rightColor.ltJ;
      return rightColor.base;
    }
    return "#ddd";
  };
  const getCacheBackgroundColor = (idx: number) => {
    if (idx !== cache.length - 1) return "#ddd";
    switch (ctx.winner) {
      case "i":
        return leftColor.eqI;
      case "j":
        return rightColor.eqJ;
      default:
        return "#ddd";
    }
  };
  const getIndicator = (idx: number) => {
    const tmp = [] as string[];
    if (idx === ctx.l) tmp.push("L");
    if (idx === ctx.m) tmp.push("M");
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
      <h1>Merge Sort</h1>
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

      <h2>major array : </h2>
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

      <h2>cache array : </h2>
      <Row>
        <BoxContainer>
          {cache.map((num, idx) => (
            <BoxItem
              key={idx}
              style={{
                height: `${num * 10}px`,
                backgroundColor: getCacheBackgroundColor(idx),
              }}
            >
              {num}
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

export function* mergeSort(
  a: number[],
  l: number = 0,
  r: number = a.length - 1
): any {
  if (l >= r) return;
  const m = (l + r) >> 1;
  yield mergeSort(a, l, m);
  yield mergeSort(a, m + 1, r);

  const cache = [];
  let i = l,
    j = m + 1;

  while (i <= m && j <= r) {
    if (a[i] <= a[j]) {
      cache.push(a[i]);
      yield { l, m, r, i, j, winner: "i", a, cache };
      i++;
    } else {
      cache.push(a[j]);
      yield { l, m, r, i, j, winner: "j", a, cache };
      j++;
    }
  }
  while (i <= m) {
    cache.push(a[i]);
    yield { l, m, r, i, j, winner: "i", a, cache };
    i++;
  }
  while (j <= r) {
    cache.push(a[j]);
    yield { l, m, r, i, j, winner: "j", a, cache };
    j++;
  }

  for (i = 0; l + i <= r; i++) a[l + i] = cache[i];

  yield { l: -1, m: -1, r: -1, i: -1, j: -1, winner: "-", a, cache: [] };
}

// console.log("---merge sort---");

// const a = getRandomArr(10, [-10, 10]);
// const g = mergeSort(a);

// printGenerator(g);
