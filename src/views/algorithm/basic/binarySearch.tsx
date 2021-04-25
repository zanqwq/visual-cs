import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Button, Input, Row, Col, Alert, message, Tag } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { getRandomArr } from "@/utils";
import DefaultLayout from "@/layout/index";

const ArrayDiv = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;
  position: relative;

  width: 100%;

  .activeL,
  .activeM,
  .activeR {
    transform: translateY(-20px);
  }

  .activeM {
    background: linear-gradient(145deg, #d8ffe6, #b6dec2);
  }
`;

const ArrayItemDiv = styled.div`
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 50px;
  height: 50px;
  margin: 5px;
  border-radius: 5px;

  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;

  text-align: center;

  cursor: pointer;

  transition: all 0.3s ease;

  :hover {
    box-shadow: 33px 33px 66px #d1d1d1, -33px -33px 66px #ffffff;
  }
`;

const Page = () => {
  const [a, setA] = useState(getRandomArr(20, [-30, 30]).sort((a, b) => a - b));
  const [ctx, setCtx] = useState({} as any);
  const [inputValue, setInputValue] = useState(undefined as any);
  const [searching, setSearching] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const g = useRef(null as any);
  const timeId = useRef(null as any);
  const found = useRef(undefined as any);

  const getIndicator = (idx: number) => {
    const indicators = [];
    if (idx === ctx.l) indicators.push("l");
    if (idx === ctx.m) indicators.push("m");
    if (idx === ctx.r) indicators.push("r");
    if (!indicators.length) return null;
    return (
      <div style={{ position: "absolute", top: 50, textAlign: "center" }}>
        <div>
          <ArrowUpOutlined />
        </div>
        <div>{indicators.join(",")}</div>
      </div>
    );
  };

  const getClassName = (idx: number) => {
    return `${idx === ctx.l && "activeL"} ${idx === ctx.m && "activeM"} ${
      idx === ctx.r && "activeR"
    }`;
  };

  const arrayItemDivs = a.map((num, idx) => (
    <ArrayItemDiv key={idx} className={getClassName(idx)}>
      <div>{num}</div>
      {getIndicator(idx)}
    </ArrayItemDiv>
  ));

  const onSearchDone = () => {
    if (timeId.current) clearInterval(timeId.current);
    setSearching(false);
    setIsStop(false);
    setHasNext(false);
    g.current = null;
    timeId.current = null;

    if (found.current !== undefined && found.current !== -1)
      message.success(`find target at index ${found.current}`);
    else message.error(`cant not find target`);

    found.current = undefined;
  };
  const startAutoSearching = () => {
    timeId.current = setInterval(() => {
      const t = g.current.next();
      if (t.done) {
        onSearchDone();
        return;
      }
      setCtx({ ...t.value });
      found.current = t.value.m;
    }, 2000);
  };
  const onSearch = () => {
    setHasNext(true);
    g.current = binarySearch(a, Number(inputValue));
    setSearching(true);
    startAutoSearching();
  };

  return (
    <DefaultLayout>
      <h1>Binary Search</h1>

      <Row gutter={10}>
        <Col>
          <Button
            onClick={() => {
              if (timeId.current) clearInterval(timeId.current);
              setA(getRandomArr(20, [-30, 30]).sort((a, b) => a - b));
              setCtx({});
              setSearching(false);
              setIsStop(false);
              setHasNext(true);
              g.current = null;
              timeId.current = null;
              found.current = undefined;
            }}
          >
            New
          </Button>
        </Col>

        <Col>
          <Input.Search
            value={inputValue}
            loading={searching}
            onChange={(e) => !searching && setInputValue(e.target.value)}
            onPressEnter={onSearch}
            onSearch={onSearch}
            placeholder="please input target value"
            enterButton="search"
          ></Input.Search>
        </Col>

        <Col>
          <Button
            disabled={!searching}
            onClick={() => {
              if (!isStop) clearInterval(timeId.current);
              else startAutoSearching();
              setIsStop(!isStop);
            }}
          >
            {isStop ? "Go" : "Stop"}
          </Button>
        </Col>

        <Col>
          <Button
            disabled={!hasNext || !searching || !isStop}
            onClick={() => {
              const t = g.current.next();
              if (t.done) {
                onSearchDone();
                setHasNext(false);
                return;
              }
              setCtx({ ...t.value });
              found.current = t.value.m;
            }}
          >
            Next
          </Button>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 20 }}
        message={
          <>
            <Tag color="success">{`target = ${inputValue}`}</Tag>
            {ctx.m >= 0 ? (
              <Tag>
                {Number(inputValue) === a[ctx.m]
                  ? "="
                  : Number(inputValue) < a[ctx.m]
                  ? "<"
                  : ">"}
              </Tag>
            ) : null}
            {ctx.m >= 0 ? (
              <Tag color="success">{`a[m] = ${a[ctx.m]}`}</Tag>
            ) : null}
          </>
        }
        type="info"
      ></Alert>

      <ArrayDiv style={{ marginTop: 50 }}>{arrayItemDivs}</ArrayDiv>
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

function* binarySearch(a: number[], tar: number) {
  let l = 0,
    r = a.length - 1,
    res = -1;

  while (l <= r) {
    let m = (l + r) >> 1;

    yield { l, m, r };

    const x = a[m];
    if (x === tar) {
      res = m;
      break;
    } else if (x < tar) l = m + 1;
    else r = m - 1;
  }

  yield { m: res };
}
