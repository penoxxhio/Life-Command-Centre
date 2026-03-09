#!/bin/bash
# Cleanup script: removes all legacy v1 files from the repo
# Run locally: git clone the repo, cd into it, then: bash cleanup-legacy-v1.sh

set -e
echo "Removing legacy v1 files and test artifacts..."

# Root legacy files + test artifacts
git rm -f --ignore-unmatch App.tsx cleanup.sh constants.ts delete-legacy.sh \
  index.tsx manifest.json metadata.json netlify.toml package-lock.json \
  tailwind.config.ts test-delete-me.txt test-write-access.txt types.ts \
  cleanup-test.txt cleanup-legacy-v1.sh test-workflow-creation.txt

# Legacy components directory
git rm -rf --ignore-unmatch components/

# Legacy pages directory
git rm -rf --ignore-unmatch pages/

# Legacy services directory
git rm -rf --ignore-unmatch services/

# Legacy scripts and workflows dirs
git rm -rf --ignore-unmatch scripts/
git rm -rf --ignore-unmatch workflows/

# Also clean up .github test file
git rm -f --ignore-unmatch .github/test.txt

# Commit
git commit -m "chore: remove all legacy v1 files

Removed legacy files:
- Root: App.tsx, cleanup.sh, constants.ts, delete-legacy.sh, index.tsx, manifest.json, metadata.json, netlify.toml, package-lock.json, tailwind.config.ts, test-delete-me.txt, test-write-access.txt, types.ts, test-workflow-creation.txt
- components/: Layout.tsx, SetupWizard.tsx, ui/Button.tsx, ui/Card.tsx, ui/ConfirmDialog.tsx, ui/Input.tsx, ui/Modal.tsx, ui/ProgressBar.tsx, ui/Select.tsx
- pages/: Fitness.tsx, Garden.tsx, Home.tsx, Money.tsx, Nutrition.tsx, Settings.tsx
- services/: gardenService.ts, geminiService.ts, healthImportService.ts, notificationService.ts, storageService.ts, streakService.ts
- scripts/test.txt, cleanup.sh, workflows/test.txt, .github/test.txt"

git push origin main
echo "Done! All legacy v1 files removed."
