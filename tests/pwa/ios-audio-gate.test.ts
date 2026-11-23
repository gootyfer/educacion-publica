import { describe, expect, it } from "vitest"

import {
  isInstalledIphone,
  shouldOfferIphoneAudioGate,
} from "../../src/pwa/ios-audio-gate"

const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"

describe("iPhone audio gate", () => {
  it("detects an installed iPhone from either standalone signal", () => {
    expect(
      isInstalledIphone({ userAgent: IPHONE_USER_AGENT, standalone: true }, false),
    ).toBe(true)
    expect(isInstalledIphone({ userAgent: IPHONE_USER_AGENT }, true)).toBe(true)
  })

  it("excludes regular Safari, Android, and desktop", () => {
    expect(isInstalledIphone({ userAgent: IPHONE_USER_AGENT }, false)).toBe(false)
    expect(
      isInstalledIphone(
        { userAgent: "Mozilla/5.0 (Linux; Android 15) Chrome/130 Mobile" },
        true,
      ),
    ).toBe(false)
    expect(
      isInstalledIphone({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)" }, true),
    ).toBe(false)
  })

  it("offers the gate only when installed, locked, and audible", () => {
    expect(
      shouldOfferIphoneAudioGate({
        installedIphone: true,
        soundLocked: true,
        muted: false,
      }),
    ).toBe(true)
    expect(
      shouldOfferIphoneAudioGate({
        installedIphone: true,
        soundLocked: false,
        muted: false,
      }),
    ).toBe(false)
    expect(
      shouldOfferIphoneAudioGate({
        installedIphone: true,
        soundLocked: true,
        muted: true,
      }),
    ).toBe(false)
    expect(
      shouldOfferIphoneAudioGate({
        installedIphone: false,
        soundLocked: true,
        muted: false,
      }),
    ).toBe(false)
  })
})
