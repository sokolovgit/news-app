export abstract class ToEntityMapper<T, E> {
  abstract toEntity(data: T): E;
}

export abstract class ToSchemaMapper<E, S> {
  abstract toSchema(entity: E): S;
}
