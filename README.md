# companion-surface-mirabox-stream-dock

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

## Version History

### 1.2.0 (2026-03-15)

- feat: add XL
- feat: add individual PIN positions
- feat: add possibility of LED outputs
- feat: add heartbeat to all models to prevent reboot
- fix: rework help file
- chore: update dependency eslint to 9.39.4
- chore: update dependency lint-staged to 16.3.3
- chore: update dependency rimraf to 6.1.3
- chore: update dependency types/node to 22.19.15
- chore: update dependency companion-module/tools to 2.7.1
- chore: update dependency typescript-eslint to 8.57.0

### 1.1.0 (2026-02-07)

- feat: add AJAZZ AKP03E
- feat: add AJAZZ AKP153E
- fix: async jpeg encoding
- fix: simplify packet chunking
- chore: update dependency jpeg-turbo to 3.0.1
- chore: update dependency node-hid to 3.3.0
- chore: update dependency node-gyp to 12.2.0
- chore: update dependency companion-surface/base to 1.1.0
- chore: update dependency companion-module/tools to 2.6.1
- chore: update dependency prettier to 3.8.1
- chore: update dependency typescript-eslint to 8.54.0

### 1.0.2 (2026-01-04)

- fix: fix button rotation
- chore: update manifest

### 1.0.1 (2025-12-22)

- chore: add help file

### 1.0.0 (2025-12-16)

- major: initial release of this module based on the prior code from Companion including support for 239V3, N3 and N4
- feat: add alternative version of N3
- feat: add M18V3
- feat: add Ajazz AKP153
