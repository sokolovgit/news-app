export abstract class ToEntityMapper<S, E> {
  /**
   * Maps Schema to Entity
   * @param data - The data to be mapped. Could be a database row or an API response
   * @returns The mapped entity
   */
  abstract toEntity(data: S): E;
}

export abstract class ToSchemaMapper<E, S> {
  /**
   * Maps Entity to Schema
   * @param entity - The entity to be mapped
   * @returns The mapped schema
   */
  abstract toSchema(entity: E): S;
}
