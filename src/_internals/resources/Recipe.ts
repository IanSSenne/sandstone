import type { MultiplePlayersArgument, RecipeType } from '@arguments'
import type { Datapack } from '@datapack'

export class Recipe<P1 extends string, P2 extends string, P3 extends string> {
  private datapack

  private path

  recipe

  constructor(datapack: Datapack, name: string, recipe: RecipeType<P1, P2, P3>) {
    this.datapack = datapack
    this.recipe = recipe

    this.path = datapack.getResourcePath(name)

    this.datapack.addResource(name, 'recipes', { recipe })
  }

  get name() {
    return this.path.name
  }

  /** Give this recipe to the given players. */
  give = (targets: MultiplePlayersArgument) => {
    this.datapack.commandsRoot.recipe.give(targets, this.name)
  }

  /** Take this recipe from the given players. */
  take = (targets: MultiplePlayersArgument) => {
    this.datapack.commandsRoot.recipe.take(targets, this.name)
  }
}
