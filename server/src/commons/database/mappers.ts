import { LoadState } from '../types';

export abstract class ToEntityMapper<
  Schema,
  Entity,
  LoadOptions = Record<string, boolean>,
> {
  /**
   * Maps Schema to Entity
   * @param data - The data to be mapped. Could be a database row or an API response
   * @returns The mapped entity
   */
  abstract toEntity(data: Schema, loadOptions?: LoadOptions): Entity;
}

export abstract class ToSchemaMapper<Entity, Schema> {
  /**
   * Maps Entity to Schema
   * @param entity - The entity to be mapped
   * @returns The mapped schema
   */
  abstract toSchema(entity: Entity): Schema;
}

export abstract class ToLoadOptionsMapper<EntityRelations, LoadOptions> {
  /**
   * Maps Entity Relations to Load Options
   * @param entityRelations - The entity relations to be mapped
   * @returns The mapped load options
   */
  abstract toLoadOptions(entityRelations: EntityRelations): LoadOptions;
}

export function loadRelation<Schema, Entity>(
  condition: boolean | undefined,
  data: Schema | null | undefined,
  mapperFn: (data: Schema) => Entity,
): LoadState<Entity> {
  if (!condition) return LoadState.notLoaded();
  return LoadState.loaded(data ? mapperFn(data) : null);
}
