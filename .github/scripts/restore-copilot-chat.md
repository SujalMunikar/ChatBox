# Restoring Copilot Chat history (Windows)

If you clicked "Clear all workspace chats", restore is only possible from a prior backup or a system snapshot.

What to try, in order:

1) Check if your workspaceStorage folder has usable files
- Current workspace hash folder: look in `%APPDATA%\Code\User\workspaceStorage` for a subfolder whose `workspace.json` contains `d:\chatterwave`.
- Under that folder, see `github.copilot-chat/` files like:
  - `workspace-chunks.json` or `workspace-chunks.db`
  - `local-index.1.db`

2) Restore from Previous Versions / OneDrive / File History
- Right-click these folders > Properties > Previous Versions. Restore/copy a version from before the deletion:
  - `%APPDATA%\Code\User\globalStorage\github.copilot-chat`
  - `%APPDATA%\Code\User\workspaceStorage\<hash>\github.copilot-chat`

3) If you have our repo backups
- Check `.copilot-chat-backups/` at the repo root for a dated snapshot.
- To restore, close VS Code, then copy the backed-up folders back to the exact paths above. Reopen VS Code and open Copilot Chat.

4) If none of the above exist
- The chats are not recoverable.

## Make future loss less likely

Run the backup script (creates `.copilot-chat-backups/`):

```powershell
# From repo root
.\.github\scripts\backup-copilot-chat.ps1 -WorkspaceRoot 'd:\chatterwave' -Zip
```

Schedule it in Task Scheduler (weekly) or add a pre-commit hook if you want snapshots alongside code changes.
