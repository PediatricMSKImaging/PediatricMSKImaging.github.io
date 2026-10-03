# Privileged citation and preview workflows

`on-pull-request.yaml` uses `pull_request_target` with write permissions and
inherits secrets for citation updates. Its citation and preview jobs run only
when the PR head repository matches `github.repository`. Fork PRs, including
closed fork PRs, skip both jobs. A missing or deleted head repository is denied.

`update-citations.yaml` and `build-preview.yaml` independently enforce the same
boundary whenever the caller event contains a PR, including calls from other
workflows. Both check out only `github.repository`: the explicit head branch
(`refs/heads/<head.ref>`) for a same-repository PR, or the repository's default
branch for non-PR events. Scheduled and manual citation updates remain enabled;
manual dispatch does not select another branch's code for checkout.

Same-repository branches remain **trusted code** under this existing workflow:
their citation scripts, dependencies, and Jekyll plugins can execute with write
credentials and, for citation jobs, inherited secrets. This change does not
sandbox collaborators. Restrict who can create or modify branches in this
repository accordingly. Never copy unreviewed fork code onto an eligible branch
merely to obtain a privileged preview.

Same-repository closed PRs still skip citation/build steps and clean previews
from the trusted `gh-pages` branch. Fork-close events do not trigger cleanup;
existing fork previews can be removed by a subsequent permitted preview job's
existing closed-PR cleanup. Preview deployment remains on `gh-pages` under
`preview/pr-<number>`, and citation commits and scheduled update PRs retain their
existing behavior. Manual preview deployment still requires the PR context
expected by the existing preview action; a non-PR dispatch does not supply it.

The preview build passes its base URL through a quoted environment variable,
not expression interpolation into shell source. These restrictions follow
[GitHub's guidance for `pull_request_target`](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target).
