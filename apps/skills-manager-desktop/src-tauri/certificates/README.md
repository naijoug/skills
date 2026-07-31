# macOS signing material

This directory contains the public certificate used to identify the expected
macOS signing identity for Skills Manager:

- Identity: `Developer ID Application: Honoululu Inc. (N7VU72TZB8)`
- Team ID: `N7VU72TZB8`
- SHA-256 fingerprint: `FC:9B:2A:95:C2:44:8E:54:CA:88:ED:8A:1E:3A:40:04:EE:26:DE:5D:BC:51:9D:58:99:FB:F2:85:09:71:38:F6`
- Valid until: `2031-04-22 12:59:45 UTC`

`Developer_ID_Application_Honoululu_Inc_N7VU72TZB8.cer` is a public DER
certificate exported from the local login keychain. It is safe to keep with the
project, but it does not contain the private key.

The matching private key intentionally remains in the macOS Keychain. Do not
commit `.p12`, `.p8`, private-key, provisioning-profile, or credential files;
the project root `.gitignore` excludes them. On another build machine, import
an encrypted `.p12` containing the matching certificate and private key into a
temporary keychain before packaging.

Build the signed DMG from the repository root:

```sh
./scripts/package-macos.sh
```

For Apple notarization, provide one of Tauri's supported credential sets only
through the environment or the CI secret store:

- `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID`
- or `APPLE_API_KEY`, `APPLE_API_ISSUER`, and `APPLE_API_KEY_PATH`

The signing script works without notarization credentials, but that DMG will
not have an Apple notarization ticket stapled to it.
