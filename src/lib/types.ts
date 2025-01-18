// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferObjectShapeInArray<T extends Array<any>> =
  T extends Array<infer U>
    ? U extends object
      ? keyof U extends keyof T[number]
        ? T[number]
        : never
      : never
    : never;
