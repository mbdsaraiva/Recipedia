const{PrismaClient} = require('../../generated/prisma');

// cria uma unica instancia do prisma para a aplicacao
const prisma = new PrismaClient({
    log: ['query'],
});

// conectar ao db
async function connectDatabase(){
    try {
        await prisma.$connect();
        console.log('Conectado com sucesso');
    } catch(error){
        console.error('Erro ao conectar ao banco', error);
        process.exit(1);
    }
}

// desconectar do db quando aplicacao fechar
async function disconnectDatabase(){
    await prisma.$disconnect();
    console.log('Desconectado do db')
}   

module.exports={
    prisma,
    connectDatabase,
    disconnectDatabase
};
