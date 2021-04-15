import React from "react";
import { Stack } from "@/components/Stack";

const Page = function () {
  return (
    <>
      <h1>Stack</h1>

      <Stack />
    </>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
