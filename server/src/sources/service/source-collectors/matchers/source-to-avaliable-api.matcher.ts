import { AvailableApi, PublicSource } from '@/sources/domain/enums';

export class SourceToAvailableApiMatcher {
  public static match(source: PublicSource): AvailableApi | undefined {
    switch (source) {
      case PublicSource.TELEGRAM:
        return AvailableApi.TELEGRAM;
      default:
        return undefined;
    }
  }
}
