import React from "react";
import "./index.less";

// eslint-disable-next-line import/no-anonymous-default-export
export function BoxContainer(props: any) {
  return (
    <div className="box__container" style={{ ...props.style }}>
      {props.children}
    </div>
  );
}

export function BoxItem(props: any) {
  return (
    <div className="box__item" style={{ ...props.style }}>
      {props.children}
    </div>
  );
}
