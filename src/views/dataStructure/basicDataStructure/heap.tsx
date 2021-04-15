import React from "react";
import { Heap } from "@/components/Heap";

const Page = function (props: any) {
  return (
    <>
      <h1>Heap</h1>

      <Heap
        style={{ marginTop: 10 }}
        a={[0, 10, 30, -9, -25, 40, 36, -28, 94]}
      />
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
