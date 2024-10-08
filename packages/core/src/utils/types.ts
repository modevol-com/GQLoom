export type MayPromise<T> = T | Promise<T>

export type IsAny<T> = 0 extends 1 & T ? true : false

/**
 * @example
 * ```TypeScript
 * type A = { a?: { b?: { c: string } } }
 * type B = InferPropertyType<A, "a"> // { b?: { c: string } }
 * type C = InferPropertyType<A, "a.b"> // { c: string }
 * ```
 */
export type InferPropertyType<
  T,
  K extends string,
> = K extends `${infer K1}.${infer K2}`
  ? K1 extends keyof T
    ? InferPropertyType<NonNullable<T[K1]>, K2>
    : never
  : K extends keyof T
    ? T[K]
    : never

/**
 * @example
 * ```TypeScript
 * type C = { c: string }
 * type A = WrapPropertyType<"a", C> // { a: C }
 * type B = WrapPropertyType<"a.b", C> // { a: { b: C } }
 * ```
 */
export type WrapPropertyType<
  TKey extends string,
  TProperty,
> = TKey extends `${infer TFirst}.${infer TRest}`
  ? { [K in TFirst]: WrapPropertyType<TRest, TProperty> }
  : { [K in TKey]: TProperty }

export type ObjectOrNever<T> = T extends object ? T : never

export type ValueOf<T extends object> = T[keyof T]
