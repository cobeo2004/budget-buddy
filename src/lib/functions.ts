/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type FunctionWithArgs<T extends any[], R extends any> = (
  ...args: T
) => R;
