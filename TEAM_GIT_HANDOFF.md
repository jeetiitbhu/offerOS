# OfferOS Team Git Handoff

This project is ready locally on branch `main`.

## Current Repo

- Local folder: `/Users/jeetparekh/Documents/New project`
- Remote: `https://github.com/supriya-reddy-b/proj_bellevue.git`
- Latest local commit: `bf78391 Add offer portal dashboard and chat UI`

## What Is Still Needed

GitHub push access is not configured on this machine. The current HTTPS remote fails because Git cannot read a GitHub username/token locally.

To publish the project for teammates:

1. Make sure the GitHub repo exists and you have write access.
2. Authenticate Git locally with GitHub.
3. Push:

```bash
git push -u origin main
```

4. In GitHub, invite teammates:
   - Open the repository.
   - Go to `Settings` -> `Collaborators and teams`.
   - Add each teammate by GitHub username or email.
   - Give `Write` access so they can push branches.

## Immediate Offline Share Option

A Git bundle has been created:

```bash
offeros-team-share.bundle
```

Teammates can clone it with:

```bash
git clone offeros-team-share.bundle offeros
```

After the GitHub repo is available, they can add the remote:

```bash
git remote add origin https://github.com/supriya-reddy-b/proj_bellevue.git
```
