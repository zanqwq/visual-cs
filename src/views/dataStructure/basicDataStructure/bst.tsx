import DefaultLayout from "@/layout/index";
import React from "react";

const Page = function () {
  return (
    <DefaultLayout>
      <h1>Binary Search Tree</h1>
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
