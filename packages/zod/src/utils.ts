import {
  type GraphQLTypeResolver,
  type GraphQLFieldConfig,
  type GraphQLObjectTypeConfig,
} from "graphql"
import {
  type ZodStringCheck,
  type ZodDiscriminatedUnion,
  type ZodObject,
  ZodEffects,
} from "zod"
import { ZodWeaver } from "."

export function parseObjectConfig(
  input: string
): Pick<
  GraphQLObjectTypeConfig<any, any>,
  "name" | "description" | "extensions"
> {
  const [name, ...maybeDescription] = input.split(":")

  return {
    name: name.trim(),
    description:
      maybeDescription.length > 0
        ? maybeDescription.join(":").trim()
        : undefined,
  }
}

export function parseFieldConfig(
  input: string | undefined
):
  | Pick<GraphQLFieldConfig<any, any>, "description" | "extensions">
  | undefined {
  if (!input) return undefined

  return {
    description: input.trim(),
  }
}

export function resolveTypeByDiscriminatedUnion(
  schemaOrEffect:
    | ZodDiscriminatedUnion<string, ZodObject<any>[]>
    | ZodEffects<ZodDiscriminatedUnion<string, ZodObject<any>[]>>
): GraphQLTypeResolver<any, any> {
  const schema =
    schemaOrEffect instanceof ZodEffects
      ? schemaOrEffect.innerType()
      : schemaOrEffect
  return (data) => {
    const discriminatorValue: string = data[schema.discriminator]
    const option = schema.optionsMap.get(discriminatorValue)
    return ZodWeaver.getDiscriminatedUnionOptionName(option)
  }
}

export const ZodIDKinds: Set<ZodStringCheck["kind"]> = new Set([
  "cuid",
  "cuid2",
  "ulid",
  "uuid",
])
