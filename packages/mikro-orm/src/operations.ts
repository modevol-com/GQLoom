import {
  type GraphQLSilk,
  type FieldOrOperation,
  type Middleware,
  type GraphQLFieldOptions,
  getFieldOptions,
  createInputParser,
  applyMiddlewares,
  compose,
  type MayPromise,
  silk,
} from "@gqloom/core"
import {
  type RequiredEntityData,
  type EntitySchema,
  type EntityManager,
} from "@mikro-orm/core"
import { type InferEntity } from "./types"
import { MikroWeaver } from "."

interface MikroOperationWeaverOptions {
  getEntityManager: () => MayPromise<EntityManager>
}

export class MikroOperationWeaver<
  TSchema extends EntitySchema<any, any> & GraphQLSilk,
> {
  readonly options: MikroOperationWeaverOptions
  constructor(
    public readonly entity: TSchema,
    optionsOrGetEntityManager:
      | MikroOperationWeaverOptions
      | MikroOperationWeaverOptions["getEntityManager"]
  ) {
    if (typeof optionsOrGetEntityManager === "function") {
      this.options = { getEntityManager: optionsOrGetEntityManager }
    } else {
      this.options = optionsOrGetEntityManager
    }

    this.flushMiddleware = async (next) => {
      const result = await next()
      const em = await this.useEm()
      await em.flush()
      return result
    }
  }

  flushMiddleware: Middleware

  useEm() {
    return this.options.getEntityManager()
  }

  reelDefaultCreateInput(): GraphQLSilk<
    RequiredEntityData<InferEntity<TSchema>>,
    RequiredEntityData<InferEntity<TSchema>>
  > {
    return silk(
      MikroWeaver.getGraphQLType(this.entity, {
        partial: this.entity.meta.primaryKeys,
        name: `${this.entity.meta.name}CreateInput`,
      }),
      (value) => value
    )
  }

  /**
   * Create a `create` mutation for the given entity.
   */
  reelCreate<
    TInput extends GraphQLSilk<
      RequiredEntityData<InferEntity<TSchema>>
    > = GraphQLSilk<
      RequiredEntityData<InferEntity<TSchema>>,
      RequiredEntityData<InferEntity<TSchema>>
    >,
  >({
    input = this.reelDefaultCreateInput() as TInput,
    ...options
  }: {
    input?: TInput
    middlewares?: Middleware<
      FieldOrOperation<undefined, TSchema, TInput, "mutation">
    >[]
  } & GraphQLFieldOptions = {}): FieldOrOperation<
    undefined,
    TSchema,
    TInput,
    "mutation"
  > {
    const entity = this.entity

    const middlewares = options.middlewares?.includes(this.flushMiddleware)
      ? options.middlewares
      : compose(options.middlewares, [this.flushMiddleware])

    return {
      ...getFieldOptions(options),
      input,
      output: entity,
      type: "mutation",
      resolve: async (inputValue, extraOptions) => {
        const parseInput = createInputParser(input, inputValue)
        return applyMiddlewares(
          compose(extraOptions?.middlewares, middlewares),
          async () => {
            const em = await this.useEm()
            const inputResult = await parseInput()
            const instance = em.create(entity, inputResult)
            em.persist(instance)
            return instance
          },
          { parseInput, parent: undefined, outputSilk: entity }
        )
      },
    }
  }
}

export interface MikroOperationBobbins {
  create: MikroCreateBobbin
}

export interface MikroCreateBobbin {
  <
    TSchema extends EntitySchema<any, any> & GraphQLSilk,
    TInput extends GraphQLSilk<
      RequiredEntityData<InferEntity<TSchema>>
    > = GraphQLSilk<
      RequiredEntityData<InferEntity<TSchema>>,
      RequiredEntityData<InferEntity<TSchema>>
    >,
  >(
    entitySchemaSilk: TSchema,
    inputSilk?: TInput
  ): FieldOrOperation<undefined, TSchema, TInput, "query">
}
