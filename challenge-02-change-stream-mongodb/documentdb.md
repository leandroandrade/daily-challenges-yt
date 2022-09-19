# Detalhes usando DocumentDB

Segue abaixo alguns detalhes para utilizar change stream no DocumentoDB:

* Habilitar change stream DocumentDB
```javascript
db.adminCommand({
    modifyChangeStreams: 1,    
    database: "",
    collection: "",
    enable: true
});
```

* Utilizar readPreference com o valor primaryPreferred:
```shell
mongodb://user:pass@mongodb:27017/?replicaSet=rs0&readPreference=primaryPreferred&retryWrites=false
```
