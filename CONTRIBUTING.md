# Contributing

Report PingForAI issues and propose changes at https://github.com/ju-sir/PingForAI. Keep API keys, screenshots containing private information, `.env`, and application data out of commits. Run `npm run typecheck`, `npm test`, and `npm run build` for code changes; native input changes also need `npm run test:helper`.

## Contributing improvements upstream

The original project is https://github.com/darrenprx/lolPing. PingForAI was imported into a new repository with its own root commit; it is currently not a GitHub fork and does not share Git history with upstream. Do not attempt to merge its complete main branch into upstream.

To propose an improvement, create a GitHub fork of the original project, clone that fork, add the original repository as `upstream`, and create a feature branch from `upstream/main`. Port the narrowly scoped feature or fix, retaining the upstream brand, license, architecture and tests. For AI assistance, include encrypted credentials, explicit screenshot-upload disclosure, per-signal configuration, and relevant tests; leave PingForAI branding and release settings out of the upstream patch.

Read any contribution instructions present in the upstream repository at the time, run its required checks, then open a pull request from that feature branch to upstream `main`. Maintainers decide whether the feature belongs in their project. Creating a branch in our standalone repository alone does not submit changes to the original author.

GitHub guidance: https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork
