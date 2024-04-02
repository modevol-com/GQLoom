import type {
  FieldOptions,
  QueryMutationOptions,
  OperationOrFieldType,
  OperationType,
  SubscriptionOptions,
  GraphQLFieldOptions,
} from "../resolver/types"

export function getOperationOptions<
  T extends OperationOrFieldType = OperationType,
>(
  resolveOrOptions: T extends "field"
    ? ((parent: any) => any) | FieldOptions<any, any, any, any>
    : (() => any) | QueryMutationOptions<any, any, any>
): T extends "field"
  ? FieldOptions<any, any, any, any>
  : QueryMutationOptions<any, any, any> {
  if (typeof resolveOrOptions === "function") {
    return { resolve: resolveOrOptions }
  }
  return resolveOrOptions as any
}

export function getSubscriptionOptions(
  subscribeOrOptions: (() => any) | SubscriptionOptions<any, any, any, any>
): SubscriptionOptions<any, any, any, any> {
  if (typeof subscribeOrOptions === "function") {
    return { subscribe: subscribeOrOptions }
  }
  return subscribeOrOptions
}

export function getFieldOptions({
  description,
  deprecationReason,
  extensions,
  astNode,
}: GraphQLFieldOptions): GraphQLFieldOptions {
  return {
    description,
    deprecationReason,
    extensions,
    astNode,
  }
}
