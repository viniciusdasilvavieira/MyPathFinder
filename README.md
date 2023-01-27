# MyPathFinder
Algorítmo de pathfinding (achar rota mais eficiente) que eu fiz sem referências ou ideias externas/ de terceiros. 
Ótimo exercício de lógica, é bem simples e tem muito o que otimizar ainda, mas estou feliz por estar funcionando.
![pathfinder](https://i.imgur.com/OAmh4he.png)

mouse over + spacebar: indica objetivo (repetível).

A ideia principal foi calcular o caminho reverso, começando do objetivo e preenchendo cada "objeto esquina" aos poucos,
com informação sobre a direção do objetivo, construindo uma guia para o mapa inteiro. Isso involveu inúmeras referencias
à objetos vizinhos e iterações em arrays com várias dimensões.
