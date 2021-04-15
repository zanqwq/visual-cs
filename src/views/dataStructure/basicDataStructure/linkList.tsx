import React from "react";
import styled from "styled-components";

const ListDiv = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;

  padding: 10px;

  width: 100%;
`;
const ListItemDiv = styled.div`
  flex-shrink: 0;

  width: 80px;
  height: 50px;
  margin-right: 10px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 10px 10px 27px #d1d1d1, -10px -10px 27px #ffffff;

  cursor: pointer;

  transition: all 0.3s ease;

  :hover {
    box-shadow: 18px 18px 36px #d1d1d1, -18px -18px 36px #ffffff;
  }
`;

const Page = function () {
  return (
    <>
      <h1>Link List</h1>
      {/* 
      <ListDiv>
        <ListItemDiv></ListItemDiv>
        <ListItemDiv></ListItemDiv>
        <ListItemDiv></ListItemDiv>
        <ListItemDiv></ListItemDiv>
        <ListItemDiv></ListItemDiv>
        <ListItemDiv></ListItemDiv>
      </ListDiv> */}
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

// 链式前向星表示法
// id 为边 id, h 表示头节点的边 id
// nxt[id] 表示 id 边的下一条边 id
// val[id] 表示 id 这条边的链接点值
// 当前 id 总是为新分配, 未使用的 id
let h = -1,
  nxt = [] as any[],
  val = [] as any[];
let id = 0;

function init() {
  h = -1;
  id = 0;
}

// 头插法
function add(x: any) {
  val[id] = x;
  nxt[id] = h;
  h = id++;
}

function* iter() {
  for (let i = h; ~i; i = nxt[i]) {
    yield val[i];
  }
}
