const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNotebooks() {
  try {
    console.log('🔍 Debug: Verificando notebooks...\n');

    // Verificar todos os notebooks
    const allNotebooks = await prisma.notebook.findMany({
      select: {
        id: true,
        name: true,
        isDefault: true,
        userId: true,
        createdAt: true
      }
    });

    console.log(`📊 Total de notebooks: ${allNotebooks.length}\n`);

    // Separar por tipo
    const defaultNotebooks = allNotebooks.filter(nb => nb.isDefault === true);
    const customNotebooks = allNotebooks.filter(nb => nb.isDefault !== true);

    console.log(`✅ Notebooks padrão (isDefault=true): ${defaultNotebooks.length}`);
    console.log(`📝 Notebooks customizados (isDefault!=true): ${customNotebooks.length}\n`);

    // Mostrar detalhes dos notebooks padrão
    if (defaultNotebooks.length > 0) {
      console.log('📋 Notebooks padrão:');
      defaultNotebooks.forEach((nb, index) => {
        console.log(`${index + 1}. ${nb.name} (ID: ${nb.id})`);
      });
      console.log('');
    }

    // Mostrar detalhes dos notebooks customizados
    if (customNotebooks.length > 0) {
      console.log('📋 Notebooks customizados:');
      customNotebooks.forEach((nb, index) => {
        console.log(`${index + 1}. ${nb.name} (ID: ${nb.id}, isDefault: ${nb.isDefault})`);
      });
      console.log('');
    }

    // Verificar se há algum notebook sem isDefault definido
    const undefinedNotebooks = allNotebooks.filter(nb => nb.isDefault === null || nb.isDefault === undefined);
    if (undefinedNotebooks.length > 0) {
      console.log(`⚠️ Notebooks com isDefault indefinido: ${undefinedNotebooks.length}`);
      undefinedNotebooks.forEach((nb, index) => {
        console.log(`${index + 1}. ${nb.name} (ID: ${nb.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNotebooks();