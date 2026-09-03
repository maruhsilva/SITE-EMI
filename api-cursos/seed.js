const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando a semeadura do banco de dados...');

  // 1. Criptografa a senha '123456'
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 2. Cria o Aluno de Teste
  const user = await prisma.user.upsert({
    where: { email: 'aluno@teste.com' },
    update: {},
    create: {
      name: 'Aluno Teste',
      email: 'aluno@teste.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Usuário criado: ${user.email} / Senha: 123456`);

  // 3. Cria um Curso, um Módulo e uma Aula
  const course = await prisma.course.create({
    data: {
      title: 'Reabilitação Avançada de Coluna',
      description: 'Curso completo sobre tratamento conservador de hérnias e dores lombares.',
      price: 297.00,
      modules: {
        create: [
          {
            title: 'Módulo 1: Fundamentos',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Anatomia da Coluna',
                  videoUrl: 'link_do_vimeo_aqui',
                  order: 1,
                },
                {
                  title: 'Biomecânica Aplicada',
                  videoUrl: 'link_do_vimeo_aqui',
                  order: 2,
                }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`📚 Curso criado: ${course.title}`);

  // 4. Matricula o Aluno no Curso
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId: course.id,
    }
  });
  console.log(`🎓 Aluno matriculado com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });