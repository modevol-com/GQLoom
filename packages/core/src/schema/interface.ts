import {
  GraphQLInterfaceType,
  isInterfaceType,
  isObjectType,
  type GraphQLInterfaceTypeConfig,
  type GraphQLOutputType,
} from "graphql"
import { weaverContext } from "./weaver-context"
import { ensureInterfaceNode } from "./definition-node"

export function ensureInterfaceType(
  gqlType: GraphQLOutputType,
  resolveType?: GraphQLInterfaceTypeConfig<any, any>["resolveType"]
): GraphQLInterfaceType {
  if (isInterfaceType(gqlType)) return gqlType

  if (!isObjectType(gqlType))
    throw new Error(`${gqlType.toString()} is not a object`)

  const key = gqlType

  const existing = weaverContext.interfaceMap?.get(key)
  if (existing != null) return existing

  const { astNode, extensionASTNodes: _1, ...config } = gqlType.toConfig()
  const interfaceType = new GraphQLInterfaceType({
    ...config,
    astNode: ensureInterfaceNode(astNode),
    resolveType,
  })

  weaverContext.interfaceMap?.set(key, interfaceType)
  return interfaceType
}
