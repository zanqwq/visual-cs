import lodash from "lodash";

export const ctx = (require as any).context("@/views", true, /\.tsx$/);

export const isFile = Symbol.for("isFile");
export const curPath = Symbol.for("curPath");

let t = { [isFile]: false, [curPath]: "" };
type T = typeof t;

export interface FileTreeNode extends T {
  [child: string]: FileTreeNode;
}

export function parseCtxToTreeNode(ctx: { keys: () => string[] }) {
  const root: FileTreeNode = { [isFile]: false, [curPath]: "" };

  ctx.keys().forEach((path) => {
    const pathSegments: string[] = path.split("/").splice(1);
    for (let i = 0, cur = root; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      if (!cur[pathSegment]) {
        cur[pathSegment] = {
          [isFile]: pathSegment.indexOf(".tsx") !== -1,
          [curPath]: cur[curPath] + "/" + pathSegment,
        };
      }
      cur = cur[pathSegment];
    }
  });

  return root;
}

export function getRandomArr(maxSize: number, range: [number, number]) {
  const size = lodash.random(1, maxSize);
  const [from, to] = range;
  const arr: number[] = [];
  for (let i = 0; i < size; i++) arr.push(lodash.random(from, to));
  return arr;
}

export function createMatrix(
  rowSize: number,
  colSize: number,
  initialValue: any
) {
  const res = [];
  for (let i = 0; i < rowSize; i++) {
    res.push(lodash.fill(Array(colSize), initialValue));
  }
  return res;
}

function isGenerator(val: any): val is Generator {
  return "next" in val && typeof val["next"] === "function";
}

export function printGenerator(g: Generator) {
  let t = g.next();
  while (!t.done) {
    if (isGenerator(t.value)) {
      printGenerator(t.value);
    } else console.log(t.value);
    t = g.next();
  }
}

export function walkGenerator(
  g: Generator,
  consume: (g: Generator) => unknown
) {
  let t = g.next();
  while (!t.done) {
    if (isGenerator(t.value)) {
      walkGenerator(t.value, consume);
    } else consume(g);
    t = g.next();
  }
}

export function* flatGenerator(g: Generator): any {
  for (const val of g) {
    if (isGenerator(val)) {
      for (const _val of flatGenerator(val)) {
        yield _val;
      }
    } else yield val;
  }
}

export function swap(a: any[], i: number, j: number) {
  [a[i], a[j]] = [a[j], a[i]];
}

export function mergeOption(...opts: Record<string, any>[]) {
  const res: Record<string, any> = {};
  for (const opt of opts) {
    for (const prop in opt) {
      if (
        res[prop] === undefined ||
        typeof opt[prop] !== "object" ||
        Array.isArray(opt[prop])
      )
        res[prop] = opt[prop];
      else res[prop] = mergeOption(res[prop], opt[prop]);
    }
  }
  return res;
}
