FROM nginx:1.21.3

# copy the ssl_config file from cert_conf folder
COPY cert_conf/ssl_config.conf /tmp

# openssl is already provided in nginx docker container 
RUN openssl req -x509 -config /tmp/ssl_config.conf -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/nginx.key -out /etc/ssl/nginx.crt

# enable ssl on nginx
COPY cert_conf/default.conf /etc/nginx/conf.d/

# make client code available to nginx
COPY code/ /usr/share/nginx/html/
