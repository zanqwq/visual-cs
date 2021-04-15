import React from "react";
import { Queue } from "@/components/Queue";

const Page = function () {
  return (
    <>
      <h1>Queue</h1>

      <Queue />
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
