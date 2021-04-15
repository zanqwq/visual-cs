import React from "react";
import { Queue } from "@/components/Queue";
import DefaultLayout from "@/layout/index";

const Page = function () {
  return (
    <DefaultLayout>
      <h1>Queue</h1>

      <Queue />
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
