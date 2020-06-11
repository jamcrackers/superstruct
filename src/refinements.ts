import { Struct } from './struct'
import { toFailures } from './utils'

/**
 * Augment a string or array struct to constrain its length to zero.
 */

export function empty<T extends string | any[]>(S: Struct<T>): Struct<T> {
  return refinement(S, `${S.type} & Empty`, (value) => {
    return value.length === 0
  })
}

/**
 * Augment a string or array struct to constrain its length to being between a
 * minimum and maximum size.
 */

export function length<T extends string | any[]>(
  S: Struct<T>,
  min: number,
  max: number
): Struct<T> {
  return refinement(S, `${S.type} & Length<${min},${max}>`, (value) => {
    return min < value.length && value.length < max
  })
}

/**
 * Augment a number struct match only negative values.
 */

export function negative<T extends number>(S: Struct<T>): Struct<T> {
  return refinement(S, S.type, (value) => {
    return 0 > value
  })
}

/**
 * Augment a number struct match only non-negative values.
 */

export function nonnegative<T extends number>(S: Struct<T>): Struct<T> {
  return refinement(S, S.type, (value) => {
    return 0 <= value
  })
}

/**
 * Augment a number struct match only non-positive values.
 */

export function nonpositive<T extends number>(S: Struct<T>): Struct<T> {
  return refinement(S, S.type, (value) => {
    return 0 >= value
  })
}

/**
 * Refine a string struct to match a specific regexp pattern.
 */

export function pattern<T extends string>(
  S: Struct<T>,
  regexp: RegExp
): Struct<T> {
  return refinement(S, `${S.type} & Pattern<${regexp.source}>`, (value) => {
    return regexp.test(value)
  })
}

/**
 * Augment a number struct match only positive values.
 */

export function positive<T extends number>(S: Struct<T>): Struct<T> {
  return refinement(S, S.type, (value) => {
    return 0 < value
  })
}

/**
 * Augment a `Struct` to add an additional refinement to the validation.
 */

export function refinement<T>(
  struct: Struct<T>,
  type: string,
  refiner: Struct<T>['refiner']
): Struct<T> {
  const fn = struct.refiner
  return new Struct({
    ...struct,
    type,
    *refiner(value, fail) {
      yield* toFailures(fn(value, fail), fail)
      yield* toFailures(refiner(value, fail), fail)
    },
  })
}
