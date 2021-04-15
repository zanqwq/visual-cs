import DefaultLayout from "@/layout/index";
import React from "react";

const Page = function () {
  return (
    <DefaultLayout>
      <h1>Bellman Ford</h1>
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developping: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
