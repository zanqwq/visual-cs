import React from "react";

const Page = function () {
  return <div>Index</div>;
};
Page.meta = {
  layout: import("@/layout/index"),
  developping: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
