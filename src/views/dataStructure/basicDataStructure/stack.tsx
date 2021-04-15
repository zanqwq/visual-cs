import React from "react";
import { Stack } from "@/components/Stack";
import DefaultLayout from "@/layout/index";

const Page = function () {
  return (
    <DefaultLayout>
      <h1>Stack</h1>

      <Stack />
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: false,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;
