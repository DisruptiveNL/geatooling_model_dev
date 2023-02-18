rem openssl genrsa -out privateKey.key 1024
rem set OPENSSL_CONF=D:\openssl-3.0.1\openssl-3\openssl.cnf
rem openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out certificate.crt
rem openssl rsa -in privateKey.key -out certificate.pem -pubout -outform PEM
openssl pkcs12 -export -out disruptivesolutions2022.pfx -inkey privateKey.key -in certificate.crt -password pass:disruptive_2022