import React, { useRef, useState } from "react";
import { Row, Col, Button, Slider, Radio, Badge, message } from "antd";
import { HomeOutlined, PushpinOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { createMatrix, flatGenerator } from "@/utils";
import anime from "animejs";
import DefaultLayout from "@/layout/index";

const Wrapper = styled.div`
  .is-invisitable {
    background: #ff5b00 !important;
  }

  .is-visited {
    background: #aaa !important;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;

  border-radius: 5px;
  background: #ddd;

  transition: background 0.3s ease;

  cursor: pointer;

  :hover {
  }
`;

type Node = { r: number; c: number };

function useDfs(a: number[][]) {
  const row = a.length,
    col = a[0].length;

  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const INF = 0x3f3f3f;
  const visited = createMatrix(row, col, false);
  const stepMap = createMatrix(row, col, undefined);
  const minStep = useRef(INF);
  // let minStep = INF;
  const shortestPath = useRef([] as Node[]);

  function* dfs(
    r: number,
    c: number,
    to: Node,
    step: number = 0,
    pathLog: Node[] = []
  ): any {
    if (r >= row || r < 0 || c >= col || c < 0 || !a[r][c] || visited[r][c]) {
      return;
    }

    visited[r][c] = true;
    stepMap[r][c] = step;
    pathLog.push({ r, c });

    yield { r, c, step, visited: [...visited], stepMap: [...stepMap] };

    if (r === to.r && c === to.c) {
      if (minStep.current > step) {
        // if (minStep > step) {
        minStep.current = step;
        // minStep = step;

        shortestPath.current = [...pathLog];
      }

      visited[r][c] = false;
      stepMap[r][c] = undefined;
      pathLog.pop();

      yield { r, c, step, visited: [...visited], stepMap: [...stepMap] };
      return;
    }

    for (const dir of dirs) {
      const rr = r + dir[0],
        cc = c + dir[1];
      yield dfs(rr, cc, to, step + 1, pathLog);
    }

    visited[r][c] = false;
    stepMap[r][c] = undefined;
    pathLog.pop();

    yield { r, c, step, visited: [...visited], stepMap: [...stepMap] };
  }

  return { dfs, minStep, shortestPath, INF };
}

const Page = function () {
  const [a, setA] = useState(createMatrix(2, 2, 1));
  const [ctx, setCtx] = useState({} as any);
  const [radioValue, setRadioValue] = useState("from");
  const fromRef = useRef(undefined as any);
  const toRef = useRef(undefined as any);
  const itemRefs = useRef([] as Array<Array<any>>);

  const [searching, setSearching] = useState(false);

  const { dfs, minStep, shortestPath, INF } = useDfs(a);

  const onSliderChange = (val: any) => {
    fromRef.current = undefined;
    toRef.current = undefined;
    setA(createMatrix(Number(val), Number(val), 1));
    setCtx({});
  };

  const onSearchClick = () => {
    if (!fromRef.current || !toRef.current) {
      message.warning("please set the from node and to node first");
      return;
    }

    setSearching(true);

    minStep.current = INF;
    shortestPath.current = [];
    const g = flatGenerator(
      dfs(fromRef.current.r, fromRef.current.c, toRef.current)
    );

    const timeId = setInterval(() => {
      const t = g.next();
      if (t.done) {
        clearInterval(timeId);
        if (minStep.current !== INF) {
          // if (minStep !== INF) {
          message.success(`The shortest path takes ${minStep.current} step`, 3);
          const paths = shortestPath.current.map(
            (node) => itemRefs.current[node.r][node.c]
          );

          anime({
            targets: paths,
            scale: 0.8,
            borderRadius: [5, 50],
            background: "#52c41a",
            delay: anime.stagger(200, { start: 500 }),
            direction: "alternate",
          }).finished.then(() => {
            setSearching(false);
          });
        } else message.error("Cannot reach the goal");

        return;
      }
      setCtx({ ...t.value });
    }, 500);
  };

  const checkNode = (r: number, c: number, node: Node) => {
    return r === node.r && c === node.c;
  };
  const onItemClick = (r: number, c: number) => {
    if (searching) {
      message.error("please wait util the searching finished");
      return;
    }
    switch (radioValue) {
      case "from":
        if (a[r][c] === 0) break;
        fromRef.current = { r, c };
        setA([...a]);
        break;
      case "to":
        if (a[r][c] === 0) break;
        toRef.current = { r, c };
        setA([...a]);
        break;
      case "block":
        if (
          (fromRef.current && checkNode(r, c, fromRef.current)) ||
          (toRef.current && checkNode(r, c, toRef.current))
        )
          break;
        a[r][c] = 1 - a[r][c]; // 0 --> 1, 1 --> 0
        setA([...a]);
        break;
    }
  };

  const getClassName = (r: number, c: number) => {
    return `
      ${ctx.visited && ctx.visited[r][c] && "is-visited"}
      ${a[r][c] === 0 && "is-invisitable"}
    `;
  };

  const getBadgeCount = (r: number, c: number) => {
    if (fromRef.current && checkNode(r, c, fromRef.current))
      return <HomeOutlined />;
    if (toRef.current && checkNode(r, c, toRef.current))
      return <PushpinOutlined />;
    return 0;
  };

  return (
    <DefaultLayout>
      <h1>Dfs</h1>

      <Row gutter={10} align="middle" style={{ marginBottom: 50 }}>
        <Col span={24}>
          <Slider
            min={2}
            max={10}
            onChange={onSliderChange}
            disabled={searching}
          ></Slider>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={onSearchClick}
            loading={searching}
            disabled={searching}
          >
            {searching ? "Searching..." : "Searching"}
          </Button>
        </Col>
        <Col>
          <Radio.Group
            value={radioValue}
            onChange={(e) => setRadioValue(e.target.value)}
          >
            <Radio value={"from"}>From</Radio>
            <Radio value={"to"}>To</Radio>
            <Radio value={"block"}>Block</Radio>
          </Radio.Group>
        </Col>
      </Row>

      {/* grids */}
      {a.map((row, r) => (
        <Row key={r} gutter={10} style={{ marginTop: 10 }}>
          {row.map((col, c) => (
            <Col key={c}>
              <Wrapper>
                <Badge count={getBadgeCount(r, c)}>
                  <Item
                    className={getClassName(r, c)}
                    onClick={() => onItemClick(r, c)}
                    ref={(e) => {
                      if (!itemRefs.current[r]) itemRefs.current[r] = [];
                      itemRefs.current[r][c] = e;
                    }}
                  >
                    <span>
                      {ctx.stepMap &&
                        ctx.stepMap[r][c] !== undefined &&
                        ctx.stepMap[r][c]}
                    </span>
                  </Item>
                </Badge>
              </Wrapper>
            </Col>
          ))}
        </Row>
      ))}
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developping: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
