import React, { useRef, useState, useEffect } from "react";
import { Button, Row, Col, Input } from "antd";
import anime from "animejs";
import styled from "styled-components";

const QueueDiv = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;

  width: 100%;
  height: 100px;
  padding: 20px;

  overflow: auto;

  background: #ffffff;
  box-shadow: inset 6px -6px 23px #ededed, inset -6px 6px 23px #ffffff;
`;

const QueueItemDiv = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 100%;
  margin-right: 10px;

  border-radius: 12px;
  background: #ffffff;
  box-shadow: 6px -6px 36px #e0e0e0, -6px 6px 36px #ffffff;

  cursor: pointer;
  transition: box-shadow 0.3s ease;

  :hover {
    box-shadow: 27px -27px 54px #ededed, -27px 27px 54px #ffffff;
  }
`;

function useQueueHook() {
  const [q, setQ] = useState([] as any[]);
  const h = useRef(0);
  const r = useRef(0);

  const getSize = () => {
    return r.current - h.current;
  };
  const isEmpty = () => {
    return !getSize();
  };
  const push = (item: any) => {
    q[r.current++] = item;
  };
  const pop = () => {
    if (isEmpty()) return;
    h.current++;
  };

  return { q, setQ, h, r, getSize, isEmpty, push, pop };
}

// eslint-disable-next-line import/no-anonymous-default-export
export function Queue() {
  const { q, setQ, h, r, isEmpty, push, pop } = useQueueHook();
  const headRef = useState(null as any);
  const rearRef = useState(null as any);
  const animType = useRef("");

  const [pushing, setPushing] = useState(false);
  const [popping, setPopping] = useState(false);

  const [inputValue, setInputValue] = useState(undefined as any);

  useEffect(() => {
    if (animType.current === "push") {
      anime({
        targets: ".queue__item:last-of-type",
        translateX: [500, 0],
        opacity: [0, 1],
        duration: 500,
        easing: "linear",
      }).finished.then(() => setPushing(false));
    }
    animType.current = "";
  });

  function onPushClick() {
    setPushing(true);
    push(inputValue);
    setQ([...q]);
    animType.current = "push";
  }
  function onPopClick() {
    setPopping(true);

    anime({
      targets: ".queue__item:first-of-type",
      translateY: -100,
      duration: 500,
    }).finished.then(() => {
      anime({
        targets: ".queue__item",
        translateX: -60,
        delay: anime.stagger(100),
        duration: 500,
      })
        .finished.then(() => {
          anime.set(".queue__item", { translateX: 0 });
          pop();
          setQ([...q]);
        })
        .then(() => setPopping(false));
    });
  }

  const queueItems: any[] = [];
  for (let i = h.current; i !== r.current; i++) {
    queueItems.push(
      <QueueItemDiv
        className={`queue__item queue__item-${i - h.current}`}
        key={i}
      >
        {q[i]}
      </QueueItemDiv>
    );
  }

  return (
    <>
      <Row gutter={10}>
        <Col>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={onPushClick}
          ></Input>
        </Col>
        <Col>
          <Button
            disabled={popping || pushing}
            loading={pushing}
            onClick={onPushClick}
          >
            Push
          </Button>
        </Col>
        <Col>
          <Button
            disabled={isEmpty() || pushing || popping}
            loading={popping}
            onClick={onPopClick}
          >
            Pop
          </Button>
        </Col>
      </Row>

      <QueueDiv>{queueItems}</QueueDiv>
    </>
  );
}
