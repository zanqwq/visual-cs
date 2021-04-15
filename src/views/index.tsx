import React from "react";
import DefaultLayout from "@/layout/index";

const Page = function () {
  return <DefaultLayout>Index</DefaultLayout>;
};
Page.meta = {
  layout: import("@/layout/index"),
  developping: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
