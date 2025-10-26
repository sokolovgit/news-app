/**
 * Represents the loading state of a relation or collection in a domain entity.
 *
 * This class explicitly tracks whether data has been loaded from the database,
 * preventing ambiguity between "not loaded" and "null/empty".
 *
 * @template T The type of the loaded value
 *
 * @example
 * ```typescript
 * type UserRelations = {
 *   emailVerification: LoadState<EmailVerification>;
 *   posts: LoadState<Post[]>;
 * };
 *
 * // Creating states
 * const notLoaded = LoadState.notLoaded<EmailVerification>();
 * const loaded = LoadState.loaded(emailVerificationEntity);
 * const loadedNull = LoadState.loaded<EmailVerification>(null);
 *
 * // Using states
 * if (state.isLoaded()) {
 *   const value = state.getValue(); // null | EmailVerification
 * }
 *
 * // Get or throw
 * const value = state.getOrThrow('User', 'emailVerification');
 * ```
 */
export class LoadState<T> {
  private constructor(
    private readonly loaded: boolean,
    private readonly value?: T | null,
  ) {}

  /**
   * Creates an unloaded state
   */
  static notLoaded<T>(): LoadState<T> {
    return new LoadState<T>(false);
  }

  /**
   * Creates a loaded state with a value (can be null)
   */
  static loaded<T>(value: T | null): LoadState<T> {
    return new LoadState<T>(true, value);
  }

  /**
   * Checks if the relation data has been loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Gets the value if loaded, returns undefined if not loaded.
   * Use this for safe optional access.
   *
   * @returns The loaded value, null if loaded but empty, or undefined if not loaded
   */
  getValue(): T | null | undefined {
    return this.loaded ? this.value : undefined;
  }

  /**
   * Gets the value if loaded, throws if not loaded.
   * Use this when the relation must be loaded for business logic.
   *
   * @throws {RelationNotLoadedError} if the relation was not loaded
   */
  getOrThrow(entityName: string, relationName: string): T | null {
    if (!this.loaded) {
      throw new RelationNotLoadedError(
        entityName,
        relationName,
        `Load entity with { with${relationName.charAt(0).toUpperCase() + relationName.slice(1)}: true }`,
      );
    }
    return this.value as T | null;
  }

  /**
   * Gets the value if loaded, returns the default value if not loaded
   */
  getOrElse(defaultValue: T | null): T | null {
    return this.loaded ? (this.value as T | null) : defaultValue;
  }

  /**
   * Maps the loaded value through a function.
   * If not loaded, returns notLoaded state.
   */
  map<U>(fn: (value: T | null) => U | null): LoadState<U> {
    if (!this.loaded) {
      return LoadState.notLoaded<U>();
    }
    return LoadState.loaded(fn(this.value as T | null));
  }

  /**
   * Executes a function with the value if loaded.
   * Returns undefined if not loaded.
   */
  ifLoaded<U>(fn: (value: T | null) => U): U | undefined {
    if (!this.loaded) {
      return undefined;
    }
    return fn(this.value as T | null);
  }

  /**
   * Creates a bound accessor that knows the entity and relation names.
   * This avoids repeating entity/relation names in entity getters.
   */
  bindTo(entityName: string, relationName: string) {
    return {
      getOrThrow: (): T | null => this.getOrThrow(entityName, relationName),
      getValue: (): T | null | undefined => this.getValue(),
      getOrElse: (defaultValue: T | null): T | null =>
        this.getOrElse(defaultValue),
      isLoaded: (): boolean => this.isLoaded(),
    };
  }
}

import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class RelationNotLoadedError extends AppError {
  constructor(
    public readonly entityName: string,
    public readonly relationName: string,
    public readonly loadingHint: string,
  ) {
    super(
      `Relation '${relationName}' not loaded on entity '${entityName}'. ${loadingHint}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'LoadState',
      { entityName, relationName, loadingHint },
    );
  }
}
