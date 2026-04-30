import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../admin/firebase.js";

async function buscarProdutos(produtoDigitado){
    //referenciando a tabela de produtos do banco de dados.
    const prodRef = collection(db, "produtos");

    //Criando consulta no servidor
    const consulta =  query(prodRef, where("nome", "===", produtoDigitado));

    try{
        const snapshot = await getDocs(consulta);

        //transformando o retorno num array limpo
        const resultados = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    }catch{
        console.error("Erro na consulta da infraestrutura: ", error);
    }
}