FROM frolvlad/alpine-glibc:alpine-3.18

# Installa dipendenze di sistema e git
RUN apk add --no-cache curl bash ca-certificates libstdc++ libgcc openssl git

# Installa Node.js 20.19.0 precompilato
RUN curl -fsSL https://nodejs.org/dist/v20.19.0/node-v20.19.0-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1 \
  && ln -sf /usr/local/bin/node /usr/bin/node \
  && ln -sf /usr/local/bin/npm /usr/bin/npm \
  && ln -sf /usr/local/bin/npx /usr/bin/npx

# Verifica Node e npm
RUN node -v && npm -v

# Installa Angular CLI globalmente
RUN npm install -g @angular/cli

# Installa Angular Material globalmente (non è molto comune, ma se vuoi)
#RUN npm install -g @angular/material

# Comando di default
CMD ["bash"]
