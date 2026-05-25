#!/bin/bash
set -e

# ── Colors (tput with graceful fallback) ──────────────────────────────────────
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

# ── Logging helpers ───────────────────────────────────────────────────────────
info()  { echo "${BOLD}${GREEN}[✓]${RESET} $*"; }
step()  { echo "${BOLD}${YELLOW}[→]${RESET} $*"; }
error() { echo "${BOLD}${RED}[✗]${RESET} $*" >&2; }

# ── Cleanup on error ──────────────────────────────────────────────────────────
cleanup() {
  error "Deployment failed. Cleaning up temporary files..."
  [[ -f build.tar.gz ]] && rm -f build.tar.gz
  [[ -f node_modules.tar.gz ]] && rm -f node_modules.tar.gz
  ssh $REMOTE "rm -f /tmp/build.tar.gz /tmp/node_modules.tar.gz" 2>/dev/null || true
}
trap cleanup ERR

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE=server
REMOTE_DIR=/data/projs/Individual-Website
REMOTE_PROJ_DIR=/data/projs

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

  step "Cloning repository on remote..."
  ssh $REMOTE "cd $REMOTE_PROJ_DIR && git clone git@github.com:Achinoise1/Individual-Website.git"
  info "Git clone complete."

  step "Packaging and transferring node_modules..."
  tar czf node_modules.tar.gz node_modules/
  scp node_modules.tar.gz $REMOTE:/tmp/
  rm node_modules.tar.gz
  ssh $REMOTE "tar xzf /tmp/node_modules.tar.gz -C $REMOTE_DIR && rm /tmp/node_modules.tar.gz"
  info "Dependencies installed."

  step "Setting up systemd service..."
  scp my-website.service $REMOTE:/tmp/
  ssh $REMOTE "mv /tmp/my-website.service /etc/systemd/system/ && \
    chmod 644 /etc/systemd/system/my-website.service && \
    systemctl daemon-reload && systemctl enable my-website.service"
  info "Systemd service registered."

  step "Setting up nginx configuration..."
  scp my-website.conf $REMOTE:/etc/nginx/conf.d/my-website.conf
  ssh $REMOTE "chmod 644 /etc/nginx/conf.d/my-website.conf && nginx -t && systemctl restart nginx"
  info "Nginx configured."

  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chmod -R 744 $REMOTE_DIR"
  ssh $REMOTE "systemctl restart my-website.service"
else
  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "systemctl restart my-website.service"
fi

info "Deployment complete. Your website should now be live."
