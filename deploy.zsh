#!/bin/zsh
set -e

# ── Colors (tput with graceful fallback) ──────────────────────────────────────
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

# ── Logging helpers ───────────────────────────────────────────────────────────
info()  { echo "${BOLD}${GREEN}[✓]${RESET} $*" }
step()  { echo "${BOLD}${YELLOW}[→]${RESET} $*" }
error() { echo "${BOLD}${RED}[✗]${RESET} $*" >&2 }

# ── Cleanup on error ──────────────────────────────────────────────────────────
cleanup() {
  error "Deployment failed. Cleaning up temporary files..."
  [[ -f build.tar.gz ]] && rm -f build.tar.gz
  ssh $REMOTE "rm -f /tmp/build.tar.gz" 2>/dev/null || true
}
trap cleanup ERR

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE=server
REMOTE_DIR=/data/projs/Individual-Website

# ── Build ─────────────────────────────────────────────────────────────────────
step "Clearing previous build..."
npm run clear

step "Building project..."
npm run build
info "Build complete."

# ── Package & Transfer ────────────────────────────────────────────────────────
step "Packaging build files..."
tar czf build.tar.gz build/

step "Transferring build to remote server..."
scp build.tar.gz $REMOTE:/tmp/
rm build.tar.gz
info "Build files transferred."

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ $1 == "--init" ]]; then
  step "Creating remote directory..."
  ssh $REMOTE "mkdir -p $REMOTE_DIR"

  step "Setting up nginx configuration..."
  scp my-website.conf $REMOTE:/etc/nginx/conf.d/my-website.conf
  ssh $REMOTE "zsh -i -c 'chmod 644 /etc/nginx/conf.d/my-website.conf && nginx -t && rlnginx'"
  info "Nginx configured."

  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"
  # ssh $REMOTE "zsh -i -c 'rstmyweb'"
else
  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"
  # ssh $REMOTE "zsh -i -c 'rstmyweb'"
fi

info "Deployment complete. Your website should now be live."
