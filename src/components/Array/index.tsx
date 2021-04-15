import React, { Table } from "antd";

import { ColumnsType } from "antd/es/table";

interface A {
  key: number;
  row: number;
  [idx: number]: number | string;
}

function getDimension(a: any[]) {
  let dimension = 0,
    ptr = a;
  while (Array.isArray(ptr)) {
    dimension++;
    ptr = ptr[0];
  }
  return dimension;
}

export default function Arr(props: { arr: any[][] }) {
  const { arr } = props;

  // 将 2 维数组转化为 dataSource
  // 例如, [[1, 2], [3, 4]] => [ { key: 0, row: 0, 0: 1, 1: 2 }, { key: 1, row: 1, 0: 3, 1: 4 } ]
  // 并生成相应的
  const dataSource: A[] = arr.reduce(
    (preDataSource, curDataSourceItem, row) => {
      const parseDataSourceItem = curDataSourceItem.reduce(
        (preParsedDataSourceItem, curVal, col) => {
          preParsedDataSourceItem[col] = curVal;
          return preParsedDataSourceItem;
        },
        {}
      );

      parseDataSourceItem.key = parseDataSourceItem.row = row;

      preDataSource.push(parseDataSourceItem);
      return preDataSource;
    },
    []
  );
  console.log(dataSource);

  const columns: ColumnsType<A> = [{ dataIndex: "row", fixed: "left" }];
  for (let i = 0; i < arr[0].length; i++) {
    columns.push({ dataIndex: i, title: `${i}`, align: "center" });
  }

  return (
    <Table<A>
      bordered
      dataSource={dataSource}
      columns={columns}
      pagination={false}
    />
  );
}
