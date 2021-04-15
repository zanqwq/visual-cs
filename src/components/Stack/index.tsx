import React, { useEffect, useRef, useState } from "react";
import { Button, Row, Col, Input } from "antd";
import anime from "animejs";
import styled from "styled-components";

const StackDiv = styled.div`
  width: 200px;
  min-height: 500px;
  padding: 10px;

  border-radius: 7px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 20px 20px 81px #fafafa, -20px -20px 81px #ffffff;
`;

const StackItemDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 150px;
  min-height: 50px;
  margin: 20px auto;

  cursor: pointer;

  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 7px 7px 14px #d4d4d4, -7px -7px 14px #ffffff;

  transition: box-shadow 0.3s ease;

  :hover {
    box-shadow: 18px 18px 36px #d4d4d4, -18px -18px 36px #ffffff;
  }
`;

export function Stack() {
  const [stk, setStk] = useState([] as any[]);
  const topRef = useRef(null as any);
  const animType = useRef("");

  const [pushing, setPushing] = useState(false);
  const [popping, setPopping] = useState(false);

  const [inputValue, setInputValue] = useState(undefined as any);

  useEffect(() => {
    switch (animType.current) {
      case "push":
        anime({
          targets: topRef.current,
          translateY: [1000, 0],
          opacity: [0, 1],
          easing: "linear",
          duration: 1000,
        }).finished.then(() => setPushing(false));
        break;
      case "pop":
        break;
    }
    animType.current = "";
  });

  function onPushClick() {
    animType.current = "push";
    setPushing(true);
    const newStk = [...stk];
    push(newStk, inputValue);
    setStk(newStk);
  }

  function onPopClick() {
    animType.current = "pop";
    setPopping(true);
    const newStk = [...stk];
    pop(newStk);
    anime({
      targets: topRef.current,
      translateY: [0, 1000],
      opacity: [1, 0],
      easing: "linear",
      duration: 1000,
    }).finished.then(() => {
      setStk(newStk);
      setPopping(false);
    });
  }

  return (
    <>
      <Row gutter={10} style={{ marginBottom: 10 }}>
        <Col>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></Input>
        </Col>
        <Col>
          <Button
            loading={pushing}
            disabled={pushing || popping}
            onClick={onPushClick}
          >
            {pushing ? "Pushing..." : "Push"}
          </Button>
        </Col>
        <Col>
          <Button
            loading={popping}
            disabled={popping || pushing || !getSize(stk)}
            onClick={onPopClick}
          >
            {popping ? "Popping..." : "Pop"}
          </Button>
        </Col>
      </Row>
      <StackDiv id="container">
        {stk.map((item, idx) => {
          return (
            <StackItemDiv
              key={idx}
              className={idx === stk.length - 1 ? "stack__item-top" : undefined}
              ref={(e) => {
                if (idx === stk.length - 1) topRef.current = e;
              }}
            >
              {item}
            </StackItemDiv>
          );
        })}
      </StackDiv>
    </>
  );
}

export function getSize(stk: any[]) {
  return stk.length;
}
export function push(stk: any[], item: any) {
  stk.push(item);
}
export function pop(stk: any[]) {
  if (!getSize(stk)) return;
  stk.pop();
}
export function clear(stk: any[]) {
  stk.splice(0);
}
