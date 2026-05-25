#!/bin/zsh
set -e

REMOTE=server
REMOTE_DIR=/data/projs/Individual-Website
REMOTE_PROJ_DIR=/data/projs

npm run clear
npm run build

echo "[Info] Build complete. Packaging files for transfer..."

tar czf build.tar.gz build/
scp build.tar.gz $REMOTE:/tmp/
rm build.tar.gz

echo "[Info] Build files transferred to remote server. Starting deployment..."

if [[ $1 == "--init" ]]; then
  # First-time setup: create directories, install dependencies, register services
  ssh $REMOTE "mkdir -p $REMOTE_DIR"
  ssh $REMOTE "zsh -i -c 'cd $REMOTE_PROJ_DIR && \
    gcl git@github.com:Achinoise1/Individual-Website.git'"
  echo "git clone complete. Installing dependencies..."

  # ssh $REMOTE "zsh -i -c 'source ~/.nvm/nvm.sh && cd $REMOTE_DIR && \
  #   npm install'"

  # 本地打包
  tar czf node_modules.tar.gz node_modules/
  scp node_modules.tar.gz $REMOTE:/tmp/
  rm node_modules.tar.gz

  # 远端解压
  ssh $REMOTE "tar xzf /tmp/node_modules.tar.gz -C $REMOTE_DIR && rm /tmp/node_modules.tar.gz"
  echo "[Info] Dependencies installed. Setting up systemd service configuration..."

  scp my-website.service $REMOTE:/tmp/
  ssh $REMOTE "zsh -i -c 'mv /tmp/my-website.service /etc/systemd/system/ && \
    chmod 644 /etc/systemd/system/my-website.service && \
    setdr && \
    systemctl enable my-website.service'"
  echo "[Info] Systemd service registered. Setting up nginx configuration..."

  scp my-website.conf $REMOTE:/etc/nginx/conf.d/my-website.conf
  ssh $REMOTE "zsh -i -c 'chmod 644 /etc/nginx/conf.d/my-website.conf && nginx -t && rstnginx'"
  echo "[Info] Nginx configuration complete. Deploying build files and restarting service..."

  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chmod -R 744 $REMOTE_DIR"
  ssh $REMOTE "zsh -i -c 'rstmyweb'"
  echo "[Info] Deployment complete. Your website should now be live."
else
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "zsh -i -c 'rstmyweb'"
  echo "[Info] Deployment complete. Your website should now be live."
fi
