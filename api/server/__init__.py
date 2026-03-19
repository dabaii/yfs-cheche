import pymysql
pymysql.install_as_MySQLdb()

# Bypass MySQL 5.7 version check for Django 4.2+
import django.db.backends.mysql.base
django.db.backends.mysql.base.DatabaseWrapper.check_database_version_supported = lambda *args, **kwargs: None
