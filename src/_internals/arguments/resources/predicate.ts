/* eslint-disable camelcase */
import type { LiteralUnion } from '@/generalTypes'
import type { BLOCKS, ENCHANTMENTS } from '@arguments'
import type {
  NumberOrMinMax, DamageCriterion, EntityCriterion, ItemCriterion, LocationCriterion,
} from './criteria'

type PredicateKind<NAME extends string, VALUES extends Record<string, unknown>> = {
    /** The condition's ID. */
    condition: NAME
} & VALUES

export type ObjectOrArray<T> = T | T[]

export type PredicateCondition = (
  PredicateKind<'minecraft:alternative', {
      /** A list of conditions to join using `or`. */
      terms: PredicateType[]
  }> | PredicateKind<'minecraft:block_state_property', {
      /** A block ID. The test fails if the block doesn't match. */
      block: LiteralUnion<BLOCKS>
      /** A map of block property names to values. All values are strings. The test fails if the block doesn't match. */
      properties?: Map<string, string>
  }> | PredicateKind<'minecraft:damage_source_properties', {
      /** Predicate applied to the damage source. */
      predicate: DamageCriterion
  }> | PredicateKind<'minecraft:entity_properties', {
      /** Specifies the entity to check for the condition.
       * Set to `this` to use the entity that died or the player that gained the advancement, opened the container or broke the block.
       * `killer` for the killer.
       * `killer_player` for a killer that is a player. */
      entity: 'this' | 'killer' | 'killer_player'

      /** Predicate applied to entity. */
      predicate: EntityCriterion
  }> | PredicateKind<'minecraft:entity_scores', {
      /** Specifies the entity to check for the condition.
       * Set to `this` to use the entity that died or the player that gained the advancement, opened the container or broke the block.
       * `killer` for the killer.
       * `killer_player` for a killer that is a player. */
      entity: 'this' | 'killer' | 'killer_player'

      /** Scores to check. All specified scores must pass for the condition to pass.
       * Key name are the objectives, while the value are the required score. */
      scores: Record<string, NumberOrMinMax>
  }> | PredicateKind<'minecraft:inverted', {
      /** The condition to be negated. */
      term: PredicateType
  }> | PredicateKind<'minecraft:killed_by_player', {
      /** If true, the condition passes if killer_player is not available. */
      inverse: boolean
  }> | PredicateKind<'minecraft:location_check', {
      /** Optional offsets to location on X axis. */
      offsetX?: number
      /** Optional offsets to location on Y axis. */
      offsetY?: number
      /** Optional offsets to location on Z axis. */
      offsetZ?: number

      /** Predicate applied to location. */
      predicate: LocationCriterion
  }> | PredicateKind<'minecraft:match_tool', {
      /** Predicate applied to item. */
      predicate: ItemCriterion
  }> | PredicateKind<'minecraft:random_chance', {
      /** Success rate as a number from 0.0 to 1.0. */
      chance: number
  }> | PredicateKind<'minecraft:random_chance', {
      /** Success rate as a number from 0.0 to 1.0. */
      chance: number
  }> | PredicateKind<'minecraft:random_chance_with_looting', {
      /** Base success rate, from 0.0 to 1.0. */
      chance: number

      /** Looting adjustment to the base success rate. Formula is `chance + (looting_level * looting_multiplier)` */
      looting_multiplier: number
  }> | PredicateKind<'minecraft:reference', {
      /** The namespaced ID of the condition (predicate) referred to. A cyclic reference causes a parsing failure. */
      name: string
  }> | PredicateKind<'minecraft:table_bonus', {
      /** Id of enchantment. */
      enchantment: LiteralUnion<ENCHANTMENTS>
      /** List of probabilities for enchantment level, indexed from 0. */
      chances: number[]
  }> | PredicateKind<'minecraft:time_check', {
      /** The time value in ticks. */
      value: NumberOrMinMax

      /** If present, time gets modulo-divided by this value.
       *
       * For example, if set to 24000, value operates on a time period of days. */
      period?: number
  }> | PredicateKind<'minecraft:weather_check', {
      /**  If true, the condition evaluates to true only if it's raining. */
      raining?: boolean

      /** If true, the condition evaluates to true only if it's thundering. */
      thundering?: boolean
  }>
) |never

export type PredicateType = ObjectOrArray<PredicateCondition>
