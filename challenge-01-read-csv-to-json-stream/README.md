# challenge-01-read-csv-to-json-stream

Neste desafio, faremos o parsing de um CSV para JSON e enviar para uma API externa.

Libs utilizadas:
* http: undici
* parser csv: csvtojson (streams feature)
* memory: climem
* json stringify: fast-json-stringify

## Performance graph

Para visualizar o gráfico de performance, executar a app:

```shell
node -r climem main.js &
```

Monitorar app:
```shell
climem climem-PID
```



Abaixo explicação para melhor entendimento dos dados gerados pelo `climem`:

* rss: Resident Set Size -> total de memória RAM do processo;
* heapTotal: total de memória alocada na heap;
* heapUsed: total de memória usada entre RAM e SWAP na engine Javascript;


## Youtube

* Parte 1: https://youtu.be/VAvIEUbhA6I
* Parte 2: https://youtu.be/XL-lNruUqLA
* Parte 3: https://youtu.be/RXkFfDxMRdQ
