import { Source } from '@/sources/domain/entities';
import { AvailableApi, PublicSource } from '@/sources/domain/enums';

export class SourceToAvailableApiMatcher {
  public static match(source: Source): AvailableApi | undefined {
    const sourceType = source.getSource();

    switch (sourceType) {
      case PublicSource.TELEGRAM:
        return AvailableApi.TELEGRAM;
      default:
        return undefined;
    }
  }
}
