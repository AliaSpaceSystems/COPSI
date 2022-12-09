FROM httpd:2.4 


RUN echo "RewriteEngine on" >> /usr/local/apache2/htdocs/.htaccess && echo "RewriteCond %{REQUEST_FILENAME} -f [OR]" >> /usr/local/apache2/htdocs/.htaccess && echo "RewriteCond %{REQUEST_FILENAME} -d " >> /usr/local/apache2/htdocs/.htaccess && echo "RewriteRule ^ - [L]" >> /usr/local/apache2/htdocs/.htaccess && echo "RewriteRule ^ index.html [L]" >> /usr/local/apache2/htdocs/.htaccess

COPY ./apache-conf/httpd.conf /usr/local/apache2/conf/httpd.conf

COPY ./dist/copsi/ /usr/local/apache2/htdocs/
