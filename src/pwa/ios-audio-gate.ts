export interface IphoneNavigatorLike {
  readonly userAgent: string
  readonly standalone?: boolean
}

export interface IphoneAudioGateState {
  readonly installedIphone: boolean
  readonly soundLocked: boolean
  readonly muted: boolean
}

export function isInstalledIphone(
  navigatorLike: IphoneNavigatorLike,
  displayModeStandalone: boolean,
): boolean {
  return (
    /iPhone/i.test(navigatorLike.userAgent) &&
    (navigatorLike.standalone === true || displayModeStandalone)
  )
}

export function shouldOfferIphoneAudioGate({
  installedIphone,
  soundLocked,
  muted,
}: IphoneAudioGateState): boolean {
  return installedIphone && soundLocked && !muted
}
