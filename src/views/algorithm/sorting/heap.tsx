import React from "react";
import { Alert } from "antd";
import { swap } from "@/utils";
import { initHeap, down } from "@/components/Heap";
import DefaultLayout from "@/layout/index";

const Page = function () {
  return (
    <DefaultLayout>
      <Alert
        message="Sorry"
        description="This page it still building yet..."
        type="error"
      />
    </DefaultLayout>
  );
};
Page.meta = {
  layout: import("@/layout/index"),
  developing: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default Page;

export function* heapSort(a: number[]) {
  const h = [...a];
  initHeap(h);
  const n = h.length;
  for (let i = 1; i < n; i++) {
    swap(h, 1, n - i);
    a[n - i] = h[n - i];
    h.length = h.length - 1; // heap size -1
    yield down(h, 1);
  }
}
