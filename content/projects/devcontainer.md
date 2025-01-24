+++
title = 'Dev Container Template'
date = 2025-01-23T20:38:16+02:00
draft = false
image = "img/tupper.png"
+++

[Dev Container](https://containers.dev) is an open specification to build and use an OCI container as development environment. It is something I already used in my [Chip 8 emulator](https://github.com/mmartinortiz/chip8emulator) for having a development environment that can be reused across platforms. Lately, I've been looking into [Dev Container templates](https://containers.dev/templates) as a way to have reusable `devcontainer.json` files for new projects. The idea is that while a new project is setup, you can use a template as a starting point, and modify it from there for the new project needs. [My template](https://github.com/mmartinortiz/devcontainer-templates/blob/main/src/python/README.md) contains those features, VS Code extensions and settings that I always set when I start a new project. Making use of it for a new project is as simple as copying the `.devcontainer` folder of the template on your project or just use the [devcontainer-cli](https://github.com/devcontainers/cli):

```bash
devcontainer templates apply --template-id ghcr.io/mmartinortiz/devcontainer-templates/python
```
